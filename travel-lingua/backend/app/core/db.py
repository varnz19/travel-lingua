import logging
import uuid
from typing import Optional, Dict, Any, List
from supabase import create_client, Client, ClientOptions
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


def get_scoped_supabase_client(token: Optional[str] = None) -> Optional[Client]:
    """
    Returns a Supabase client. If a user JWT token is passed, attaches it as
    an Authorization Bearer header so that PostgreSQL Row-Level Security (RLS) policies
    are satisfied for the calling user.
    """
    if not token or not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return supabase
    try:
        return create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY,
            options=ClientOptions(headers={"Authorization": f"Bearer {token}"})
        )
    except Exception as e:
        logger.warning(f"Could not initialize scoped Supabase client: {e}")
        return supabase


async def db_register_user(
    email: str,
    username: str,
    name: str,
    password: str,
    destination: str = "Tokyo, Japan",
    learning_language: str = "Japanese"
) -> Dict[str, Any]:
    """
    Registers a new user in Supabase Auth via sign_up, and syncs profile in 'profiles' table.
    """
    lang_code = "ja" if "japan" in learning_language.lower() else "en"

    if not supabase:
        user_uuid = str(uuid.uuid4())
        logger.warning(f"[DB Fallback] Simulated user registration for: {username}")
        return {"user_id": user_uuid, "username": username, "status": "simulated_success"}

    try:
        # 1. Register in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "username": username,
                    "full_name": name,
                    "destination": destination
                }
            }
        })

        user_id = auth_response.user.id if auth_response.user else str(uuid.uuid4())
        token = auth_response.session.access_token if auth_response.session else None
        logger.info(f"Registered user in Supabase Auth: {user_id}")

        # 2. Update profile row in 'profiles' table using the scoped user session
        scoped_client = get_scoped_supabase_client(token) if token else supabase
        profile_record = {
            "full_name": name,
            "username": username,
            "native_language": "en",
            "target_language": lang_code,
        }

        try:
            res = scoped_client.table("profiles").update(profile_record).eq("id", user_id).execute()
            updated_data = res.data[0] if res.data else profile_record
            logger.info(f"Profile row for '{username}' synced in Supabase DB!")
            return {"user_id": user_id, "access_token": token, **updated_data, "status": "success"}
        except Exception as pe:
            logger.warning(f"Note updating profiles table: {pe}")
            return {"user_id": user_id, "access_token": token, "username": username, "status": "success"}

    except Exception as e:
        logger.error(f"Error registering user in Supabase Auth/DB: {e}")
        return {"user_id": str(uuid.uuid4()), "username": username, "status": "completed_with_notice", "detail": str(e)}


async def db_save_saved_phrase(
    user_id: str,
    original_text: str,
    translated_text: str,
    romanized: Optional[str] = None,
    notes: Optional[str] = None,
    phrase_id: Optional[str] = None,
    is_favorite: bool = True,
    token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Stores saved phrase / translation in Supabase 'saved_phrases' table.
    """
    client = get_scoped_supabase_client(token)
    if not client:
        return {"status": "fallback", "success": False}

    record: Dict[str, Any] = {
        "user_id": user_id,
        "custom_original_text": original_text,
        "custom_translated_text": translated_text,
        "custom_romanized": romanized,
        "notes": notes or "Saved from Travel Lingua",
        "is_favorite": is_favorite
    }
    if phrase_id:
        record["phrase_id"] = phrase_id

    try:
        res = client.table("saved_phrases").insert(record).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        logger.error(f"Error inserting into Supabase saved_phrases: {e}")
        return {"status": "error", "detail": str(e)}


async def db_save_translation(
    user_id: str,
    text: str,
    translated_text: str,
    source_lang: str,
    target_lang: str,
    token: Optional[str] = None
) -> bool:
    """Stores translation history record in Supabase 'saved_phrases' table (backward compatible)."""
    res = await db_save_saved_phrase(
        user_id=user_id,
        original_text=text,
        translated_text=translated_text,
        notes=f"Translated {source_lang}->{target_lang}",
        token=token
    )
    return res.get("status") == "success"


async def db_save_practice_score(
    user_id: str,
    target_text: str,
    overall_score: float,
    accuracy_rating: str,
    language: str = "ja",
    token: Optional[str] = None
) -> bool:
    """Stores pronunciation assessment score in Supabase 'practice_history' table."""
    client = get_scoped_supabase_client(token)
    if not client:
        return False
    try:
        client.table("practice_history").insert({
            "user_id": user_id,
            "target_text": target_text,
            "language": language,
            "overall_score": float(overall_score),
            "accuracy_rating": accuracy_rating
        }).execute()
        return True
    except Exception as e:
        logger.error(f"Error inserting practice score to Supabase DB: {e}")
        return False


async def db_save_roleplay_session(
    user_id: str,
    scenario_id: str,
    scenario_title: str,
    status: str = "active",
    token: Optional[str] = None
) -> bool:
    """Stores roleplay session in Supabase 'roleplay_sessions' table."""
    client = get_scoped_supabase_client(token)
    if not client:
        return False
    try:
        client.table("roleplay_sessions").insert({
            "user_id": user_id,
            "scenario_id": scenario_id,
            "scenario_title": scenario_title,
            "status": status
        }).execute()
        return True
    except Exception as e:
        logger.error(f"Error inserting roleplay session into Supabase DB: {e}")
        return False


async def db_get_saved_phrases(user_id: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves user's saved phrases from Supabase 'saved_phrases' table."""
    client = get_scoped_supabase_client(token)
    if not client:
        return []
    try:
        res = client.table("saved_phrases").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching saved phrases from Supabase DB: {e}")
        return []


async def db_get_practice_history(user_id: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves user's pronunciation practice history from Supabase 'practice_history' table."""
    client = get_scoped_supabase_client(token)
    if not client:
        return []
    try:
        res = client.table("practice_history").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(30).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching practice history from Supabase DB: {e}")
        return []


async def db_get_user_history(user_id: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
    """Backward compatibility wrapper: retrieves user's saved phrases."""
    return await db_get_saved_phrases(user_id, token)


async def db_save_ocr_record(user_id: str, extracted_text: str, translated_text: Optional[str], token: Optional[str] = None) -> bool:
    """Stores OCR scan record in Supabase 'saved_phrases' table as a scanned translation."""
    res = await db_save_saved_phrase(
        user_id=user_id,
        original_text=extracted_text,
        translated_text=translated_text or "",
        notes="Saved from Camera OCR scan",
        token=token
    )
    return res.get("status") == "success"


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
