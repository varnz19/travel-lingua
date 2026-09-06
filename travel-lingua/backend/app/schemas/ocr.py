from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class OCRExtractResponse(BaseModel):
    extracted_text: str = Field(..., description="Raw text extracted from image", examples=["ラーメン ¥850\n餃子 ¥450"])
    confidence: float = Field(..., description="Extraction confidence score (0-100)", examples=[94.5])
    detected_language: Optional[str] = Field(default="ja", description="Detected language code", examples=["ja"])
    translated_text: Optional[str] = Field(default=None, description="Automated translation of detected text", examples=["Ramen 850 yen\nGyoza 450 yen"])
    info: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata such as bounding boxes or detected lines")
