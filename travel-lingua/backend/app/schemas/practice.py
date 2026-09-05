from typing import List, Optional
from pydantic import BaseModel, Field


class WordScore(BaseModel):
    word: str = Field(..., example="Kore")
    score: float = Field(..., description="Accuracy score 0-100 for this specific word", example=95.0)


class PronunciationRequest(BaseModel):
    target_text: str = Field(..., description="Phrase being practiced", example="Kore wa nan desu ka?")
    language: str = Field(default="ja", description="Target language code", example="ja")
    audio: str = Field(..., description="Base64 encoded audio string or audio binary reference")


class PronunciationResponse(BaseModel):
    target_text: str = Field(..., description="Original target sentence")
    language: str = Field(..., description="Language being assessed")
    overall_score: float = Field(..., description="Overall accuracy score 0-100", example=92.5)
    accuracy_rating: str = Field(..., description="Rating classification (e.g., Excellent, Good, Practice Needed)", example="Excellent")
    words: List[WordScore] = Field(default_factory=list, description="Per-word pronunciation breakdown scores")
    mispronounced_phonemes: List[str] = Field(default_factory=list, description="List of identified mispronounced phonemes", example=["desu"])
