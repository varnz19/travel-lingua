import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.security import get_current_user
from app.core.db import db_register_user

router = APIRouter()


class SignupRequest(BaseModel):
    email: Optional[str] = Field(None, example="traveler@example.com")
    phone_number: Optional[str] = Field(None, example="+91 9876543210")
    username: str = Field(..., example="demo_traveler")
    name: str = Field(..., example="Demo Traveler")
    password: str = Field(..., min_length=8, example="StrongPass123!")
    destination: Optional[str] = Field("Tokyo, Japan", example="Tokyo, Japan")
    learning_language: Optional[str] = Field("Japanese", example="Japanese")


class SignupResponse(BaseModel):
    user_id: str
    username: str
    email: Optional[str] = None
    name: str
    message: str
    status: str


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
        status=result.get("status", "success")
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
