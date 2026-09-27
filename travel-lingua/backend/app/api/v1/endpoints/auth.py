import re
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, Field
from app.core.security import get_current_user
from app.core.db import (
    db_register_user,
    db_save_saved_phrase,
    db_get_saved_phrases,
    db_save_practice_score,
    db_get_practice_history
)

router = APIRouter()


class SignupRequest(BaseModel):
    email: Optional[str] = Field(None, examples=["traveler@example.com"])
    phone_number: Optional[str] = Field(None, examples=["+91 9876543210"])
    username: str = Field(..., examples=["demo_traveler"])
    name: str = Field(..., examples=["Demo Traveler"])
    password: str = Field(..., min_length=8, examples=["StrongPass123!"])
    destination: Optional[str] = Field("Tokyo, Japan", examples=["Tokyo, Japan"])
    learning_language: Optional[str] = Field("Japanese", examples=["Japanese"])


class SignupResponse(BaseModel):
    user_id: str
    username: str
    email: Optional[str] = None
    name: str
    message: str
    status: str
    access_token: Optional[str] = None


class SavePhraseRequest(BaseModel):
    user_id: Optional[str] = None
    original_text: str = Field(..., examples=["Where is the train station?"])
    translated_text: str = Field(..., examples=["駅はどこですか？"])
    romanized: Optional[str] = Field(None, examples=["Eki wa doko desu ka?"])
    notes: Optional[str] = Field(None, examples=["Saved from translation"])
    is_favorite: Optional[bool] = True


class SavePracticeScoreRequest(BaseModel):
    user_id: Optional[str] = None
    target_text: str = Field(..., examples=["こんにちは"])
    overall_score: float = Field(..., examples=[95.0])
    accuracy_rating: str = Field(..., examples=["Excellent"])
    language: Optional[str] = Field("ja", examples=["ja"])


@router.post("/signup", response_model=SignupResponse, summary="Register New User & Save to Supabase DB")
async def register_user(request: SignupRequest):
    """
    Receives user signup credentials and syncs the profile record with Supabase DB.
    Strictly validates that the password is at least 8 characters long.
    """
    if not request.username or not request.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required."
        )

    clean_pwd = request.password.strip()
    if len(clean_pwd) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    user_email = request.email or f"{request.username}@travel-lingua.com"
    result = await db_register_user(
        email=user_email,
        username=request.username,
        name=request.name,
        password=clean_pwd,
        destination=request.destination or "Tokyo, Japan",
        learning_language=request.learning_language or "Japanese"
    )

    return SignupResponse(
        user_id=str(result.get("user_id", f"usr_{request.username}")),
        username=request.username,
        email=user_email,
        name=request.name,
        message="User profile registered successfully",
        status=result.get("status", "success"),
        access_token=result.get("access_token")
    )


@router.get("/me", summary="Get Current Authenticated User")
async def get_me(user: dict = Depends(get_current_user)):
    """
    Extracts Bearer token from HTTP Authorization header, verifies Supabase JWT,
    and returns user identity details.
    """
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "metadata": user.get("user_metadata", {})
    }


@router.post("/saved-phrases", summary="Save Phrase to Supabase Database")
async def save_phrase(
    request: SavePhraseRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Saves phrase to Supabase 'saved_phrases' table, using calling user's Bearer token if present.
    """
    token = authorization.split("Bearer ")[1].strip() if authorization and "Bearer " in authorization else None
    user_id = request.user_id or "anonymous"

    res = await db_save_saved_phrase(
        user_id=user_id,
        original_text=request.original_text,
        translated_text=request.translated_text,
        romanized=request.romanized,
        notes=request.notes,
        is_favorite=request.is_favorite or True,
        token=token
    )
    return {"status": "success", "result": res}


@router.get("/saved-phrases", summary="Get Saved Phrases from Supabase Database")
async def get_saved_phrases(
    user_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Fetches saved phrases for a user from Supabase 'saved_phrases' table.
    """
    token = authorization.split("Bearer ")[1].strip() if authorization and "Bearer " in authorization else None
    phrases = await db_get_saved_phrases(user_id=user_id, token=token)
    return {"user_id": user_id, "count": len(phrases), "phrases": phrases}


@router.post("/practice-history", summary="Save Practice Pronunciation Score to Supabase")
async def save_practice_history(
    request: SavePracticeScoreRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Saves pronunciation evaluation score to Supabase 'practice_history' table.
    """
    token = authorization.split("Bearer ")[1].strip() if authorization and "Bearer " in authorization else None
    user_id = request.user_id or "anonymous"

    ok = await db_save_practice_score(
        user_id=user_id,
        target_text=request.target_text,
        overall_score=request.overall_score,
        accuracy_rating=request.accuracy_rating,
        language=request.language or "ja",
        token=token
    )
    return {"status": "success" if ok else "notice", "saved": ok}


@router.get("/practice-history", summary="Get Practice Pronunciation History from Supabase")
async def get_practice_history(
    user_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Fetches pronunciation practice history for a user from Supabase 'practice_history' table.
    """
    token = authorization.split("Bearer ")[1].strip() if authorization and "Bearer " in authorization else None
    history = await db_get_practice_history(user_id=user_id, token=token)
    return {"user_id": user_id, "count": len(history), "history": history}
