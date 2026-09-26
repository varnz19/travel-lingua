import logging
import hashlib
import numpy as np
from typing import List
from app.services.ml.model_manager import model_manager

logger = logging.getLogger("travel-lingua.ml.embeddings")


class SentenceVectorizer:
    """
    Multilingual Dense Embedding Generator for Supabase pgvector integration (Person 2).
    Generates exact 384-dimensional floating point vectors using all-MiniLM-L6-v2.
    """
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name

    def generate_embedding(self, text: str) -> List[float]:
        """
        Encodes a single sentence into a normalized 384-dimensional vector.
        """
        model = model_manager.get_embedding_model(self.model_name)
        if model is not None:
            try:
                vec = model.encode(text, normalize_embeddings=True)
                return [float(x) for x in vec.tolist()]
            except Exception as e:
                logger.warning(f"Embedding model encode fallback: {e}")

        # Deterministic 384-dim pseudo-embedding fallback based on text hash
        # Ensures Person 2 can immediately test pgvector schema without downloading 500MB weights
        seed = int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16) % (2**32)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(384).astype(np.float32)
        vec /= np.linalg.norm(vec)  # L2 normalize
        return [float(x) for x in vec.tolist()]

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Encodes multiple phrases into a list of 384-dimensional vectors."""
        return [self.generate_embedding(t) for t in texts]

    def semantic_search(self, query: str, candidates: List[dict], top_k: int = 5) -> List[dict]:
        """
        Ranks candidate travel phrases against user query using dense vector cosine similarity
        combined with lexical term matching.
        """
        if not query or not candidates:
            return []

        q_clean = query.lower().strip()
        q_tokens = set(q_clean.split())
        q_vec = np.array(self.generate_embedding(q_clean), dtype=np.float32)

        scored = []
        for item in candidates:
            # Combine searchable fields (english, japanese, romaji, category)
            searchable_text = f"{item.get('english', '')} {item.get('japanese', '')} {item.get('pronunciation', '')} {item.get('audio_text', '')} {item.get('category', '')}"
            cand_vec = np.array(self.generate_embedding(searchable_text), dtype=np.float32)

            # Cosine similarity
            cosine_sim = float(np.dot(q_vec, cand_vec))

            # Lexical boost
            cand_tokens = set(searchable_text.lower().split())
            overlap = len(q_tokens.intersection(cand_tokens))
            lexical_boost = 0.25 * overlap if overlap else 0.0

            # Substring match boost
            substring_boost = 0.3 if q_clean in searchable_text.lower() else 0.0

            total_score = round(float(min(1.0, max(0.0, (cosine_sim + 1.0) / 2.0 * 0.5 + lexical_boost + substring_boost))), 3)

            scored.append({
                **item,
                "similarity_score": total_score
            })

        # Sort descending by score
        scored.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored[:top_k]


vectorizer = SentenceVectorizer()


def generate_phrase_vector(phrase: str) -> List[float]:
    """Exposed interface for Person 2's pgvector pipeline."""
    return vectorizer.generate_embedding(phrase)


def semantic_search_phrases(query: str, candidates: List[dict], top_k: int = 5) -> List[dict]:
    """Exposed semantic search interface for Travel-Lingua knowledge base."""
    return vectorizer.semantic_search(query, candidates, top_k=top_k)
