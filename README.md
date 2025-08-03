# kokoro-mental-health

# Kokoro - 心

**Kokoro** is a music-based mental health support web app designed to provide comfort and emotional relief through mood-aware music. It supports users through a gentle chatbot, quick mood selection, and emergency resources, using AI emotion detection and Spotify integration.


💖 Inspiration
Kokoro (心) is a Japanese word meaning heart, mind, and spirit.
This app is designed to bring emotional support to people in moments of need — privately, gently, and with the help of music.


---

## 🌟 Features

### 🧠 Chatbot (chatbot.html)
- Starts by asking **“How are you feeling?”**
- Uses Hugging Face emotion detection
- Plays a Spotify playlist that matches the user's emotional state
- Emergency phrases redirect to a crisis support page

### 🎛️ Mood Buttons (mood-buttons.html)
- Users select a mood emoji (😊 😢 😡 😐)
- App instantly starts a playlist that matches their selection

### 📓 Journal
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
| ML Inference  | Hugging Face Transformers |
| Music API     | Spotify Web API |
| Environment   | `.env` variables, Python venv |

---

### 📁 Folder Structure

```
emotion-support-app/
├── client/
│   ├── public/           # HTML files
│   ├── assets/           # Fonts, icons, styling
│   └── scripts/          # chatbot.js, mood-buttons.js
├── server/
│   ├── app.py            # Flask backend
│   ├── ml.py             # Emotion + playlist logic
│   └── .env              # Hugging Face + Spotify tokens
├── docs/                 # Hackathon notes + planning
├── README.md
└── .gitignore
```

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


### 👥 Contributors

- **Christa** – 💌 christa.ashok@gmail.com  🐙 GitHub: [@christaashok](https://github.com/christaashok)  
- **Taemin** – 💌 taemin.chess@gmail.com  🐙 GitHub: [@taemincode](https://github.com/taemincode)  
- **Nandhu** – 💌 s.srinandhini2008@gmail.com  🐙 GitHub: [@Nandhu-007](https://github.com/Nandhu-007)  
- **Aahana** – 💌 aahanajain03@gmail.com  🐙 GitHub: [@aahanajain03](https://github.com/aahanajain03)
