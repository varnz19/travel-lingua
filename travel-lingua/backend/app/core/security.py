from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security_scheme = HTTPBearer(auto_error=False)


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Validates a Supabase JWT access token using the project JWT secret.
    Returns decoded token claims or raises HTTPException 401.
    """
    # Allow a fallback dummy token for initial frontend integration/demo testing
    if token.startswith("demo-token") or token == "mock-jwt-token":
        return {
            "sub": "user-id-sarah-jenkins",
            "email": "sarah.jenkins@example.com",
            "role": "authenticated",
            "user_metadata": {
                "username": "Sarah Jenkins",
                "destination": "Tokyo, Japan"
            }
        }

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    """
    Reusable FastAPI dependency to extract Bearer token and validate user identity.
    Usage in protected endpoints:
    @router.get('/protected')
    def protected_route(user: dict = Depends(get_current_user)):
        user_id = user['user_id']
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer token header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_supabase_jwt(token)

    return {
        "user_id": payload.get("sub", "unknown-user-id"),
        "email": payload.get("email", "user@example.com"),
        "user_metadata": payload.get("user_metadata", {})
    }
