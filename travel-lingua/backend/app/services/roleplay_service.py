from typing import Dict, Any
from app.schemas.roleplay import RoleplayRequest, RoleplayResponse


SCENARIO_PROMPTS: Dict[str, Dict[str, Any]] = {
    "restaurant": {
        "intro": "Konnichiwa! Welcome to Ramen Ichiran. Ready to order?",
        "suggestions": ["Menyuu o onegaishimasu (Menu please)", "Osusume wa nan desu ka? (What do you recommend?)", "Mizu o kudasai (Water please)"]
    },
    "taxi": {
        "intro": "Hello! Where would you like to go today?",
        "suggestions": ["Tokyo Eki o onegaishimasu (To Tokyo Station)", "Kuukou o onegaishimasu (To Airport)"]
    },
    "hotel": {
        "intro": "Welcome to Grand Palace Hotel. How can I help you check in?",
        "suggestions": ["Yoyaku shiteimasu (I have a reservation)", "Wi-Fi no pasuwaado wa nan desu ka? (Wi-Fi password?)"]
    }
}


class RoleplayService:
    async def process_chat(self, request: RoleplayRequest) -> RoleplayResponse:
        scenario = SCENARIO_PROMPTS.get(request.scenario_id.lower(), SCENARIO_PROMPTS["restaurant"])
        user_msg = request.message.lower()

        # Conversational dialogue rules
        if "menu" in user_msg:
            reply = "Sure! Here is our English menu. Our Spicy Miso Ramen is very popular!"
            feedback = "Great job asking for the menu! Use 'onegaishimasu' for extra politeness."
            suggestions = ["Spicy Miso Ramen o kudasai (Spicy Miso Ramen, please)", "Mizu o kudasai (Water, please)"]
        elif "water" in user_msg or "drink" in user_msg:
            reply = "Here is your fresh ice water. Anything else to eat?"
            feedback = "Clear request! In Japanese: 'Mizu o kudasai'."
            suggestions = ["Okaikei o onegaishimasu (The bill please)", "Arigatou gozaimasu (Thank you)"]
        elif "bill" in user_msg or "check" in user_msg or "pay" in user_msg:
            reply = "That will be 1,200 yen. We accept cash and IC transport card."
            feedback = "Excellent! Saying 'Okaikei' is the standard way to get your bill."
            suggestions = ["Kurejitto kaado wa tsukaemasu ka? (Can I pay by card?)", "Gochisousama deshita (Thank you for the meal)"]
        else:
            reply = f"I understood: '{request.message}'. Would you like me to prepare that for you right away?"
            feedback = "Good conversational effort! Keep practicing travel phrases."
            suggestions = scenario["suggestions"]

        return RoleplayResponse(
            scenario_id=request.scenario_id,
            reply=reply,
            feedback_grammar=feedback,
            suggested_next_phrases=suggestions
        )


roleplay_service = RoleplayService()
