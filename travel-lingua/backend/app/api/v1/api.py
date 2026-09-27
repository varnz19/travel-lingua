from fastapi import APIRouter
from app.api.v1.endpoints import auth, translate, practice, roleplay, ocr, phrases, tts, asr

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(translate.router, prefix="/translate", tags=["Translation"])
api_router.include_router(practice.router, prefix="/practice", tags=["Pronunciation & Practice"])
api_router.include_router(roleplay.router, prefix="/roleplay", tags=["Conversational Roleplay"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["Camera OCR"])
api_router.include_router(phrases.router, prefix="/phrases", tags=["Survival Phrases & Daily Content"])
api_router.include_router(tts.router, prefix="/tts", tags=["Text to Speech"])
api_router.include_router(asr.router, prefix="/asr", tags=["Speech to Text"])

