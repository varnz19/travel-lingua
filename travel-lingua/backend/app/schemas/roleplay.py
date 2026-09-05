from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of sender: 'user' or 'assistant'", example="user")
    content: str = Field(..., description="Message text body", example="Menyuu o onegaishimasu")


class RoleplayRequest(BaseModel):
    scenario_id: str = Field(..., description="Active simulation scenario ID", example="restaurant")
    message: str = Field(..., description="Latest message from user", example="Can I see the English menu?")
    conversation_history: List[ChatMessage] = Field(default_factory=list, description="Previous messages in this session")


class RoleplayResponse(BaseModel):
    scenario_id: str = Field(..., description="Active scenario ID")
    reply: str = Field(..., description="AI roleplay partner reply text", example="Konnichiwa! Here is the English menu. What would you like?")
    feedback_grammar: Optional[str] = Field(None, description="Grammar & politeness feedback on user message", example="Polite and clear request!")
    suggested_next_phrases: List[str] = Field(default_factory=list, description="Suggested response phrases for traveler", example=["Water, please", "What do you recommend?"])
