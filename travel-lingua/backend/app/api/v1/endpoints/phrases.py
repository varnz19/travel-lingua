import random
from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

router = APIRouter()

DAILY_PHRASES = [
    {
        "id": "dp_1",
        "japanese": "Arigatou gozaimasu (ありがとうございます)",
        "english": "Thank you very much (Polite & universal)",
        "pronunciation": "ah-ree-gah-toh goh-zah-ee-mahs",
        "audio_text": "Arigatou gozaimasu",
        "category": "etiquette"
    },
    {
        "id": "dp_2",
        "japanese": "Sumimasen (すみません)",
        "english": "Excuse me / I'm sorry / Pardon me",
        "pronunciation": "soo-mee-mah-sen",
        "audio_text": "Sumimasen",
        "category": "emergency"
    },
    {
        "id": "dp_3",
        "japanese": "Kore o kudasai (これをください)",
        "english": "This one, please (pointing at a menu or item)",
        "pronunciation": "koh-reh oh koo-dah-sah-ee",
        "audio_text": "Kore o kudasai",
        "category": "dining"
    },
    {
        "id": "dp_4",
        "japanese": "Ikura desu ka? (いくらですか？)",
        "english": "How much does this cost?",
        "pronunciation": "ee-koo-rah des-kah",
        "audio_text": "Ikura desu ka",
        "category": "shopping"
    },
    {
        "id": "dp_5",
        "japanese": "Eki wa doko desu ka? (駅はどこですか？)",
        "english": "Where is the train station?",
        "pronunciation": "eh-kee wah doh-koh des-kah",
        "audio_text": "Eki wa doko desu ka",
        "category": "transit"
    }
]

BACKEND_SURVIVAL_CATEGORIES = [
    {
        "id": "introduction",
        "label": "Introduction & Etiquette",
        "icon": "👋",
        "description": "Polite greetings, introductions, saying thank you, and asking if English is spoken.",
        "samplePhrase": "初めまして (Nice to meet you)",
        "phraseCount": 5,
        "packId": "pack_intro"
    },
    {
        "id": "food",
        "label": "Food & Street Snacks",
        "icon": "🍙",
        "description": "Asking for water, identifying dishes, asking about ingredients & allergies.",
        "samplePhrase": "水をください (Water, please)",
        "phraseCount": 5,
        "packId": "pack_food"
    },
    {
        "id": "restaurants",
        "label": "Restaurants & Dining",
        "icon": "🍜",
        "description": "Requesting menus, chef recommendations, paying the bill & tipping etiquette.",
        "samplePhrase": "メニューをお願いします (Menu, please)",
        "phraseCount": 5,
        "packId": "pack_dining"
    },
    {
        "id": "airport",
        "label": "Airport & Transit",
        "icon": "✈️",
        "description": "Boarding gate, baggage claim, taxi stands, train tickets & customs.",
        "samplePhrase": "搭乗口はどこですか？ (Where is the gate?)",
        "phraseCount": 5,
        "packId": "pack_airport"
    },
    {
        "id": "shops",
        "label": "Shops & Payments",
        "icon": "🛍️",
        "description": "Inquiring prices, tax-free discounts, paying by IC card, shopping bags.",
        "samplePhrase": "いくらですか？ (How much is this?)",
        "phraseCount": 5,
        "packId": "pack_shopping"
    },
    {
        "id": "hotel",
        "label": "Hotel & Lodging",
        "icon": "🏨",
        "description": "Check-in, luggage drop, requesting extra towels, Wi-Fi password.",
        "samplePhrase": "チェックインをお願いします (Check-in, please)",
        "phraseCount": 4,
        "packId": "pack_hotel"
    },
    {
        "id": "directions",
        "label": "Directions & Subway",
        "icon": "🗺️",
        "description": "Locating restrooms, train station platforms, finding locations on map.",
        "samplePhrase": "トイレはどこですか？ (Where is the restroom?)",
        "phraseCount": 5,
        "packId": "pack_directions"
    },
    {
        "id": "emergency",
        "label": "Emergency & Medical Help",
        "icon": "🚨",
        "description": "Urgent assistance, police box (koban), lost passport, hospital.",
        "samplePhrase": "助けてください (Please help me)",
        "phraseCount": 5,
        "packId": "pack_emergency"
    }
]


class DailyPhraseResponse(BaseModel):
    id: str
    japanese: str
    english: str
    pronunciation: str
    audio_text: str
    category: str


@router.get("/daily", response_model=DailyPhraseResponse, summary="Get Dynamic Daily Travel Phrase")
async def get_daily_phrase():
    """
    Returns dynamically selected travel phrase of the day from the backend.
    """
    # Deterministic phrase based on day of year
    import datetime
    day_of_year = datetime.datetime.now().timetuple().tm_yday
    phrase = DAILY_PHRASES[day_of_year % len(DAILY_PHRASES)]
    return DailyPhraseResponse(**phrase)


@router.get("/categories", summary="Fetch Survival Categories from Backend")
async def get_categories():
    """
    Returns categorized phrase topics dynamically served by the backend API.
    """
    return {
        "count": len(BACKEND_SURVIVAL_CATEGORIES),
        "categories": BACKEND_SURVIVAL_CATEGORIES
    }
