import torch
import pickle
import os
import re
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
from peft import PeftModel

# Sentence starts that indicate the model is hallucinating as the PATIENT — reject these
PATIENT_VOICE_STARTS = [
    "i've been", "i have been", "i feel", "i don't", "i do not",
    "i can't", "i cannot", "i'm struggling", "i am struggling",
    "i'm feeling", "i am feeling", "i tried", "i've tried",
    "i want to", "i'm not", "i am not", "my "
]

# Sentence starts that signal an actionable suggestion FROM the therapist
SUGGESTION_STARTERS = [
    "try ", "consider ", "you might ", "one thing ", "it may help",
    "it might help", "it can help", "one way ", "i encourage you",
    "i suggest", "i recommend", "you could ", "start by ",
    "practice ", "reach out", "talk to ", "seek ", "engage in",
    "focus on", "remind yourself", "take a ", "allow yourself",
    "a good way", "one approach", "breathing ", "write down"
]

def is_patient_voice(sentence):
    """Returns True if the model is speaking as the patient (hallucination)."""
    lower = sentence.lower().strip()
    return any(lower.startswith(p) for p in PATIENT_VOICE_STARTS)

def is_suggestion(sentence):
    """Returns True if the sentence starts with an actionable therapist suggestion."""
    lower = sentence.lower().strip()
    
    # ── Rule-Killer ─────────────────────
    # If the sentence contains system prompt keywords, it's NOT a suggestion, it's leakage.
    leakage_keywords = ["rule:", "system:", "human:", "assistant:", "example:", "don't assume"]
    if any(kw in lower for kw in leakage_keywords):
        return False
        
    return any(lower.startswith(kw) for kw in SUGGESTION_STARTERS)

def extract_empathy_and_suggestion(text, empathy_sentences=2):
    """
    Splits the model's raw output into:
      - Empathetic opening (first N therapist-voice sentences)
      - Suggestion (first sentence starting with an actionable keyword)
    Patient-voice hallucinations are filtered out before extraction.
    Ensures that fragmented or partial words at the end are stripped.
    """
    # ── Robust Sentence Splitting ────────
    raw_sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in raw_sentences if s.strip()]

    # Filter out anything that sounds like patient-voice OR system leakage
    leakage_keywords = ["rule:", "system:", "human:", "assistant:", "example:", "don't assume"]
    
    therapist_sentences = [
        s for s in sentences 
        if not is_patient_voice(s) and not any(kw in s.lower() for kw in leakage_keywords)
    ]

    # Fallback if everything got filtered
    if not therapist_sentences:
        if not sentences: return text, None
        therapist_sentences = [sentences[0]]

    # ── Empathy Block ───────────────────
    empathy_part = ' '.join(therapist_sentences[:empathy_sentences])

    # ── Suggestion Block ────────────────
    remaining = therapist_sentences[empathy_sentences:]
    suggestion_part = None
    for sentence in remaining:
        if is_suggestion(sentence):
            suggestion_part = sentence
            break

    # Next best therapist sentence if no keyword match
    if not suggestion_part and remaining:
        suggestion_part = remaining[0]

    # ── Final Cleanup ───────────────────
    # Brutally strip any fragmented or non-punctuated word at the very end
    def clean_sentence(s):
        if not s: return s
        # If the sentence doesn't end with punctuation, it's a fragment; find last punctuation.
        if not re.search(r'[.!?]$', s):
            last_punct = max(s.rfind('.'), s.rfind('!'), s.rfind('?'))
            if last_punct != -1:
                return s[:last_punct+1].strip()
        return s.strip()

    empathy_part = clean_sentence(empathy_part)
    suggestion_part = clean_sentence(suggestion_part)

    return empathy_part, suggestion_part

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# ── Paths ──────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH  = os.path.join(BASE_DIR, "models", "mental_health_model_v2")
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
    "hurt myself", "want to die", "no reason to live", "suicidal",
    "want to kill", "take my life", "i'm done living", "can't go on",
    "not worth living"
]

CRISIS_RESPONSE = (
    "I hear you, and I want you to know that what you're feeling matters deeply. "
    "You are not alone in this.\n\n"
    "\u26a0\ufe0f Please reach out for immediate support:\n"
    "  \ud83d\udcde Nepal Crisis Helpline: 1166\n"
    "  \ud83d\udcde iCall: 9152987821\n"
    "  \ud83d\udcde Vandrevala Foundation: 1860-2662-345 (24/7)\n\n"
    "You deserve help and care. Please talk to someone right now. \ud83d\udc99"
)
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
    clinical_warning = "\nAlways recommend professional help for serious mental health concerns." if emotion != "Normal" else ""
    
    # Robust Few-Shot Examples to anchor the model's behavior.
    context = (
        f"### System: You are a warm and professional mental health support chatbot. "
        f"{system_note}. {clinical_warning}\n\n"
        f"### Human: I'm feeling really anxious.\n"
        f"### Assistant: I'm so sorry to hear you're feeling this level of anxiety right now. It is completely normal for your heart to race when you're under pressure. Try simple deep breathing: inhale for 4 seconds, hold for 7, and exhale for 8.\n\n"
        f"### Human: I feel like a failure.\n"
        f"### Assistant: It sounds like you've been incredibly hard on yourself lately. One difficult period does not define your entire journey or your worth. Try writing down three small things you are proud of from this week.\n\n"
    )
    
    for turn in history[-2:]:
        context += f"### Human:\n{turn['user']}\n\n### Assistant:\n{turn['bot']}\n\n"
        
    context += f"### Human:\n{user_message}\n\n### Assistant:\n"
    return context

def chat_with_emotion(user_message, history=None):
    if history is None:
        history = []
    
    # ── Safety check: bypass model completely for crisis inputs ────────
    if any(phrase in user_message.lower() for phrase in CRISIS_PHRASES):
        response = CRISIS_RESPONSE
        emotion = "Suicidal"
        history.append({"user": user_message, "bot": response, "emotion": emotion})
        return response, emotion, history

    emotion = predict_emotion(user_message)
    prompt  = build_prompt(user_message, emotion, history)

    inputs = tokenizer(
        prompt, return_tensors="pt",
        truncation=True, max_length=512
    ).to(device)

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=250,   # Increased slightly to give enough room for suggestion extraction
            temperature=0.5,      # Lowered for more literal responses
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            repetition_penalty=1.3, # Increased to prevent repetitive patterns/hallucinations
            no_repeat_ngram_size=3
        )

    input_len = inputs["input_ids"].shape[1]
    new_tokens = output_ids[0][input_len:]
    response = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

    # ── Response cleanup ───────────────────────────────────────────────────
    # 1. Strip any leaked prompt tokens
    chunks = re.split(r'###\s*Assistant:?|Assistant:?|Chatbot:', response, flags=re.IGNORECASE)
    if len(chunks) > 1:
        response = chunks[-1].strip()
    chunks = re.split(r'###\s*', response)
    response = chunks[0].strip()

    # 2. Clean up any leftover role prefixes
    response = re.sub(r'^(User|User:|Bot|Bot:|Chatbot|Chatbot:|Assistant|Assistant:)\s*', '', response, flags=re.IGNORECASE).strip()

    # ── Extract structured empathy + suggestion from model's own output ──────
    # This gives us a clean 2-sentence empathy block followed by 1 dataset-learned suggestion.
    empathy, suggestion = extract_empathy_and_suggestion(response, empathy_sentences=2)
    if suggestion:
        response = f"{empathy}\n\n💡 {suggestion}"
    else:
        response = empathy

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