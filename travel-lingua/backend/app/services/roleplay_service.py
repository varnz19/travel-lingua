from app.schemas.roleplay import RoleplayRequest, RoleplayResponse
from app.services.ml.roleplay.agent import generate_roleplay_reply


class RoleplayService:
    async def process_chat(self, request: RoleplayRequest) -> RoleplayResponse:
        """
        Connects FastAPI roleplay endpoint to Person 3's Conversational Roleplay Agent.
        """
        history = [{"role": m.role, "content": m.content} for m in request.conversation_history]
        ml_response = generate_roleplay_reply(
            scenario_id=request.scenario_id,
            message=request.message,
            conversation_history=history
        )

        return RoleplayResponse(
            scenario_id=request.scenario_id,
            reply=ml_response["reply"],
            feedback_grammar=ml_response["feedback_grammar"],
            suggested_next_phrases=ml_response["suggested_next_phrases"]
        )


roleplay_service = RoleplayService()
