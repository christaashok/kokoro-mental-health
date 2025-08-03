document.getElementById("send-btn").addEventListener("click", async () => {
    const input = document.getElementById("user-input");
    const message = input.value;
    if (!message.trim()) return;

    addMessageToChat("You", message);
    input.value = ""; // Clear input after sending

    // Suicide check
    if (message.toLowerCase().includes("suicide") || message.toLowerCase().includes("want to die")) {
        window.location.href = "./emergency.html";
        return;
    }

    try {
        // Get chatbot reply
        const chatRes = await fetch("http://localhost:5001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });
        
        if (!chatRes.ok) {
            throw new Error(`Chat API error: ${chatRes.status}`);
        }
        
        const chatData = await chatRes.json();
        addMessageToChat("Kokoro", chatData.response);

        // Get emotion + playlist
        const predictRes = await fetch("http://localhost:5001/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message })
        });
        
        if (!predictRes.ok) {
            throw new Error(`Predict API error: ${predictRes.status}`);
        }
        
        const predictData = await predictRes.json();

        // Display emotion detected
        if (predictData.success && predictData.emotion_analysis) {
            addMessageToChat("Kokoro", `I detected you're feeling: ${predictData.emotion_analysis.emotion}`);
        }

        // Add music recommendations
        if (predictData.success && predictData.music_recommendations && predictData.music_recommendations.tracks) {
            addMessageToChat("Kokoro", "Here are some music recommendations that might help:");
            displayMusicRecommendations(predictData.music_recommendations.tracks);
        }
    } catch (err) {
        console.error("Error:", err);
        addMessageToChat("Error", `Something went wrong: ${err.message}. Make sure the server is running on port 5001.`);
    }
});

// Initialize the Spotify player with placeholder
document.addEventListener("DOMContentLoaded", () => {
    displayMusicRecommendations(null);
});

// Add Enter key support
document.getElementById("user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("send-btn").click();
    }
});

function addMessageToChat(sender, message) {
    const chatLog = document.getElementById("chat-log");
    const msg = document.createElement("div");
    
    // Add retro styling and icons based on sender
    let icon = "";
    let senderClass = "";
    
    if (sender === "You") {
        icon = "👤";
        senderClass = "user-message";
    } else if (sender === "Kokoro") {
        icon = "🤖";
        senderClass = "bot-message";
    } else if (sender === "Error") {
        icon = "⚠️";
        senderClass = "error-message";
    }
    
    msg.className = senderClass;
    msg.innerHTML = `<strong>${icon} ${sender.toUpperCase()}:</strong> ${message}`;
    
    // Add with animation
    msg.style.opacity = "0";
    msg.style.transform = "translateX(-10px)";
    chatLog.appendChild(msg);
    
    // Trigger animation
    setTimeout(() => {
        msg.style.transition = "all 0.3s ease";
        msg.style.opacity = "1";
        msg.style.transform = "translateX(0)";
    }, 50);
    
    // Auto-scroll to bottom with smooth animation
    chatLog.scrollTo({
        top: chatLog.scrollHeight,
        behavior: 'smooth'
    });
    
    // Add typewriter effect for bot messages
    if (sender === "Kokoro") {
        typewriterEffect(msg, message, icon);
    }
}

function typewriterEffect(element, fullText, icon) {
    const prefix = `<strong>${icon} KOKORO:</strong> `;
    element.innerHTML = prefix;
    
    let i = 0;
    const speed = 30; // milliseconds per character
    
    function typeChar() {
        if (i < fullText.length) {
            element.innerHTML = prefix + fullText.substring(0, i + 1) + '<span style="animation: blink 1s infinite;">|</span>';
            i++;
            setTimeout(typeChar, speed);
        } else {
            // Remove cursor when done
            element.innerHTML = prefix + fullText;
        }
    }
    
    setTimeout(typeChar, 200); // Delay before starting to type
}

