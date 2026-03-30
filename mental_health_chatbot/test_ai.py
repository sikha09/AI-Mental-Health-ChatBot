import torch
from chat import chat_with_emotion

def test_chatbot():
    test_cases = [
        "I feel very sad and overwhelmed today.",
        "i dont want to live anymore",
        "How can I manage my daily stress?"
    ]
    
    history = []
    
    print("\n--- Chatbot Test Results ---")
    for msg in test_cases:
        print(f"\nUser: {msg}")
        response, emotion, history = chat_with_emotion(msg, history)
        print(f"Emotion detected: {emotion}")
        print(f"Chatbot: {response}")
        print("-" * 30)

if __name__ == "__main__":
    test_chatbot()
