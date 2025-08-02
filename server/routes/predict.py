from flask import request, jsonify
from ml import predict_emotion_and_playlist

def register_routes(app):
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