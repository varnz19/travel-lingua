import os
import json
import logging
from typing import Dict, Any, List, Optional
from app.services.ml.roleplay.prompts import ROLEPLAY_SCENARIOS

logger = logging.getLogger("travel-lingua.ml.roleplay.agent")


class RoleplayAgent:
    """
    Conversational Roleplay Engine for Travel Scenarios.
    Supports:
    1. Gemini API / Generative LLM inference with structured JSON output
    2. Beginner and Intermediate difficulty level adaptation
    3. In-character persona reply
    4. Grammatical correction and cultural etiquette feedback
    5. Contextual suggested next phrases
    6. Offline state machine fallback
    """

    def __init__(self):
        self._gemini_configured = False
        self._setup_gemini()

    def _setup_gemini(self):
        """Initializes Google Generative AI API client if key is configured."""
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self._gemini_configured = True
                logger.info("Gemini API successfully configured for Conversational Roleplay Agent.")
            except Exception as e:
                logger.warning(f"Could not configure google.generativeai: {e}")
                self._gemini_configured = False
        else:
            self._gemini_configured = False

    def _call_gemini(
        self,
        scenario: Dict[str, Any],
        difficulty: str,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[Dict[str, Any]]:
        """Calls Gemini API for contextual conversational generation."""
        if not self._gemini_configured:
            return None

        try:
            import google.generativeai as genai
            model = genai.GenerativeModel("gemini-1.5-flash")

            diff_config = scenario["difficulty"].get(difficulty, scenario["difficulty"]["beginner"])
            system_prompt = f"""
You are roleplaying as: {scenario['persona']}
Scenario context: {scenario['context']}
Traveler level: {difficulty.upper()}
Level guidelines: {diff_config['rules']}
Cultural tip to weave in when relevant: {scenario.get('cultural_tip', '')}

You MUST respond strictly with a valid JSON object with EXACTLY this structure:
{{
    "reply": "<your in-character reply in Japanese, with English translation if beginner>",
    "feedback_grammar": "<constructive critique of user's message, natural alternatives, politeness guidance>",
    "suggested_next_phrases": [
        "<next phrase 1 with English meaning in parentheses>",
        "<next phrase 2 with English meaning in parentheses>"
    ]
}}
Do NOT include markdown formatting or backticks outside the JSON object.
"""
            # Build conversation context
            history_text = ""
            if conversation_history:
                for turn in conversation_history[-4:]:
                    history_text += f"{turn.get('role', 'user').capitalize()}: {turn.get('content', '')}\n"

            prompt = f"{system_prompt}\n\nRecent History:\n{history_text}\nTraveler: {message}\nAssistant:"
            response = model.generate_content(prompt)
            raw_text = response.text.strip()

            # Clean json fences if present
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
                raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            if "reply" in parsed and "feedback_grammar" in parsed and "suggested_next_phrases" in parsed:
                return parsed

        except Exception as e:
            logger.warning(f"Gemini roleplay generation failed ({e}). Reverting to offline state machine.")

        return None

    def _generate_offline_reply(
        self,
        scenario_id: str,
        difficulty: str,
        message: str
    ) -> Dict[str, Any]:
        """High-quality deterministic state machine for offline travel simulation."""
        scenario = ROLEPLAY_SCENARIOS.get(scenario_id.lower(), ROLEPLAY_SCENARIOS["restaurant"])
        diff_config = scenario["difficulty"].get(difficulty, scenario["difficulty"]["beginner"])
        user_text = message.lower().strip()

        # Restaurant Scenario Intent Handling
        if scenario_id == "restaurant":
            if any(k in user_text for k in ("menu", "menyu", "card")):
                reply = "こちらがメニューでございます。特製味噌ラーメンと豚骨ラーメンが人気です！ (Here is our menu. Our Miso and Tonkotsu ramen are popular!)"
                feedback = "Polite and natural! Adding 'onegaishimasu' (please) makes requests respectful."
                suggestions = [
                    "Miso raamen o hitotsu kudasai (One Miso ramen, please)",
                    "Kore wa karai desu ka? (Is this spicy?)",
                    "Mizu o kudasai (Water, please)"
                ]
            elif any(k in user_text for k in ("water", "drink", "mizu", "nomimono")):
                reply = "はい、お冷でございます。ご注文はお決まりですか？ (Yes, here is cold water. Are you ready to order?)"
                feedback = "Clear request! Saying 'O-hiya' (cold water) is also common in Japanese casual diners."
                suggestions = [
                    "Hai, chuumon shimasu (Yes, I would like to order)",
                    "Mo sukoshi jikan o kudasai (A little more time please)"
                ]
            elif any(k in user_text for k in ("bill", "check", "okaikei", "pay", "ikura")):
                reply = "ありがとうございます。お会計は1,200円になります。Suicaまたはクレジットカードも使えます。 (Thank you. That will be 1,200 yen. IC card or credit card accepted.)"
                feedback = "Excellent! 'Okaikei o onegaishimasu' is the standard polite way to ask for the bill."
                suggestions = [
                    "Kaado de onegaishimasu (By credit card, please)",
                    "Gochisousama deshita (Thank you for the delicious meal)"
                ]
            else:
                reply = f"かしこまりました！'{message}' を承知いたしました。他にご注文はございますか？ (Understood! Is there anything else you would like?)"
                feedback = "Good conversational effort! Practice using 'kudasai' when asking for items."
                suggestions = diff_config["sample_phrases"]

        # Subway Scenario Intent Handling
        elif scenario_id == "subway":
            if any(k in user_text for k in ("shinjuku", "shibuya", "tokyo", "station", "eki", "train")):
                reply = "JR山手線の2番ホームから外回り電車にお乗りください。約15分で到着します。 (Please take the Yamanote Line from Platform 2. Arrives in ~15 mins.)"
                feedback = "Good question! Asking 'Dono densha desu ka?' (Which train is it?) is clear and direct."
                suggestions = [
                    "Koko kara nan-pun kakarimasu ka? (How many minutes does it take?)",
                    "Arigatou gozaimasu! (Thank you very much!)"
                ]
            elif any(k in user_text for k in ("ticket", "kippu", "suica", "pasmo", "ic")):
                reply = "自動券売機はあちらの改札の右側にございます。英語表記にも切り替え可能です。 (Ticket machines are to the right of ticket gates. English is available.)"
                feedback = "Natural! Mentioning 'Suica' or 'Kippu' immediately alerts station staff to your need."
                suggestions = [
                    "Kippu no kaigata o oshiete kudasai (Please show me how to buy a ticket)",
                    "Koko de Suica wa tsukaemasu ka? (Can I use Suica here?)"
                ]
            else:
                reply = f"駅員でございます。'{message}' についてご案内いたします。どちらの出口に向かわれますか？ (Station staff here. Which exit are you heading to?)"
                feedback = "Good transit communication! Pointing to station maps is very effective in Tokyo."
                suggestions = diff_config["sample_phrases"]

        # Hotel & Taxi fallback
        else:
            reply = f"いらっしゃいませ！'{message}' について承知いたしました。 (Welcome! Understood regarding your request.)"
            feedback = "Polite phrasing. Remember to use 'Arigatou gozaimasu' to conclude interactions smoothly."
            suggestions = diff_config["sample_phrases"]

        return {
            "reply": reply,
            "feedback_grammar": feedback,
            "suggested_next_phrases": suggestions
        }

    def generate_reply(
        self,
        scenario_id: str,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        difficulty: str = "beginner"
    ) -> Dict[str, Any]:
        """
        Generates roleplay reply with structured grammar and cultural feedback.
        Attempts Gemini API call first, falling back to deterministic travel persona.
        """
        valid_diff = difficulty.lower() if difficulty.lower() in ("beginner", "intermediate") else "beginner"
        scenario_key = scenario_id.lower() if scenario_id.lower() in ROLEPLAY_SCENARIOS else "restaurant"
        scenario = ROLEPLAY_SCENARIOS[scenario_key]

        # 1. Try Gemini API
        gemini_result = self._call_gemini(
            scenario=scenario,
            difficulty=valid_diff,
            message=message,
            conversation_history=conversation_history
        )
        if gemini_result:
            return gemini_result

        # 2. Resilient Offline Dialogue State Machine
        return self._generate_offline_reply(
            scenario_id=scenario_key,
            difficulty=valid_diff,
            message=message
        )


roleplay_agent = RoleplayAgent()


def generate_roleplay_reply(
    scenario_id: str,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    difficulty: str = "beginner"
) -> Dict[str, Any]:
    """Person 1 Stable API interface for conversational roleplay."""
    return roleplay_agent.generate_reply(scenario_id, message, conversation_history, difficulty)
