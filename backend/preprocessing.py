import re


class TextPreprocessor:
    """Used by BOTH train_model.py and model_utils.py.

    If you change anything here, retrain the model so training and
    prediction stay consistent.
    """

    def __init__(self):
        self.stopwords = {
            "a", "an", "the", "and", "or", "but", "if", "then", "than",
            "this", "that", "these", "those", "is", "are", "was", "were",
            "be", "been", "being", "to", "of", "in", "on", "for", "with",
            "as", "by", "at", "from", "it", "its", "into", "about",
            "after", "before", "during", "between", "through", "over",
            "under", "again", "further", "once", "here", "there", "when",
            "where", "why", "how", "all", "any", "both", "each", "few",
            "more", "most", "other", "some", "such", "no", "nor", "not",
            "only", "own", "same", "so", "very", "can", "will", "just",
            "should", "now",
            # pronouns / auxiliaries / filler common in news text
            "he", "she", "they", "we", "you", "his", "her", "their",
            "them", "our", "has", "have", "had", "do", "does", "did",
            "would", "could", "also", "said", "says", "say", "who",
            "which", "what", "while", "may", "might", "per", "via",
        }

    def preprocess(self, text: str) -> str:
        if not text:
            return ""

        text = text.lower()

        # Remove URLs and HTML tags
        text = re.sub(r"https?://\S+|www\.\S+", " ", text)
        text = re.sub(r"<[^>]*>", " ", text)

        # Possessives and apostrophes: "india's" -> "india", "don't" -> "dont"
        text = re.sub(r"[’']s\b", "", text)
        text = re.sub(r"[’']", "", text)

        # Thousands separators: "1,200" -> "1200"
        text = re.sub(r"(?<=\d),(?=\d{3}\b)", "", text)

        # Drop periods unless they are decimal points ("3.5%").
        # This fixes "growth." and "growth" being different tokens.
        text = re.sub(r"(?<!\d)\.|\.(?!\d)", " ", text)

        # Keep letters, digits, % and decimal points
        text = re.sub(r"[^a-z0-9%.\s]", " ", text)

        text = re.sub(r"\s+", " ", text).strip()

        tokens = [
            token for token in text.split()
            if token not in self.stopwords and len(token) > 1
        ]

        return " ".join(tokens)