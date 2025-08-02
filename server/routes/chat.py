import os
import requests
from flask import request, jsonify

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def register_routes(app):
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