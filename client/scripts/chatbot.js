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
        const chatRes = await fetch("http://localhost:5000/chat", {
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
    msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatLog.appendChild(msg);
    // Auto-scroll to bottom
    chatLog.scrollTop = chatLog.scrollHeight;
}

function displayMusicRecommendations(tracks) {
    const player = document.getElementById("spotify-player");
    
    if (!tracks || tracks.length === 0) {
        player.innerHTML = `
            <div style="border: 2px solid #1db954; border-radius: 15px; padding: 15px; background-color: #f8f9fa; height: 100%; box-sizing: border-box;">
                <h3 style="color: #1db954; margin: 0 0 10px 0; font-size: 18px; text-align: center;">🎵 Music Recommendations</h3>
                <p style="text-align: center; color: #666;">Send a message to get music recommendations!</p>
            </div>
        `;
        return;
    }

    let trackHtml = `
        <div style="border: 2px solid #1db954; border-radius: 15px; padding: 15px; background-color: #f8f9fa; height: 100%; box-sizing: border-box; display: flex; flex-direction: column;">
            <h3 style="color: #1db954; margin: 0 0 15px 0; font-size: 18px; text-align: center;">🎵 Music Recommendations</h3>
            <div style="flex: 1; overflow-y: auto;">
    `;

    tracks.slice(0, 8).forEach((track, index) => {
        trackHtml += `
            <div style="display: flex; align-items: center; padding: 8px; margin-bottom: 8px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${track.image_url ? `<img src="${track.image_url}" alt="Album cover" style="width: 40px; height: 40px; border-radius: 4px; margin-right: 10px; flex-shrink: 0;">` : ''}
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: bold; color: #333; margin-bottom: 2px; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.name}</div>
                    <div style="color: #666; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">by ${track.artist}</div>
                    <div style="color: #999; font-size: 10px;">♪ ${track.popularity}%</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;">
                    ${track.external_url ? `<a href="${track.external_url}" target="_blank" style="background: #1db954; color: white; padding: 4px 8px; border-radius: 12px; text-decoration: none; font-size: 10px; text-align: center; white-space: nowrap;">Spotify</a>` : ''}
                    ${track.preview_url ? `<audio controls style="width: 80px; height: 25px;"><source src="${track.preview_url}" type="audio/mpeg"></audio>` : '<span style="color: #999; font-size: 9px; text-align: center;">No preview</span>'}
                </div>
            </div>
        `;
    });

    trackHtml += `
            </div>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #666; text-align: center; flex-shrink: 0;">
                Showing ${Math.min(tracks.length, 8)} of ${tracks.length} recommendations
            </p>
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
