import os
import requests
import random
from dotenv import load_dotenv
from transformers import pipeline
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmotionMusicRecommender:
    """
    A class to handle emotion analysis and music recommendations
    """
    
    def __init__(self):
        """Initialize the recommender with emotion classifier"""
        self.emotion_classifier = None
        self.access_token = None
        self._initialize_classifier()
    
    def _initialize_classifier(self):
        """Initialize the emotion classification model"""
        try:
            self.emotion_classifier = pipeline(
                "text-classification", 
                model="j-hartmann/emotion-english-distilroberta-base", 
                return_all_scores=True
            )
            logger.info("Emotion classifier initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize emotion classifier: {e}")
            raise
    
    def get_spotify_token(self):
        """Get access token from Spotify API"""
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            raise ValueError("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env file")
        
        # Token endpoint
        token_url = "https://accounts.spotify.com/api/token"
        
        # Request headers and data
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret
        }
        
        # Make the request
        response = requests.post(token_url, headers=headers, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data['access_token']
            logger.info("Spotify access token obtained successfully")
            return self.access_token
        else:
            error_msg = f"Failed to get Spotify token: {response.status_code} - {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)

    def analyze_emotion(self, text):
        """
        Analyze emotion from text input
        
        Args:
            text (str): The input text to analyze
            
        Returns:
            dict: Contains emotion label, confidence score, and all scores
        """
        if not self.emotion_classifier:
            raise ValueError("Emotion classifier not initialized")
        
        try:
            results = self.emotion_classifier(text)
            
            # Get the top emotion
            top_emotion = max(results[0], key=lambda x: x['score'])
            
            return {
                "emotion": top_emotion['label'].lower(),
                "confidence": top_emotion['score'],
                "all_scores": {result['label'].lower(): result['score'] for result in results[0]}
            }
        except Exception as e:
            logger.error(f"Error analyzing emotion: {e}")
            raise

    def get_music_recommendations(self, emotion, min_popularity=30, limit=20):
        """
        Get music recommendations based on emotion
        
        Args:
            emotion (str): The detected emotion
            min_popularity (int): Minimum popularity threshold (0-100)
            prefer_popular (bool): Whether to prefer popular tracks
            limit (int): Number of tracks to return
            
        Returns:
            dict: Contains tracks, metadata, and statistics
        """
        if not self.access_token:
            self.get_spotify_token()
        
        headers = {
            "Authorization": f"Bearer {self.access_token}"
        }
        
        # Emotion-based keyword mapping
        emotion_keywords = {
            "joy": [
                "happy upbeat celebration dance party",
                "cheerful positive energetic fun",
                "bright sunny optimistic joyful",
                "festive exciting uplifting motivational",
                "smile laugh good vibes positive"
            ],
            "sadness": [
                "sad melancholy slow emotional ballad",
                "heartbreak lonely depressed tears",
                "blue melancholic sorrowful grieving",
                "pain hurt broken heart loss",
                "cry weep sorrow emotional piano"
            ],
            "anger": [
                "aggressive rock metal intense energetic",
                "rage fury mad angry loud",
                "hardcore punk rebellious fierce",
                "powerful strong intense heavy",
                "fight battle war aggressive drums"
            ],
            "fear": [
                "dark suspense dramatic thriller",
                "scary horror frightening eerie",
                "anxiety tension nervous worried",
                "mysterious haunting creepy spooky",
                "nightmare terror fear dark ambient"
            ],
            "surprise": [
                "energetic exciting dynamic unexpected",
                "shocking amazing incredible wow",
                "sudden burst explosive powerful",
                "unpredictable wild crazy unique",
                "dramatic twist surprising revelation"
            ],
            "disgust": [
                "alternative grunge rebellious underground",
                "dirty raw gritty harsh noise",
                "industrial experimental avant garde",
                "punk rebellious anti establishment",
                "underground alternative indie rock"
            ],
            "neutral": [
                "chill ambient relaxed background",
                "calm peaceful gentle soft",
                "instrumental meditation zen quiet",
                "study focus concentration work",
                "smooth jazz coffee shop lounge"
            ]
        }
        
        # Select keywords for the emotion
        keyword_options = emotion_keywords.get(emotion, ["music"])
        selected_keywords = random.choice(keyword_options)
        
        # Search parameters
        search_url = "https://api.spotify.com/v1/search"
        params = {
            "q": selected_keywords,
            "type": "track",
            "limit": 50,
            "offset": random.randint(0, 100)
        }
        
        logger.info(f"Searching Spotify with keywords: {selected_keywords}")
        
        try:
            response = requests.get(search_url, headers=headers, params=params)
            
            if response.status_code == 401:
                logger.warning("Spotify token expired. Refreshing token and retrying...")
                self.get_spotify_token()
                return self.get_music_recommendations(emotion, min_popularity, limit)

            if response.status_code == 200:
                search_data = response.json()
                tracks = search_data["tracks"]["items"]
                
                # Filter by popularity
                filtered_tracks = [track for track in tracks if track.get('popularity', 0) >= min_popularity]
                
                if not filtered_tracks:
                    logger.warning(f"No tracks found with popularity >= {min_popularity}, lowering threshold")
                    filtered_tracks = [track for track in tracks if track.get('popularity', 0) >= 20]
                
                if not filtered_tracks:
                    logger.warning("Using all tracks regardless of popularity")
                    filtered_tracks = tracks

                if limit > 5:
                    if len(filtered_tracks) < 5:
                        logger.warning(f"Not enough tracks found after filtering, using all {len(limit)} tracks")
                        filtered_tracks = tracks

                # Filter by popularity
                filtered_tracks.sort(key=lambda x: x.get('popularity', 0) + random.randint(-10, 10), reverse=True)
                
                # Limit results
                limited_tracks = filtered_tracks[:limit]
                
                # Format track data
                formatted_tracks = []
                for track in limited_tracks:
                    formatted_tracks.append({
                        "name": track["name"],
                        "artist": track["artists"][0]["name"] if track["artists"] else "Unknown",
                        "popularity": track.get("popularity", 0),
                        "preview_url": track.get("preview_url"),
                        "external_url": track["external_urls"]["spotify"] if "external_urls" in track else None,
                        "id": track["id"],
                        "image_url": track["album"]["images"][0]["url"] if track.get("album") and track["album"].get("images") else None
                    })
                
                avg_popularity = sum(track["popularity"] for track in formatted_tracks) / len(formatted_tracks) if formatted_tracks else 0
                
                return {
                    "success": True,
                    "emotion": emotion,
                    "keywords_used": selected_keywords,
                    "tracks": formatted_tracks,
                    "metadata": {
                        "total_tracks": len(formatted_tracks),
                        "avg_popularity": round(avg_popularity, 1),
                        "min_popularity_filter": min_popularity,
                    }
                }
            else:
                error_msg = f"Spotify search failed: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg
                }
                
        except Exception as e:
            logger.error(f"Error getting music recommendations: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def get_emotion_playlist(self, text, min_popularity=30, limit=20):
        """
        Complete pipeline: analyze emotion and get music recommendations
        
        Args:
            text (str): Input text to analyze
            min_popularity (int): Minimum popularity threshold
            prefer_popular (bool): Whether to prefer popular tracks
            limit (int): Number of tracks to return
            
        Returns:
            dict: Complete response with emotion analysis and music recommendations
        """
        try:
            # Analyze emotion
            emotion_result = self.analyze_emotion(text)
            
            # Get music recommendations
            music_result = self.get_music_recommendations(
                emotion_result["emotion"], 
                min_popularity=min_popularity,
                limit=limit
            )
            
            # Combine results
            return {
                "success": True,
                "input_text": text,
                "emotion_analysis": emotion_result,
                "music_recommendations": music_result
            }
            
        except Exception as e:
            logger.error(f"Error in emotion playlist pipeline: {e}")
            return {
                "success": False,
                "error": str(e)
            }


recommender = EmotionMusicRecommender()

def predict_emotion_and_playlist(text):
    return recommender.get_emotion_playlist(text)
