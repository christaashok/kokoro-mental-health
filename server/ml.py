from ml_components.recommender import EmotionMusicRecommender

recommender = EmotionMusicRecommender()

def predict_emotion_and_playlist(text):
    return recommender.get_emotion_playlist(text)