function displayMusicRecommendations(tracks) {
    const player = document.getElementById("spotify-player");
    
    if (!tracks || tracks.length === 0) {
        player.innerHTML = `
            <div style="padding: 25px 20px; height: calc(100% - 25px); margin-top: 25px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--retro-darker); border: 2px solid var(--retro-purple); box-sizing: border-box;">
                <div style="font-family: 'Press Start 2P', cursive; font-size: 12px; color: var(--retro-purple); text-align: center; margin-bottom: 20px;">🎮 AWAITING INPUT</div>
                <div style="font-family: 'VT323', monospace; font-size: 18px; color: var(--retro-light); text-align: center; line-height: 1.4;">Send a message to unlock<br/>your personal soundtrack!</div>
                <div style="margin-top: 20px; font-size: 24px; animation: blink 1s infinite;">♪ ♫ ♪</div>
            </div>
            <style>
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.3; }
                }
            </style>
        `;
        return;
    }

    let trackHtml = `
        <div style="padding: 25px 15px 15px 15px; height: calc(100% - 25px); margin-top: 25px; background: var(--retro-darker); border: 2px solid var(--retro-purple); box-sizing: border-box; display: flex; flex-direction: column;">
            <div style="font-family: 'Press Start 2P', cursive; font-size: 12px; color: var(--retro-purple); text-align: center; margin-bottom: 15px; text-transform: uppercase;">🎵 NOW PLAYING QUEUE</div>
            <div style="flex: 1; overflow-y: auto; padding-right: 5px;">
    `;

    tracks.slice(0, 8).forEach((track, index) => {
        const colors = [
            { bg: 'var(--retro-pink)', text: 'var(--retro-dark)' },
            { bg: 'var(--retro-cyan)', text: 'var(--retro-dark)' },
            { bg: 'var(--retro-lime)', text: 'var(--retro-dark)' },
            { bg: 'var(--retro-orange)', text: 'var(--retro-dark)' }
        ];
        const color = colors[index % colors.length];
        
        trackHtml += `
            <div style="border: 2px solid ${color.bg}; background: var(--retro-dark); margin-bottom: 10px; padding: 10px; box-shadow: 3px 3px 0 var(--retro-shadow); transition: all 0.1s ease; cursor: pointer;" 
                 onmouseover="this.style.transform='translate(-2px, -2px)'; this.style.boxShadow='5px 5px 0 var(--retro-shadow)'" 
                 onmouseout="this.style.transform='translate(0, 0)'; this.style.boxShadow='3px 3px 0 var(--retro-shadow)'">
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${track.image_url ? `
                        <div style="width: 48px; height: 48px; border: 2px solid ${color.bg}; flex-shrink: 0; overflow: hidden; background: var(--retro-darker);">
                            <img src="${track.image_url}" alt="Album" style="width: 100%; height: 100%; object-fit: cover; image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;">
                        </div>
                    ` : `
                        <div style="width: 48px; height: 48px; border: 2px solid ${color.bg}; background: ${color.bg}; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">♪</div>
                    `}
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-family: 'VT323', monospace; font-size: 16px; font-weight: bold; color: ${color.bg}; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase;">${track.name}</div>
                        <div style="font-family: 'VT323', monospace; font-size: 14px; color: var(--retro-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">BY ${track.artist.toUpperCase()}</div>
                        <div style="font-family: 'Press Start 2P', cursive; font-size: 8px; color: var(--retro-cyan); margin-top: 4px;">POPULARITY: ${track.popularity}%</div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 10px; justify-content: space-between; align-items: center;">
                    ${track.external_url ? `
                        <a href="${track.external_url}" target="_blank" style="background: ${color.bg}; color: ${color.text}; padding: 6px 10px; border: 2px solid ${color.bg}; text-decoration: none; font-family: 'Press Start 2P', cursive; font-size: 8px; text-transform: uppercase; transition: all 0.1s ease; display: inline-block;"
                           onmouseover="this.style.background='var(--retro-dark)'; this.style.color='${color.bg}'"
                           onmouseout="this.style.background='${color.bg}'; this.style.color='${color.text}'">🎧 OPEN</a>
                    ` : ''}
                    ${track.preview_url ? `
                        <audio controls style="flex: 1; max-width: 120px; height: 25px; filter: sepia(100%) hue-rotate(270deg) saturate(2);">
                            <source src="${track.preview_url}" type="audio/mpeg">
                        </audio>
                    ` : `
                        <span style="font-family: 'VT323', monospace; font-size: 12px; color: var(--retro-light); opacity: 0.6;">NO PREVIEW</span>
                    `}
                </div>
            </div>
        `;
    });

    trackHtml += `
            </div>
            <div style="margin-top: 10px; font-family: 'Press Start 2P', cursive; font-size: 8px; color: var(--retro-purple); text-align: center; flex-shrink: 0; border-top: 1px solid var(--retro-purple); padding-top: 10px;">
                TRACKS LOADED: ${Math.min(tracks.length, 8)}/${tracks.length}
            </div>
        </div>
    `;

    player.innerHTML = trackHtml;
}

// Keep the old function for backward compatibility
function loadSpotifyPlayer(url) {
    const player = document.getElementById("spotify-player");
    player.innerHTML = `
        <div style="border: 2px solid #1db954; border-radius: 15px; padding: 15px; margin-top: 10px; background-color: #f8f9fa;">
            <h3 style="color: #1db954; margin: 0 0 10px 0; font-size: 18px;">🎵 Recommended Playlist</h3>
            <iframe src="${url}" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Click the play button to start listening</p>
        </div>
    `;
}