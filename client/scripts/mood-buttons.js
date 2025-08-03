// Mood mapping for API requests
const moodMapping = {
    'happy': 'joy',
    'sad': 'sadness', 
    'angry': 'anger',
    'numb': 'neutral'
};

let selectedMood = null;

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    displayMusicRecommendations(null);
    setupMoodButtons();
    setupSubmitButton();
});

function setupMoodButtons() {
    const moodButtons = document.querySelectorAll('.retro-emoji-button');
    const emotionInput = document.getElementById('emotion-input');
    
    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove selected class from all buttons
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            button.classList.add('selected');
            
            // Update selected mood and input field
            selectedMood = button.dataset.feeling;
            const emoji = button.dataset.emoji;
            const label = button.querySelector('.emotion-label').textContent;
            
            emotionInput.value = `${emoji} ${label}`;
            
            // Add a retro selection message to mood log
            addMoodMessage("System", `Mood selected: ${emoji} ${label.toUpperCase()}`);
        });
    });
}

function setupSubmitButton() {
    const submitButton = document.getElementById('submit-emotion');
    
    submitButton.addEventListener('click', async () => {
        if (!selectedMood) {
            addMoodMessage("Error", "Please select a mood first!");
            return;
        }
        
        addMoodMessage("System", `Processing your ${selectedMood} mood...`);
        
        try {
            // Call the predict API with the selected mood
            const predictRes = await fetch("http://localhost:5001/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: `I am feeling ${selectedMood}` })
            });
            
            if (!predictRes.ok) {
                throw new Error(`Predict API error: ${predictRes.status}`);
            }
            
            const predictData = await predictRes.json();
            
            // Display success message
            if (predictData.success) {
                addMoodMessage("Kokoro", `Perfect! I've curated music for your ${selectedMood} mood.`);
                
                // Display music recommendations
                if (predictData.music_recommendations && predictData.music_recommendations.tracks) {
                    displayMusicRecommendations(predictData.music_recommendations.tracks);
                } else {
                    addMoodMessage("Kokoro", "I couldn't find specific tracks, but I'm still learning your preferences!");
                }
            } else {
                throw new Error("Failed to get music recommendations");
            }
            
        } catch (err) {
            console.error("Error:", err);
            addMoodMessage("Error", `Something went wrong: ${err.message}. Make sure the server is running on port 5001.`);
        }
    });
}

function addMoodMessage(sender, message) {
    const moodLog = document.getElementById("mood-log");
    const msg = document.createElement("div");
    
    // Add retro styling and icons based on sender
    let icon = "";
    let senderClass = "";
    
    if (sender === "System") {
        icon = "⚙️";
        senderClass = "system-message";
    } else if (sender === "Kokoro") {
        icon = "🤖";
        senderClass = "bot-message";
    } else if (sender === "Error") {
        icon = "⚠️";
        senderClass = "error-message";
    }
    
    msg.className = senderClass;
    msg.innerHTML = `<strong>${icon} ${sender.toUpperCase()}:</strong> ${message}`;
    msg.style.margin = "10px 0";
    msg.style.padding = "12px 16px";
    msg.style.border = "2px solid";
    msg.style.fontFamily = "'VT323', monospace";
    msg.style.fontSize = "16px";
    msg.style.lineHeight = "1.4";
    msg.style.animation = "messageSlideIn 0.3s ease-out";
    
    // Apply specific styling based on sender
    if (sender === "System") {
        msg.style.background = "var(--retro-lime)";
        msg.style.color = "var(--retro-dark)";
        msg.style.borderColor = "var(--retro-lime)";
        msg.style.boxShadow = "3px 3px 0 var(--retro-shadow)";
        msg.style.textAlign = "center";
    } else if (sender === "Kokoro") {
        msg.style.background = "var(--retro-pink)";
        msg.style.color = "var(--retro-dark)";
        msg.style.borderColor = "var(--retro-pink)";
        msg.style.boxShadow = "3px 3px 0 var(--retro-shadow)";
        msg.style.textAlign = "center";
    } else if (sender === "Error") {
        msg.style.background = "var(--retro-orange)";
        msg.style.color = "var(--retro-dark)";
        msg.style.borderColor = "var(--retro-orange)";
        msg.style.boxShadow = "3px 3px 0 var(--retro-shadow)";
        msg.style.textAlign = "center";
    }
    
    // Replace welcome message if it's the first message
    const welcomeMessage = moodLog.querySelector('.mood-welcome-message');
    if (welcomeMessage) {
        moodLog.innerHTML = '';
        moodLog.style.display = 'block';
        moodLog.style.alignItems = 'flex-start';
        moodLog.style.justifyContent = 'flex-start';
        moodLog.style.padding = '10px';
    }
    
    // Add with animation
    msg.style.opacity = "0";
    msg.style.transform = "translateY(-10px)";
    moodLog.appendChild(msg);
    
    // Trigger animation
    setTimeout(() => {
        msg.style.transition = "all 0.3s ease";
        msg.style.opacity = "1";
        msg.style.transform = "translateY(0)";
    }, 50);
    
    // Auto-scroll to bottom
    moodLog.scrollTo({
        top: moodLog.scrollHeight,
        behavior: 'smooth'
    });
}

function displayMusicRecommendations(tracks) {
    const player = document.getElementById("spotify-player");
    
    if (!tracks || tracks.length === 0) {
        player.innerHTML = `
            <div style="padding: 25px 20px; height: calc(100% - 25px); margin-top: 25px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: var(--retro-darker); border: 2px solid var(--retro-purple); box-sizing: border-box;">
                <div style="font-family: 'Press Start 2P', cursive; font-size: 12px; color: var(--retro-purple); text-align: center; margin-bottom: 20px;">🎵 MOOD PLAYER</div>
                <div style="font-family: 'VT323', monospace; font-size: 18px; color: var(--retro-light); text-align: center; line-height: 1.4;">Select your mood to discover<br/>your perfect playlist!</div>
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
            <div style="font-family: 'Press Start 2P', cursive; font-size: 12px; color: var(--retro-purple); text-align: center; margin-bottom: 15px; text-transform: uppercase;">🎵 MOOD PLAYLIST</div>
            <div style="flex: 1; overflow-y: auto; padding-right: 5px;">
    `;

    tracks.slice(0, 8).forEach((track, index) => {
        const colors = [
            { bg: 'var(--retro-lime)', text: 'var(--retro-dark)' },
            { bg: 'var(--retro-orange)', text: 'var(--retro-dark)' },
            { bg: 'var(--retro-cyan)', text: 'var(--retro-dark)' },
            { bg: 'var(--retro-pink)', text: 'var(--retro-dark)' }
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
                        <div style="font-family: 'Press Start 2P', cursive; font-size: 8px; color: var(--retro-cyan); margin-top: 4px;">MOOD MATCH: ${track.popularity}%</div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 10px; justify-content: space-between; align-items: center;">
                    ${track.external_url ? `
                        <a href="${track.external_url}" target="_blank" style="background: ${color.bg}; color: ${color.text}; padding: 6px 10px; border: 2px solid ${color.bg}; text-decoration: none; font-family: 'Press Start 2P', cursive; font-size: 8px; text-transform: uppercase; transition: all 0.1s ease; display: inline-block;"
                           onmouseover="this.style.background='var(--retro-dark)'; this.style.color='${color.bg}'"
                           onmouseout="this.style.background='${color.bg}'; this.style.color='${color.text}'">🎧 PLAY</a>
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
                MOOD TRACKS: ${Math.min(tracks.length, 8)}/${tracks.length}
            </div>
        </div>
    `;

    player.innerHTML = trackHtml;
}
