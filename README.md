# Kokoro - 心

**Kokoro** is a music-based mental health support web app designed to provide comfort and emotional relief through mood-aware music. It supports users through a gentle chatbot, quick mood selection, and emergency resources, using AI emotion detection and Spotify integration.

Kokoro (心) is a Japanese word meaning heart, mind, and spirit.
This app is designed to bring emotional support to people in moments of need — privately, gently, and with the help of music.

---

## 🌟 Features

### 🧠 Chatbot (chatbot.html)
- Starts by asking **“How are you feeling?”**
- Uses Hugging Face emotion detection to analyze user input
- Chat responses powered by `deepseek-chat-v3-0324` via OpenRouter API
- Plays a Spotify playlist that matches the user's emotional state
- Emergency phrases redirect to a crisis support page

### 🎛️ Mood Buttons (mood-buttons.html)
- Users select a mood emoji (😊 😢 😡 😐)
- App instantly starts a playlist that matches their selection

### 📓 Journal *(Coming Soon)*
- Mood logs with optional user notes
- Emotion-tagged playlist history

### 🚨 Emergency Support
- Instant redirect if suicidal/self-harm phrases are detected
- Displays international crisis resources

---

## 🛠️ Tech Stack

| Component     | Tech |
|---------------|------|
| Frontend      | HTML, CSS, JavaScript |
| Backend       | Flask (Python) |
| ML Inference  | Hugging Face Transformers (emotion-english-distilroberta-base) |
| Chatbot Model | `deepseek-chat-v3-0324 via OpenRouter API |
| Music API     | Spotify Web API |
| Environment   | `.env` variables, Python venv |

---

## 🚀 Getting Started
1. Clone the repo  
   `git clone https://github.com/christaashok/kokoro-mental-health.git`

2. Navigate into the directory  
   `cd kokoro-mental-health`

3. Create and activate a virtual environment  
   `python -m venv venv`  
   `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)

4. Install dependencies  
   `pip install -r requirements.txt`

5. Add your `.env` file in `server/` with:
   - `OPENROUTER_API_KEY=...`
   - `SPOTIFY_CLIENT_ID=...`
   - `SPOTIFY_CLIENT_SECRET=...`

6. Run the Flask app  
   `python server/app.py`

---

## 📁 Folder Structure
<pre>
emotion-support-app/
├── client/
│   ├── assets/               # Mood icons (happy.png, sad.png, etc.)
│   ├── public/               # HTML files (chatbot, mood-buttons, etc.)
│   ├── scripts/              # JavaScript logic for UI interactions
│   └── styles/               # CSS styling
│       └── styles.css
├── docs/                     # Project planning and slides
│   ├── planning.md
│   └── slides.pdf
├── server/
│   ├── ml_components/        # Emotion detection and recommendation
│   │   ├── emotion.py
│   │   ├── recommender.py
│   │   └── spotify.py
│   ├── routes/               # Flask route handlers
│   │   ├── __init__.py
│   │   ├── chat.py
│   │   └── predict.py
│   ├── .env                  # API keys (not committed)
│   ├── app.py                # Flask server entry point
│   └── ml.py                 # Wrapper for ML logic (legacy or central logic)
├── requirements.txt          # Python dependencies
├── .gitignore
└── README.md
</pre>
---

## 🧪 Known Issues

- App must be run locally — no public deployment yet
- Spotify playback may not work without login or premium account
- No persistent user login or mood history yet
- Mobile UI is not optimized

---

## 🪲 Bug Tracker

Please report bugs via GitHub Issues:  
👉 [https://github.com/christaashok/kokoro-mental-health/issues](https://github.com/christaashok/kokoro-mental-health/issues)

---

## 👥 Contributors

| Name    | Email                          | GitHub              |
|---------|--------------------------------|----------------------|
| Christa | 💌 christa.ashok@gmail.com     | 🐙 [@christaashok](https://github.com/christaashok) |
| Taemin  | 💌 taemin.chess@gmail.com      | 🐙 [@taemincode](https://github.com/taemincode)     |
| Nandhu  | 💌 s.srinandhini2008@gmail.com | 🐙 [@Nandhu-007](https://github.com/Nandhu-007)     |
| Aahana  | 💌 aahanajain03@gmail.com      | 🐙 [@aahanajain03](https://github.com/aahanajain03) |
