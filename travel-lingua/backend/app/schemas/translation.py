from typing import Optional
from pydantic import BaseModel, Field


class TranslationRequest(BaseModel):
    text: str = Field(..., description="Source text to translate", examples=["Arigatou gozaimasu"])
    source_lang: str = Field(default="ja", description="ISO language code of source text", examples=["ja"])
    target_lang: str = Field(default="en", description="ISO language code of target text", examples=["en"])


class TranslationResponse(BaseModel):
    text: str = Field(..., description="Original input text")
    source_lang: str = Field(..., description="Source language code")
    target_lang: str = Field(..., description="Target language code")
    translated_text: str = Field(..., description="Translated text result", examples=["Thank you very much"])
    pronunciation: Optional[str] = Field(None, description="Phonetic romaji or pronunciation guide", examples=["ah-ree-gah-toh goh-zah-ee-mahs"])
    cached: Optional[bool] = Field(default=False, description="Indicates if result came from Redis cache")
