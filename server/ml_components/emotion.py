from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

def initialize_emotion_classifier():
    try:
        classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=True
        )
        logger.info("Emotion classifier initialized successfully")
        return classifier
    except Exception as e:
        logger.error(f"Failed to initialize emotion classifier: {e}")
        raise

def analyze_emotion(classifier, text):
    results = classifier(text)
    top_emotion = max(results[0], key=lambda x: x['score'])
    return {
        "emotion": top_emotion['label'].lower(),
        "confidence": top_emotion['score'],
        "all_scores": {r['label'].lower(): r['score'] for r in results[0]}
    }