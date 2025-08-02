from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

# Import the ML logic from ml.py
from ml import predict_emotion_and_playlist

# Load environment variables from .env (Spotify + HuggingFace + OpenRouter)
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend JS requests

# Optional: Health check route
@app.route("/")
def home():
    return "Kokoro backend is running."

# Main route: handles emotion detection + playlist selection
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    # Basic validation
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field in request."}), 400

    user_text = data["text"]
    try:
        # Call ML logic to get emotion + Spotify playlist
        result = predict_emotion_and_playlist(user_text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Chat route: interact with OpenRouter chatbot
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field in request."}), 400

    prompt = data["message"]

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek/deepseek-chat-v3-0324:free",
                "messages": [
                    {"role": "system", "content": "You are a friendly mental health chatbot."},
                    {"role": "user", "content": prompt}
                ]
            }
        )

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch chatbot response.", "details": response.text}), 500

        reply = response.json()["choices"][0]["message"]["content"]
        return jsonify({"response": reply})

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Run app locally
if __name__ == "__main__":
    app.run(debug=True)