from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter()


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
