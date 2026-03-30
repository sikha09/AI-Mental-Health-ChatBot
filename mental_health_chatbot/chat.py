import torch
import pickle
import os
import re
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
from peft import PeftModel

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# ── Paths ──────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "models", "mental_health_model_final")
EMOTION_DIR = os.path.join(BASE_DIR, "models")

# ── Load chatbot model ─────────────────────────────────
print("Loading chatbot model...") 
try:
    # Try normal loading
    base_model = AutoModelForCausalLM.from_pretrained(
        "microsoft/DialoGPT-medium",
        tie_word_embeddings=False
    )
except Exception as e:
    print(f"Network error while loading base model: {e}")
    print("Attempting to load from local cache...")
    try:
        # Fallback to local files if cached but network resolution fails
        base_model = AutoModelForCausalLM.from_pretrained(
            "microsoft/DialoGPT-medium",
            tie_word_embeddings=False,
            local_files_only=True
        )
    except Exception as local_e:
        print(f"Failed to load model even from local cache: {local_e}")
        print("Please check your internet connection and try again.")
        raise local_e

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "left"

model = PeftModel.from_pretrained(base_model, MODEL_PATH)
model = model.merge_and_unload()
model.eval()
model.to(device)

model.generation_config = GenerationConfig(
    max_new_tokens=80,
    temperature=0.6,
    top_p=0.9,
    do_sample=True,
    pad_token_id=tokenizer.eos_token_id,
    eos_token_id=tokenizer.eos_token_id,
    repetition_penalty=1.2,
    no_repeat_ngram_size=3
)
print("Chatbot model ready!")

# ── Load emotion models ────────────────────────────────
print("Loading emotion models...")
svm_model = None
vectorizer = None
encoder = None
nn_model = None
emotion_models_loaded = False

try:
    svm_path = os.path.join(EMOTION_DIR, "svm_model.pkl")
    vec_path = os.path.join(EMOTION_DIR, "vectorizer.pkl")
    enc_path = os.path.join(EMOTION_DIR, "encoder.pkl")
    nn_path = os.path.join(EMOTION_DIR, "nn_model.pt")

    if all(os.path.exists(p) for p in [svm_path, vec_path, enc_path, nn_path]):
        with open(svm_path, "rb") as f:
            svm_model = pickle.load(f)
        with open(vec_path, "rb") as f:
            vectorizer = pickle.load(f)
        with open(enc_path, "rb") as f:
            encoder = pickle.load(f)

        class EmotionNN(nn.Module):
            def __init__(self, input_dim, num_classes):
                super().__init__()
                self.linear = nn.Linear(input_dim, num_classes)
            def forward(self, x):
                return self.linear(x)

        input_dim = len(vectorizer.get_feature_names_out())
        num_classes = len(encoder.classes_)
        nn_model = EmotionNN(input_dim, num_classes).to(device)
        nn_model.load_state_dict(torch.load(nn_path, map_location=device))
        nn_model.eval()
        emotion_models_loaded = True
        print("Emotion models ready!")
    else:
        print("Emotion model files missing. Falling back to Basic Mode (Normal).")
except Exception as e:
    print(f"Error loading emotion models: {e}. Falling back to Basic Mode (Normal).")

# ── Emotion prompts ────────────────────────────────────
EMOTION_PROMPTS = {
    "Anxiety":             "The user is experiencing anxiety. Help them feel calm and grounded. Use reassuring, simple language. Suggest breathing techniques if appropriate.",
    "Depression":          "The user seems depressed. Be extra warm and validating. Acknowledge their pain, avoid toxic positivity. Gently encourage professional help.",
    "Suicidal":            "The user may be having suicidal thoughts. Respond with extreme care and compassion. Do not lecture. Express genuine concern and strongly encourage professional help.",
    "Stress":              "The user is stressed. Acknowledge their burden, offer practical coping suggestions, and be encouraging.",
    "Bipolar":             "The user may be experiencing bipolar-related feelings. Be non-judgmental, supportive, and recommend professional mental health support.",
    "Personality disorder":"The user may be struggling with emotional regulation. Be patient, calm, and non-judgmental. Avoid making assumptions.",
    "Normal":              "The user is having a casual conversation. Be warm, friendly, and chat naturally. Do not give mental health advice unless specifically asked.",
}

