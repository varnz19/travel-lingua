import logging
import hashlib
import numpy as np
from typing import List, Optional

logger = logging.getLogger("travel-lingua.ml.embeddings")


class SentenceVectorizer:
    """
    Multilingual Dense Embedding Generator for Supabase pgvector integration.
    Generates normalized 384-dimensional dense vector embeddings using
    sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 via ONNX runtime (fastembed).
    """
    def __init__(self, model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        self.model_name = model_name
        self._model = None
        self._attempted = False

    def _get_model(self):
        if not self._attempted:
            self._attempted = True
            try:
                from fastembed import TextEmbedding
                self._model = TextEmbedding(model_name=self.model_name)
                logger.info(f"Initialized real fastembed model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Fastembed live model load failed: {e}. Falling back to normalized hash vectors.")
                self._model = None
        return self._model

    def generate_embedding(self, text: str) -> List[float]:
        """
        Encodes a single sentence into a normalized 384-dimensional vector.
        """
        clean_text = text.strip()
        if not clean_text:
            return [0.0] * 384

        model = self._get_model()
        if model is not None:
            try:
                embeddings = list(model.embed([clean_text]))
                if embeddings:
                    vec = embeddings[0]
                    norm = np.linalg.norm(vec)
                    if norm > 0:
                        vec = vec / norm
                    return [float(x) for x in vec.tolist()]
            except Exception as e:
                logger.warning(f"Fastembed encoding exception: {e}")

        # Deterministic 384-dim pseudo-embedding fallback based on text hash
        seed = int(hashlib.md5(clean_text.encode("utf-8")).hexdigest(), 16) % (2**32)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(384).astype(np.float32)
        vec /= np.linalg.norm(vec)
        return [float(x) for x in vec.tolist()]

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Encodes multiple phrases into a list of normalized 384-dimensional vectors."""
        clean_texts = [t.strip() for t in texts]
        model = self._get_model()
        if model is not None:
            try:
                embeddings = list(model.embed(clean_texts))
                results = []
                for vec in embeddings:
                    norm = np.linalg.norm(vec)
                    if norm > 0:
                        vec = vec / norm
                    results.append([float(x) for x in vec.tolist()])
                return results
            except Exception as e:
                logger.warning(f"Fastembed batch encoding exception: {e}")

        return [self.generate_embedding(t) for t in clean_texts]

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
            searchable_text = f"{item.get('english', '')} {item.get('japanese', '')} {item.get('pronunciation', '')} {item.get('audio_text', '')} {item.get('category', '')}"
            cand_vec = np.array(self.generate_embedding(searchable_text), dtype=np.float32)

            # Cosine similarity between normalized vectors
            cosine_sim = float(np.dot(q_vec, cand_vec))

            # Lexical token overlap boost
            cand_tokens = set(searchable_text.lower().split())
            overlap = len(q_tokens.intersection(cand_tokens))
            lexical_boost = 0.15 * overlap if overlap else 0.0

            # Substring exact boost
            substring_boost = 0.2 if q_clean in searchable_text.lower() else 0.0

            total_score = round(float(min(1.0, max(0.0, (cosine_sim + 1.0) / 2.0 * 0.65 + lexical_boost + substring_boost))), 3)

            scored.append({
                **item,
                "similarity_score": total_score
            })

        scored.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored[:top_k]


vectorizer = SentenceVectorizer()


def generate_phrase_vector(phrase: str) -> List[float]:
    """Exposed interface for pgvector pipeline."""
    return vectorizer.generate_embedding(phrase)


def semantic_search_phrases(query: str, candidates: List[dict], top_k: int = 5) -> List[dict]:
    """Exposed semantic search interface for Travel-Lingua knowledge base."""
    return vectorizer.semantic_search(query, candidates, top_k=top_k)
