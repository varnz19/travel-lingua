from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class OCRExtractResponse(BaseModel):
    extracted_text: str = Field(..., description="Raw text extracted from image", example="ラーメン ¥850\n餃子 ¥450")
    confidence: float = Field(..., description="Extraction confidence score (0-100)", example=94.5)
    detected_language: Optional[str] = Field(default="ja", description="Detected language code", example="ja")
    translated_text: Optional[str] = Field(default=None, description="Automated translation of detected text", example="Ramen 850 yen\nGyoza 450 yen")
    info: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata such as bounding boxes or detected lines")
