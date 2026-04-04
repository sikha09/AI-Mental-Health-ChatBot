from flask import Flask, request, jsonify
from flask_cors import CORS
from chat import chat_with_emotion

app = Flask(__name__)
CORS(app)

# Store sessions in memory (use Redis/DB for production)
sessions = {}

@app.route("/chat", methods=["POST"])
def chat():
    data        = request.get_json()
    user_message = data.get("message", "").strip()
    session_id  = data.get("session_id", "default")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    history = sessions.get(session_id, [])
    response, emotion, history = chat_with_emotion(user_message, history)
    sessions[session_id] = history

    return jsonify({
        "response": response,
        "emotion":  emotion,
        "session_id": session_id
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/reset", methods=["POST"])
def reset():
    data = request.get_json()
    session_id = data.get("session_id", "default")
    sessions.pop(session_id, None)
    return jsonify({"status": "session cleared"})

if __name__ == "__main__":
    print("Starting server on http://localhost:5002")
    app.run(debug=False, host="0.0.0.0", port=5002)