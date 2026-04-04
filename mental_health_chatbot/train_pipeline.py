"""
Mental Health Chatbot - Efficient LoRA Training Pipeline
--------------------------------------------------------
This script fine-tunes the base 'microsoft/DialoGPT-medium' model using the ShenLab/MentalChat16K dataset.
It utilizes PEFT (LoRA) and Hugging Face TRL's SFTTrainer for highly efficient memory usage.

Before running, ensure you install required packages:
pip install transformers peft datasets trl accelerate torch evaluate

If you are training on an Nvidia GPU (Google Colab, AWS), also install:
pip install bitsandbytes
"""

import os

# Increase HuggingFace HTTP timeout to 120 seconds (default is 10s, too short for slow connections)
os.environ["HF_HUB_HTTP_TIMEOUT"] = "120"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"  # Suppress the symlinks warning on Windows
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from transformers.trainer_utils import get_last_checkpoint
from peft import LoraConfig, get_peft_model
from datasets import load_dataset
from trl import SFTTrainer, SFTConfig

# 1. Configuration
MODEL_ID = "microsoft/DialoGPT-medium"
DATASET_ID = "ShenLab/MentalChat16K"
OUTPUT_DIR = "./models/mental_health_model_v2"

def get_device():
    if torch.cuda.is_available():
        return "cuda"
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return "mps" # Apple Silicon
    else:
        return "cpu"

DEVICE = get_device()
print(f"[*] Initializing Training Pipeline on: {DEVICE.upper()}")

# 2. Dataset Loading & Curation
print(f"[*] Downloading dataset: {DATASET_ID}")
# We load the dataset and immediately split it for evaluation
dataset = load_dataset(DATASET_ID, split="train")
dataset = dataset.train_test_split(test_size=0.1, seed=42) # 10% for evaluation to prevent overfitting

# Inspect the column names to dynamically map input/output
columns = dataset["train"].column_names
print(f"[*] Dataset Columns found: {columns}")

# Depending on the dataset structure, we format it into the ### Human / ### Assistant schema
# Assuming columns are typically named "instruction"/"response", "prompt"/"completion", or "text"
# If MentalChat16K specifically uses a different format, adjust the lambda function below.
# Below is a safe heuristic mapping assuming standard 'input' and 'output' columns.

def format_instruction(row):
    """
    Format the dataset row into the training template.
    We train on the FULL response so the model learns both the empathetic
    opening AND the follow-up suggestions from the dataset organically.
    The output structure (short empathy + suggestion) is enforced at inference time.
    """
    user_text = row['input']
    bot_text  = row['output']
    
    prompt  = f"### System:\nYou are a compassionate mental health support chatbot.\n\n"
    prompt += f"### Human:\n{user_text}\n\n### Assistant:\n{bot_text}"
    return prompt

# Optional Data Filtering: Filter out super short answers (e.g., less than 5 words) that don't add value
print("[*] Filtering low-quality conversational rows...")
def filter_short_responses(row):
    # Use 'output' specifically as it contains the chatbot's response in this dataset
    return len(str(row['output']).split()) > 5

dataset = dataset.filter(filter_short_responses)

# Map the dataset into a strict text column
print("[*] Pre-formatting dataset texts...")
dataset = dataset.map(lambda row: {"text": format_instruction(row)})

print(f"[*] Filtered Training set size: {len(dataset['train'])} rows")

# 3. Model & Tokenizer Initialization
print("[*] Loading Tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
tokenizer.pad_token = tokenizer.eos_token # DialoGPT doesn't have a pad token, so we use eos
tokenizer.padding_side = "left"

print("[*] Loading Base Model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
    device_map="auto" if DEVICE == "cuda" else DEVICE,
)

# 4. LoRA Configuration (PEFT)
print("[*] Applying LoRA Adapters...")
peft_config = LoraConfig(
    r=16,            # Rank of the adapter
    lora_alpha=32,   # Scalar multiplier (keep alpha=2*r for stable learning)
    lora_dropout=0.1, # Increased from 0.05 → 0.1 to regularize and prevent overfitting
    target_modules=["c_attn"], # Target modules specifically for GPT2/DialoGPT architecture
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, peft_config)
model.print_trainable_parameters()

# 5. Training Setup
print("[*] Configuring SFTTrainer Workflow...")
training_args = SFTConfig(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    gradient_accumulation_steps=4,   # Simulates effective batch_size=16 (4x4)
    optim="adamw_torch",
    weight_decay=0.01,               # L2 regularization — penalizes large weights to prevent overfitting
    logging_steps=50,
    eval_strategy="steps",
    eval_steps=100,
    save_strategy="steps",
    save_steps=100,
    learning_rate=1e-4,              # Reduced from 2e-4 → 1e-4. Lower LR = slower, more careful learning
    max_grad_norm=0.3,               # Clips gradients to prevent exploding
    num_train_epochs=3,              # Increased to 3 epochs as requested by user
    warmup_ratio=0.05,               # Slightly increased warmup to ease into training more gently
    fp16=True if DEVICE == "cuda" else False,
    bf16=False,
    group_by_length=True,
    load_best_model_at_end=True,     # Automatically restores the checkpoint with the lowest eval_loss
    metric_for_best_model="eval_loss", # Evaluate by val loss, not train loss
    greater_is_better=False,         # Lower eval_loss = better model
    dataset_text_field="text",
    max_length=512,
)

trainer = SFTTrainer(
    model=model,  # Already a PeftModel from get_peft_model() above — do NOT pass peft_config again
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    processing_class=tokenizer,
    args=training_args,
)

# 6. Execution
if __name__ == "__main__":
    print("\n" + "="*50)
    print("[*] Pipeline Setup Complete!")
    print(f"Data mapping: Human -> Assistant")
    print("="*50 + "\n")
    
    # Check for existing training checkpoints to resume
    print("[*] Checking for previous checkpoints...")
    last_checkpoint = get_last_checkpoint(OUTPUT_DIR) if os.path.exists(OUTPUT_DIR) else None
    
    if last_checkpoint is not None:
        print(f"[*] Resuming from checkpoint: {last_checkpoint}")
        trainer.train(resume_from_checkpoint=last_checkpoint)
    else:
        print("[*] Starting clean LoRA Fine-Tuning...")
        trainer.train()
    
    print("[*] Saving highly efficient model...")
    trainer.model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"[*] Training finished successfully! Model saved to {OUTPUT_DIR}")
