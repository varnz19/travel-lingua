import logging
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("travel-lingua.db")

# Live Supabase database client initialization
supabase: Optional[Client] = None

try:
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase live database client initialized successfully.")
    else:
        logger.warning("Supabase credentials not set; operating in DB-fallback mode.")
except Exception as e:
    logger.warning(f"Could not connect to Supabase DB: {e}. Operating in DB-fallback mode.")


async def db_register_user(email: str, username: str, name: str, password: str, destination: str = "Tokyo, Japan", learning_language: str = "Japanese") -> Dict[str, Any]:
    """Inserts a new registered user profile into Supabase 'users' / 'profiles' table."""
    user_record = {
        "email": email,
        "username": username,
        "name": name,
        "password": password,
        "destination": destination,
        "learning_language": learning_language
    }

    if not supabase:
        logger.warning(f"[DB Fallback] Simulated user registration for: {username}")
        return {"user_id": f"usr_{username}", **user_record, "status": "simulated_success"}

    try:
        res = supabase.table("users").insert(user_record).execute()
        created_data = res.data[0] if res.data else user_record
        return {"user_id": created_data.get("id", f"usr_{username}"), **created_data, "status": "success"}
    except Exception as e:
        logger.error(f"Error registering user in Supabase 'users' table: {e}")
        try:
            res = supabase.table("profiles").insert(user_record).execute()
            created_data = res.data[0] if res.data else user_record
            return {"user_id": created_data.get("id", f"usr_{username}"), **created_data, "status": "success"}
        except Exception as ex:
            logger.error(f"Error registering user in Supabase 'profiles' table: {ex}")
            return {"user_id": f"usr_{username}", **user_record, "status": "registered_locally"}


async def db_match_phrases(query_embedding: List[float], match_threshold: float = 0.7, match_count: int = 5) -> List[Dict[str, Any]]:
    """
    Executes PostgreSQL semantic vector search RPC function 'match_phrases'.
    RPC Signature: match_phrases(query_embedding, match_threshold, match_count)
    """
    if not supabase:
        return []
    try:
        res = supabase.rpc("match_phrases", {
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": match_count
        }).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error executing Supabase vector search match_phrases RPC: {e}")
        return []


async def db_save_translation(user_id: str, text: str, translated_text: str, source_lang: str, target_lang: str) -> bool:
    """Stores translation history record in Supabase 'translations' table."""
    if not supabase:
        return False
    try:
        supabase.table("translations").insert({
            "user_id": user_id,
            "source_text": text,
            "translated_text": translated_text,
            "source_lang": source_lang,
            "target_lang": target_lang
        }).execute()
        return True
    except Exception as e:
        logger.error(f"Error inserting translation to Supabase DB: {e}")
        return False


async def db_save_practice_score(user_id: str, target_text: str, overall_score: float, accuracy_rating: str) -> bool:
    """Stores pronunciation assessment score in Supabase 'practice_scores' table."""
    if not supabase:
        return False
    try:
        supabase.table("practice_scores").insert({
            "user_id": user_id,
            "target_text": target_text,
            "overall_score": overall_score,
            "accuracy_rating": accuracy_rating
        }).execute()
        return True
    except Exception as e:
        logger.error(f"Error inserting practice score to Supabase DB: {e}")
        return False


async def db_save_ocr_record(user_id: str, extracted_text: str, translated_text: Optional[str]) -> bool:
    """Stores OCR scan record in Supabase 'ocr_history' table."""
    if not supabase:
        return False
    try:
        supabase.table("ocr_history").insert({
            "user_id": user_id,
            "extracted_text": extracted_text,
            "translated_text": translated_text
        }).execute()
        return True
    except Exception as e:
        logger.error(f"Error inserting OCR scan to Supabase DB: {e}")
        return False


async def db_get_user_history(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves user's saved phrases/translations from Supabase DB."""
    if not supabase:
        return []
    try:
        res = supabase.table("translations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching translation history from Supabase DB: {e}")
        return []