CRISIS_PHRASES = [
    "suicide", "kill myself", "end my life", "self-harm",
    "hurt myself", "want to die", "no reason to live"
]

# ── Core functions ─────────────────────────────────────
def predict_emotion(text):
    if not emotion_models_loaded:
        # Fallback: check for crisis phrases even if models aren't loaded
        if any(phrase in text.lower() for phrase in CRISIS_PHRASES):
            return "Suicidal"
        return "Normal"

    tfidf_text  = vectorizer.transform([text])
    svm_pred    = encoder.inverse_transform(svm_model.predict(tfidf_text))[0]
    text_tensor = torch.tensor(tfidf_text.toarray().astype("float32")).to(device)
    with torch.no_grad():
        nn_pred = encoder.inverse_transform(
            [torch.argmax(nn_model(text_tensor), dim=1).item()]
        )[0]
    final = svm_pred if svm_pred == nn_pred else svm_pred
    
    # Prevent false positives on short casual conversation
    word_count = len(text.split())
    if word_count <= 5 and "Suicidal" not in [svm_pred, nn_pred]:
        final = "Normal"
        
    # If the models disagree wildly, default to Normal to avoid forcing weird advice
    elif svm_pred != nn_pred and "Suicidal" not in [svm_pred, nn_pred]:
        final = "Normal"

    print(f"  SVM: {svm_pred} | NN: {nn_pred} → Final: {final}")
    return final


def build_prompt(user_message, emotion, history):
    system_note = EMOTION_PROMPTS.get(emotion, EMOTION_PROMPTS["Normal"])
    
    # Only forcefully append the clinical warning if there is actual distress
    clinical_warning = "\nAlways recommend professional help for serious mental health concerns." if emotion != "Normal" else ""
    context = f"### System:\nYou are a helpful and compassionate support chatbot. {system_note}{clinical_warning}\n\n"
    
    for turn in history[-2:]:
        context += f"### Human:\n{turn['user']}\n\n### Assistant:\n{turn['bot']}\n\n"
        
    context += f"### Human:\n{user_message}\n\n### Assistant:\n"
    return context

def chat_with_emotion(user_message, history=None):
    if history is None:
        history = []
    emotion = predict_emotion(user_message)
    prompt  = build_prompt(user_message, emotion, history)

    inputs = tokenizer(
        prompt, return_tensors="pt",
        truncation=True, max_length=512
    ).to(device)

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=100,
            temperature=0.85,
            top_p=0.95,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            repetition_penalty=1.25,
            no_repeat_ngram_size=3
        )

    input_len = inputs["input_ids"].shape[1]
    new_tokens = output_ids[0][input_len:]
    response = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

    # If the model still generated a user preface, split and take the Assistant part
    import re
    # Match various forms of the assistant tag and take the content AFTER the LAST one
    chunks = re.split(r'###\s*Assistant:?|Assistant:?|Chatbot:', response, flags=re.IGNORECASE)
    if len(chunks) > 1:
        response = chunks[-1].strip()
        
    # Clean up any leftover prefixes at the very start
    response = re.sub(r'^(User|User:|Bot|Bot:|Chatbot|Chatbot:|Assistant|Assistant:)\s*', '', response, flags=re.IGNORECASE).strip()
    
    # Remove "it's essential to recognize" loops if they somehow persist (aggressive backup)
    response = re.sub(r'(it\'s essential to recognize.*?){2,}', r'\1', response, flags=re.IGNORECASE)

    # Trim incomplete sentence at the end if the model maxes out its tokens
    if not response.endswith(('.', '!', '?')):
        last_punctuation = max(response.rfind('.'), response.rfind('!'), response.rfind('?'))
        if last_punctuation != -1:
            response = response[:last_punctuation+1]

    is_crisis = (
        emotion == "Suicidal" or
        any(phrase in user_message.lower() for phrase in CRISIS_PHRASES)
    )
    if is_crisis:
        response += (
            "\n\n⚠️ I'm genuinely concerned about what you've shared. "
            "Please reach out to a mental health professional immediately. "
            "You are not alone. 💙"
        )

    history.append({"user": user_message, "bot": response, "emotion": emotion})
    return response, emotion, history