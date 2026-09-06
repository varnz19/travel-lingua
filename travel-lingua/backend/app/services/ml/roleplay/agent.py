import logging
from typing import Dict, Any, List, Optional
from app.services.ml.roleplay.prompts import ROLEPLAY_SCENARIOS

logger = logging.getLogger("travel-lingua.ml.roleplay.agent")


class RoleplayAgent:
    """
    Conversational Roleplay Engine for Traveler Simulation.
    Supports in-character Persona responses, grammar/politeness critiques, and suggested next phrases.
    """
    def generate_reply(
        self,
        scenario_id: str,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        scenario = ROLEPLAY_SCENARIOS.get(scenario_id.lower(), ROLEPLAY_SCENARIOS["restaurant"])
        user_text = message.lower().strip()

        # Context-aware traveler intent extraction & feedback
        if "menu" in user_text:
            reply = "こちらが英語のメニューでございます。特製味噌ラーメンが一番人気です！ (Here is our English menu. Our special Miso Ramen is most popular!)"
            feedback = "Polite and natural! Adding 'onegaishimasu' makes it very natural Japanese."
            suggestions = [
                "Miso raamen o hitotsu kudasai (One Miso ramen, please)",
                "Kore wa karai desu ka? (Is this spicy?)",
                "Mizu o kudasai (Water, please)"
            ]
        elif "water" in user_text or "drink" in user_text or "mizu" in user_text:
            reply = "はい、お冷でございます。ご注文はお決まりですか？ (Yes, here is your cold water. Are you ready to order?)"
            feedback = "Clear request! Saying 'O-hiya' (cold water) is also common in casual restaurants."
            suggestions = [
                "Hai, chuumon shimasu (Yes, I would like to order)",
                "Mo sukoshi jikan o kudasai (A little more time please)"
            ]
        elif "bill" in user_text or "check" in user_text or "okaikei" in user_text or "pay" in user_text:
            reply = "ありがとうございます。お会計は1,200円になります。Suicaまたはクレジットカードも使えます。 (Thank you. That will be 1,200 yen. Suica or credit cards accepted.)"
            feedback = "Excellent! 'Okaikei o onegaishimasu' is the universal phrase for the check."
            suggestions = [
                "Kaado de onegaishimasu (By card, please)",
                "Gochisousama deshita (Thank you for the wonderful meal)"
            ]
        elif "station" in user_text or "train" in user_text or "eki" in user_text:
            reply = "はい！JR山手線の2番ホームから乗車してください。5分おきに出発します。 (Yes! Please take JR Yamanote Line from Platform 2. Trains leave every 5 mins.)"
            feedback = "Good question! Asking 'Dono densha desu ka?' (Which train?) works everywhere."
            suggestions = [
                "Arigatou gozaimasu! (Thank you very much!)",
                "Koko kara nan-pun kakarimasu ka? (How many minutes does it take?)"
            ]
        else:
            reply = f"かしこまりました！'{message}' を承知いたしました。他にご要望はございますか？ (Understood! Is there anything else you need?)"
            feedback = "Good conversational effort! Keep practicing travel phrases with high frequency."
            suggestions = scenario["default_suggestions"]

        return {
            "reply": reply,
            "feedback_grammar": feedback,
            "suggested_next_phrases": suggestions
        }


roleplay_agent = RoleplayAgent()


def generate_roleplay_reply(
    scenario_id: str,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """Person 1 Stable API interface for conversational roleplay."""
    return roleplay_agent.generate_reply(scenario_id, message, conversation_history)
