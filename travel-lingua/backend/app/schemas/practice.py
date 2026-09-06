from typing import List
from pydantic import BaseModel, Field


class WordScore(BaseModel):
    word: str = Field(..., examples=["Kore"])
    score: float = Field(..., description="Accuracy score 0-100 for this specific word", examples=[95.0])


class PronunciationRequest(BaseModel):
    target_text: str = Field(..., description="Phrase being practiced", examples=["Kore wa nan desu ka?"])
    language: str = Field(default="ja", description="Target language code", examples=["ja"])
    audio: str = Field(..., description="Base64 encoded audio string or audio binary reference")


class PronunciationResponse(BaseModel):
    target_text: str = Field(..., description="Original target sentence")
    language: str = Field(..., description="Language being assessed")
    overall_score: float = Field(..., description="Overall accuracy score 0-100", examples=[92.5])
    accuracy_rating: str = Field(..., description="Rating classification (e.g., Excellent, Good, Practice Needed)", examples=["Excellent"])
    words: List[WordScore] = Field(default_factory=list, description="Per-word pronunciation breakdown scores")
    mispronounced_phonemes: List[str] = Field(default_factory=list, description="List of identified mispronounced phonemes", examples=[["desu"]])
