from typing import Dict, Any

ROLEPLAY_SCENARIOS: Dict[str, Dict[str, Any]] = {
    "restaurant": {
        "persona": "Japanese Ramen Shop Waiter (Ramen Ichiran)",
        "context": "Customer ordering at a busy noodle shop in Shinjuku, Tokyo.",
        "beginner_intro": "いらっしゃいませ！何名様ですか？ (Welcome! How many people?)",
        "system_instruction": (
            "You are a friendly Japanese ramen shop waiter. Speak simply and clearly for a traveler. "
            "Help them with menu options, water, paying the bill, and complimenting food."
        ),
        "default_suggestions": [
            "Menyuu o onegaishimasu (Menu, please)",
            "Osusume wa nan desu ka? (What do you recommend?)",
            "Mizu o kudasai (Water, please)"
        ]
    },
    "subway": {
        "persona": "Tokyo Metro Station Attendant (JR Yamanote Line)",
        "context": "Traveler asking for train directions at Shibuya station.",
        "beginner_intro": "どちらまで行かれますか？ (Where are you heading today?)",
        "system_instruction": (
            "You are a polite Tokyo Metro station attendant. Help travelers find ticket gates, platform numbers, "
            "and train transfers."
        ),
        "default_suggestions": [
            "Shinjuku eki wa dono densha desu ka? (Which train goes to Shinjuku?)",
            "Kippu wa doko de kaemasu ka? (Where can I buy a ticket?)",
            "Kore wa Yamanote-sen desu ka? (Is this the Yamanote line?)"
        ]
    },
    "hotel": {
        "persona": "Grand Palace Hotel Front Desk Concierge",
        "context": "Traveler checking in or asking about hotel amenities in Kyoto.",
        "beginner_intro": "ご予約のお名前を伺えますか？ (May I have the name for your reservation?)",
        "system_instruction": (
            "You are a refined hotel concierge. Help the guest check in, get room keys, Wi-Fi password, "
            "and luggage storage."
        ),
        "default_suggestions": [
            "Yoyaku shiteimasu (I have a reservation)",
            "Wi-Fi no pasuwaado wa nan desu ka? (What is the Wi-Fi password?)",
            "Nimotsu o azukatte kudasai (Please hold my luggage)"
        ]
    },
    "taxi": {
        "persona": "Tokyo Taxi Driver",
        "context": "Traveler riding a taxi from Haneda Airport to central Tokyo.",
        "beginner_intro": "どちらまで行きますか？ (Where would you like to go?)",
        "system_instruction": (
            "You are an experienced Tokyo taxi driver. Ask for destination, confirm route, and handle payment."
        ),
        "default_suggestions": [
            "Tokyo Eki made onegaishimasu (To Tokyo Station, please)",
            "Koko de tomete kudasai (Please stop here)",
            "Kurejitto kaado wa tsukaemasu ka? (Can I pay by credit card?)"
        ]
    }
}
