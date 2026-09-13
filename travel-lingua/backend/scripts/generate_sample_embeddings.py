#!/usr/bin/env python3
"""
Person 3 — Embedding Generator for Supabase pgvector Integration
Generates exact 384-dimensional dense vectors for core travel phrases
to seed and validate Person 2's `phrase_embeddings` pgvector table.
"""
import sys
import json
from typing import Optional, List, Dict, Any
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.ml.embeddings.vectorizer import generate_phrase_vector

SAMPLE_TRAVEL_PHRASES = [
    {"id": "p01", "category": "dining", "japanese": "メニューをお願いします", "english": "Menu, please"},
    {"id": "p02", "category": "dining", "japanese": "お会計をお願いします", "english": "The bill / check, please"},
    {"id": "p03", "category": "transit", "japanese": "駅はどこですか", "english": "Where is the train station?"},
    {"id": "p04", "category": "transit", "japanese": "切符はどこで買えますか", "english": "Where can I buy a ticket?"},
    {"id": "p05", "category": "emergency", "japanese": "助けてください", "english": "Please help me"},
    {"id": "p06", "category": "general", "japanese": "トイレはどこですか", "english": "Where is the restroom?"},
    {"id": "p07", "category": "general", "japanese": "英語が話せますか", "english": "Do you speak English?"},
    {"id": "p08", "category": "shopping", "japanese": "これはいくらですか", "english": "How much is this?"},
    {"id": "p09", "category": "hotel", "japanese": "予約しています", "english": "I have a reservation"},
    {"id": "p10", "category": "hotel", "japanese": "荷物を預かっていただけますか", "english": "Could you hold my luggage?"},
]


def generate_pgvector_seed_data(output_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    print("=" * 65)
    print(" PERSON 3 -> PERSON 2: 384-DIM PGVECTOR EMBEDDINGS GENERATOR")
    print(" Model: sentence-transformers/all-MiniLM-L6-v2")
    print("=" * 65)

    records = []
    for item in SAMPLE_TRAVEL_PHRASES:
        # Generate 384-dim normalized vector
        vec = generate_phrase_vector(item["japanese"])
        assert len(vec) == 384, f"Vector dimension mismatch: expected 384, got {len(vec)}"

        record = {
            "phrase_id": item["id"],
            "category": item["category"],
            "japanese_text": item["japanese"],
            "english_text": item["english"],
            "dimension": len(vec),
            "embedding": vec,
            "preview": vec[:5]
        }
        records.append(record)
        print(f" [+] Generated vector for '{item['japanese']}' -> Dim: {len(vec)}, preview: {vec[:3]}...")

    output_file = output_path or backend_dir / "scripts" / "sample_phrase_embeddings.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print(f"\n [SUCCESS] Saved {len(records)} sample phrase embeddings to: {output_file}")
    print(" Format: JSON ready to populate Supabase pgvector `phrase_embeddings` table.")
    print("=" * 65)
    return records


if __name__ == "__main__":
    generate_pgvector_seed_data()
