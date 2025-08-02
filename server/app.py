from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import the ML logic from ml.py
from ml import predict_emotion_and_playlist

# Load environment variables from .env (Spotify + HuggingFace)
load_dotenv()

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

# Run app locally
if __name__ == "__main__":
    app.run(debug=True)
