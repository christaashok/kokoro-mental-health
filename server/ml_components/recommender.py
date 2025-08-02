import logging
from .emotion import initialize_emotion_classifier, analyze_emotion
from .spotify import get_spotify_token, get_music_recommendations

logger = logging.getLogger(__name__)

class EmotionMusicRecommender:
    def __init__(self):
        self.classifier = initialize_emotion_classifier()
        self.access_token = None

    def get_emotion_playlist(self, text, min_popularity=30, limit=20):
        try:
            emotion_result = analyze_emotion(self.classifier, text)
            if not self.access_token:
                self.access_token = get_spotify_token()
            tracks = get_music_recommendations(
                emotion_result["emotion"],
                self.access_token,
                min_popularity,
                limit
            )
            return {
                "success": True,
                "input_text": text,
                "emotion_analysis": emotion_result,
                "music_recommendations": {
                    "success": True,
                    "emotion": emotion_result["emotion"],
                    "keywords_used": "hidden",
                    "tracks": tracks,
                    "metadata": {
                        "total_tracks": len(tracks),
                        "avg_popularity": round(sum(t["popularity"] for t in tracks) / len(tracks), 1),
                        "min_popularity_filter": min_popularity
                    }
                }
            }
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            return {"success": False, "error": str(e)}