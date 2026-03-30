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
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from transformers.trainer_utils import get_last_checkpoint
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
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
    Format the dataset row into the exact training template the model needs.
    This ensures the model learns to respond underneath the '### Assistant:' token.
    """
    # Fallback heuristic mapping (update 'prompt' and 'response' if the dataset uses different names!)
    user_key = 'prompt' if 'prompt' in row else 'instruction' if 'instruction' in row else columns[0]
    bot_key = 'response' if 'response' in row else 'completion' if 'completion' in row else columns[1]
    
    user_text = row[user_key]
    bot_text = row[bot_key]
    
    # Do not append 'Always recommend professional help' in the strict dataset training because
    # the dataset itself already naturally encodes the professional help logic inside its transcripts.
    prompt = f"### System:\nYou are a compassionate mental health support chatbot.\n\n"
    prompt += f"### Human:\n{user_text}\n\n### Assistant:\n{bot_text}"
    
    # We return the formatted text. The SFTTrainer will automatically handle tokenization.
    return prompt

# Optional Data Filtering: Filter out super short answers (e.g., less than 5 words) that don't add value
print("[*] Filtering low-quality conversational rows...")
def filter_short_responses(row):
    bot_key = 'response' if 'response' in row else 'completion' if 'completion' in row else columns[1]
    return len(str(row[bot_key]).split()) > 5

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
# Use 4-bit Quantization if on CUDA (Nvidia GPUs only) to save massive VRAM
quantization_config = None
if DEVICE == "cuda":
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
    )

model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    quantization_config=quantization_config,
    device_map="auto" if DEVICE == "cuda" else DEVICE,
)

if DEVICE == "cuda":
    model = prepare_model_for_kbit_training(model)

# 4. LoRA Configuration (PEFT)
print("[*] Applying LoRA Adapters...")
peft_config = LoraConfig(
    r=16, # Rank of the adapter
    lora_alpha=32, # Scalar multiplier
    lora_dropout=0.05,
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
    per_device_train_batch_size=4, # Increase if VRAM permits
    per_device_eval_batch_size=4,
    gradient_accumulation_steps=4, # Simulates batch_size=16 (4x4)
    optim="adamw_torch",
    logging_steps=50,
    eval_strategy="steps", # Evaluate every 'eval_steps'
    eval_steps=100,
    save_strategy="steps",
    save_steps=100,
    learning_rate=2e-4, # Peak learning rate for LoRA
    max_grad_norm=0.3, # Prevents exploding gradients
    num_train_epochs=3, # Total passes over the dataset
    warmup_ratio=0.03,
    fp16=True if DEVICE == "cuda" else False, # Mixed precision on Nvidia
    group_by_length=True,
    load_best_model_at_end=True, # Early Stopping Mechanism
    dataset_text_field="text",
    max_length=512,
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    peft_config=peft_config,
    processing_class=tokenizer,
    args=training_args,
)

# 6. Execution
if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 Pipeline Setup Complete!")
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
