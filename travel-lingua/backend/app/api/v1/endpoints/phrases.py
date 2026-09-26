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


SURVIVAL_PHRASES_REPOSITORY = [
    {"id": "sp_1", "japanese": "初めまして (Hajimemashite)", "english": "Nice to meet you", "pronunciation": "hah-jee-meh-mahsh-teh", "audio_text": "Hajimemashite", "category": "introduction"},
    {"id": "sp_2", "japanese": "ありがとうございます (Arigatou gozaimasu)", "english": "Thank you very much (Polite)", "pronunciation": "ah-ree-gah-toh goh-zah-ee-mahs", "audio_text": "Arigatou gozaimasu", "category": "introduction"},
    {"id": "sp_3", "japanese": "英語を話せますか？ (Eigo o hanasemasu ka?)", "english": "Do you speak English?", "pronunciation": "ay-goh oh hah-nah-seh-mahs kah", "audio_text": "Eigo o hanasemasu ka", "category": "introduction"},
    {"id": "sp_4", "japanese": "日本語が分かりません (Nihongo ga wakarimasen)", "english": "I don't understand Japanese", "pronunciation": "nee-hohn-goh gah wah-kah-ree-mah-sen", "audio_text": "Nihongo ga wakarimasen", "category": "introduction"},
    {"id": "sp_5", "japanese": "もう一度お願いします (Mou ichido onegaishimasu)", "english": "Once more, please", "pronunciation": "moh ee-chee-doh oh-neh-gah-ee-shee-mahs", "audio_text": "Mou ichido onegaishimasu", "category": "introduction"},
    {"id": "sp_6", "japanese": "水をください (Mizu o kudasai)", "english": "Water, please", "pronunciation": "mee-zoo oh koo-dah-sah-ee", "audio_text": "Mizu o kudasai", "category": "food"},
    {"id": "sp_7", "japanese": "これをお願いします (Kore o onegaishimasu)", "english": "This one, please", "pronunciation": "koh-reh oh oh-neh-gah-ee-shee-mahs", "audio_text": "Kore o onegaishimasu", "category": "food"},
    {"id": "sp_8", "japanese": "美味しいです (Oishii desu)", "english": "It is delicious!", "pronunciation": "oy-shee des", "audio_text": "Oishii desu", "category": "food"},
    {"id": "sp_9", "japanese": "メニューをお願いします (Menyuu o onegaishimasu)", "english": "Menu, please", "pronunciation": "meh-nyoo oh oh-neh-gah-ee-shee-mahs", "audio_text": "Menyuu o onegaishimasu", "category": "restaurants"},
    {"id": "sp_10", "japanese": "お会計をお願いします (Okaikei o onegaishimasu)", "english": "The check / bill, please", "pronunciation": "oh-kah-ee-keh-ee oh oh-neh-gah-ee-shee-mahs", "audio_text": "Okaikei o onegaishimasu", "category": "restaurants"},
    {"id": "sp_11", "japanese": "おすすめは何ですか？ (Osusume wa nan desu ka?)", "english": "What do you recommend?", "pronunciation": "oh-soo-soo-meh wah nahn des-kah", "audio_text": "Osusume wa nan desu ka", "category": "restaurants"},
    {"id": "sp_12", "japanese": "ベジタリアン料理はありますか？ (Bejitarian ryouri wa arimasu ka?)", "english": "Do you have vegetarian dishes?", "pronunciation": "beh-jee-tah-ree-ahn ryoh-ree wah ah-ree-mahs kah", "audio_text": "Bejitarian ryouri wa arimasu ka", "category": "restaurants"},
    {"id": "sp_13", "japanese": "搭乗口はどこですか？ (Toujouguchi wa doko desu ka?)", "english": "Where is the boarding gate?", "pronunciation": "toh-joh-goo-chee wah doh-koh des-kah", "audio_text": "Toujouguchi wa doko desu ka", "category": "airport"},
    {"id": "sp_14", "japanese": "荷物受取所はどこですか？ (Nimotsu uketorijo wa doko desu ka?)", "english": "Where is the baggage claim?", "pronunciation": "nee-moh-tsoo oo-keh-toh-ree-joh wah doh-koh des-kah", "audio_text": "Nimotsu uketorijo wa doko desu ka", "category": "airport"},
    {"id": "sp_15", "japanese": "タクシー乗り場はどこですか？ (Takushii noriba wa doko desu ka?)", "english": "Where is the taxi stand?", "pronunciation": "tah-koo-shee noh-ree-bah wah doh-koh des-kah", "audio_text": "Takushii noriba wa doko desu ka", "category": "airport"},
    {"id": "sp_16", "japanese": "これはいくらですか？ (Kore wa ikura desu ka?)", "english": "How much does this cost?", "pronunciation": "koh-reh wah ee-koo-rah des-kah", "audio_text": "Kore wa ikura desu ka", "category": "shops"},
    {"id": "sp_17", "japanese": "免税にできますか？ (Menzei ni dekimasu ka?)", "english": "Can this be tax-free?", "pronunciation": "mehn-zeh-ee nee deh-kee-mahs kah", "audio_text": "Menzei ni dekimasu ka", "category": "shops"},
    {"id": "sp_18", "japanese": "カードで払えますか？ (Kaado de haraemasu ka?)", "english": "Can I pay with credit card?", "pronunciation": "kah-doh deh hah-rah-eh-mahs kah", "audio_text": "Kaado de haraemasu ka", "category": "shops"},
    {"id": "sp_19", "japanese": "袋はいりません (Fukuro wa irimasen)", "english": "I don't need a shopping bag", "pronunciation": "foo-koo-roh wah ee-ree-mah-sen", "audio_text": "Fukuro wa irimasen", "category": "shops"},
    {"id": "sp_20", "japanese": "チェックインをお願いします (Chekkuin o onegaishimasu)", "english": "Check-in, please", "pronunciation": "chek-koo-een oh oh-neh-gah-ee-shee-mahs", "audio_text": "Chekkuin o onegaishimasu", "category": "hotel"},
    {"id": "sp_21", "japanese": "荷物を預かっていただけますか？ (Nimotsu o azukatte itadakemasu ka?)", "english": "Could you hold my luggage?", "pronunciation": "nee-moh-tsoo oh ah-zoo-kaht-teh ee-tah-dah-keh-mahs kah", "audio_text": "Nimotsu o azukatte itadakemasu ka", "category": "hotel"},
    {"id": "sp_22", "japanese": "Wi-Fiのパスワードは何ですか？ (Waifai no pasuwaado wa nan desu ka?)", "english": "What is the Wi-Fi password?", "pronunciation": "wah-ee-fah-ee noh pah-soo-wah-doh wah nahn des-kah", "audio_text": "Waifai no pasuwaado wa nan desu ka", "category": "hotel"},
    {"id": "sp_23", "japanese": "駅はどこですか？ (Eki wa doko desu ka?)", "english": "Where is the train station?", "pronunciation": "eh-kee wah doh-koh des-kah", "audio_text": "Eki wa doko desu ka", "category": "directions"},
    {"id": "sp_24", "japanese": "トイレはどこですか？ (Toire wa doko desu ka?)", "english": "Where is the restroom / toilet / washroom?", "pronunciation": "toy-reh wah doh-koh des-kah", "audio_text": "Toire wa doko desu ka", "category": "directions"},
    {"id": "sp_25", "japanese": "地下鉄の切符売り場はどこですか？ (Chikatetsu no kippu uriba wa doko desu ka?)", "english": "Where is the subway ticket counter?", "pronunciation": "chee-kah-teh-tsoo noh keep-poo oo-ree-bah wah doh-koh des-kah", "audio_text": "Chikatetsu no kippu uriba wa doko desu ka", "category": "directions"},
    {"id": "sp_26", "japanese": "助けてください！ (Tasukete kudasai!)", "english": "Please help me!", "pronunciation": "tah-soo-keh-teh koo-dah-sah-ee", "audio_text": "Tasukete kudasai", "category": "emergency"},
    {"id": "sp_27", "japanese": "交番はどこですか？ (Kouban wa doko desu ka?)", "english": "Where is the police box / police station?", "pronunciation": "koh-bahn wah doh-koh des-kah", "audio_text": "Kouban wa doko desu ka", "category": "emergency"},
    {"id": "sp_28", "japanese": "病院に行きたいです (Byouin ni ikitai desu)", "english": "I need to go to the hospital / doctor", "pronunciation": "byoh-een nee ee-kee-tah-ee des", "audio_text": "Byouin ni ikitai desu", "category": "emergency"},
    {"id": "sp_29", "japanese": "パスポートを無くしました (Pasupooto o nakushimashita)", "english": "I lost my passport", "pronunciation": "pah-soo-poh-toh oh nah-koo-shee-mahsh-tah", "audio_text": "Pasupooto o nakushimashita", "category": "emergency"},
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


@router.get("/search", summary="Semantic Phrase Search via Dense Embeddings")
async def search_phrases(q: str = Query(..., min_length=1, description="Semantic search query")):
    """
    Ranks travel phrases using dense 384-dimensional sentence embeddings (Sentence-Transformers).
    Enables concept-based search (e.g. 'wash hands' -> 'Where is the restroom?').
    """
    from app.services.ml.embeddings.vectorizer import semantic_search_phrases
    results = semantic_search_phrases(query=q, candidates=SURVIVAL_PHRASES_REPOSITORY, top_k=6)
    return {
        "query": q,
        "count": len(results),
        "results": results
    }
