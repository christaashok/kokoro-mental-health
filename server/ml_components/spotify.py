import os
import requests
import random
import logging

logger = logging.getLogger(__name__)

def get_spotify_token():
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
    if not client_id or not client_secret:
        raise ValueError("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env")

    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret
        }
    )

    if response.status_code == 200:
        return response.json()['access_token']
    else:
        raise Exception(f"Failed to get token: {response.status_code} {response.text}")

def get_music_recommendations(emotion, access_token, min_popularity=30, limit=20):
    headers = {"Authorization": f"Bearer {access_token}"}

    emotion_keywords = {
        "joy": ["happy upbeat", "cheerful fun"],
        "sadness": ["melancholy piano", "heartbreak"],
        "anger": ["aggressive rock", "rage"],
        "fear": ["dark suspense", "anxiety"],
        "surprise": ["energetic unexpected", "shocking"],
        "disgust": ["grunge underground", "dirty raw"],
        "neutral": ["chill ambient", "study focus"]
    }

    keywords = random.choice(emotion_keywords.get(emotion, ["music"]))

    params = {
        "q": keywords,
        "type": "track",
        "limit": 50,
        "offset": random.randint(0, 100)
    }

    response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
    if response.status_code != 200:
        raise Exception(f"Search failed: {response.status_code} {response.text}")

    tracks = response.json()["tracks"]["items"]
    filtered = [t for t in tracks if t.get("popularity", 0) >= min_popularity]
    if not filtered:
        filtered = tracks

    filtered.sort(key=lambda x: x.get("popularity", 0) + random.randint(-10, 10), reverse=True)
    selected = filtered[:limit]

    return [{
        "name": t["name"],
        "artist": t["artists"][0]["name"] if t["artists"] else "Unknown",
        "popularity": t.get("popularity", 0),
        "preview_url": t.get("preview_url"),
        "external_url": t["external_urls"]["spotify"] if "external_urls" in t else None,
        "id": t["id"],
        "image_url": t["album"]["images"][0]["url"] if t.get("album") and t["album"].get("images") else None
    } for t in selected]