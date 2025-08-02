from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from routes.predict import register_routes as register_predict_routes
from routes.chat import register_routes as register_chat_routes

# Register route modules
register_predict_routes(app)
register_chat_routes(app)

# Optional: Health check route
@app.route("/")
def home():
    return "Kokoro backend is running."

# Run app locally
if __name__ == "__main__":
    app.run(debug=True)