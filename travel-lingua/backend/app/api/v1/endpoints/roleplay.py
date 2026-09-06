from fastapi import APIRouter, HTTPException, status
from app.schemas.roleplay import RoleplayRequest, RoleplayResponse
from app.services.roleplay_service import roleplay_service

router = APIRouter()


@router.post("/chat", response_model=RoleplayResponse, summary="Roleplay AI Dialogue Chat")
async def roleplay_chat(request: RoleplayRequest):
    """
    Receives scenario ID, user message, and conversation history.
    Returns AI partner reply, grammar feedback, and phrase hints.
    """
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User message cannot be empty"
        )
    return await roleplay_service.process_chat(request)
