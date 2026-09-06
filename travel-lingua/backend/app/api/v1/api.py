from fastapi import APIRouter
from app.api.v1.endpoints import auth, translate, practice, roleplay, ocr

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(translate.router, prefix="/translate", tags=["Translation"])
api_router.include_router(practice.router, prefix="/practice", tags=["Pronunciation & Practice"])
api_router.include_router(roleplay.router, prefix="/roleplay", tags=["Conversational Roleplay"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["Camera OCR"])
