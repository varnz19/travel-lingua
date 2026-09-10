import json
import logging
import time
from typing import Optional, Tuple, Dict, Any, List
import redis
from app.core.config import settings

logger = logging.getLogger("travel-lingua.core.redis")

# In-memory fallback stores in case Redis server is offline
_in_memory_cache: Dict[str, Tuple[str, float]] = {}
_in_memory_rate_limits: Dict[str, List[int]] = {}
MAX_IN_MEMORY_CACHE_SIZE = 5000


class RedisService:
    """
    Unified Redis client service with automatic in-memory fallback.
    Provides:
    1. Resilient caching (get, set, delete) with TTL.
    2. Rate limiting (sliding-window / token bucket) per IP/user identifier.
    3. Graceful offline fallback: if Redis server is down, operates smoothly
       in-memory without crashing FastAPI or ML inference.
    """

    def __init__(self):
        self._client: Optional[redis.Redis] = None
        self._last_connect_attempt: float = 0.0
        self._init_client()

    def _init_client(self):
        """Attempts connection to Redis with short timeouts."""
        self._last_connect_attempt = time.time()
        try:
            client = redis.Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=1,
                socket_connect_timeout=1,
                retry_on_timeout=False
            )
            # Ping to verify active connection
            client.ping()
            self._client = client
            logger.info("Connected to Redis server successfully.")
        except Exception as e:
            logger.warning(f"Redis unavailable at {settings.REDIS_URL} ({e}). Using in-memory fallback store.")
            self._client = None

    @property
    def client(self) -> Optional[redis.Redis]:
        """Returns the raw redis client if connected, or attempts reconnect if cooldown passed."""
        if self._client is None and (time.time() - self._last_connect_attempt > 30.0):
            self._init_client()
        return self._client

    @property
    def is_connected(self) -> bool:
        """Checks if active connection to Redis exists."""
        if self._client is None:
            return False
        try:
            return bool(self._client.ping())
        except Exception:
            self._client = None
            return False

    def _purge_expired_in_memory_cache(self):
        """Prevents unbounded memory growth in fallback cache."""
        now = time.time()
        expired_keys = [k for k, (_, expiry) in _in_memory_cache.items() if now >= expiry]
        for k in expired_keys:
            _in_memory_cache.pop(k, None)

        if len(_in_memory_cache) > MAX_IN_MEMORY_CACHE_SIZE:
            # Drop oldest 20%
            excess = len(_in_memory_cache) - int(MAX_IN_MEMORY_CACHE_SIZE * 0.8)
            for k in list(_in_memory_cache.keys())[:excess]:
                _in_memory_cache.pop(k, None)

    def get_cache(self, key: str) -> Optional[str]:
        """Fetch cached string value from Redis or in-memory fallback store."""
        client = self.client
        if client:
            try:
                return client.get(key)
            except Exception as e:
                logger.debug(f"Redis get failed ({e}), checking in-memory fallback")

        # In-memory fallback
        if key in _in_memory_cache:
            val, expiry = _in_memory_cache[key]
            if time.time() < expiry:
                return val
            _in_memory_cache.pop(key, None)
        return None

    def set_cache(self, key: str, value: Any, ttl_seconds: int = 86400) -> bool:
        """
        Store string or JSON value in Redis with TTL or in-memory fallback store.
        """
        str_val = value if isinstance(value, str) else json.dumps(value)

        client = self.client
        if client:
            try:
                return bool(client.setex(key, ttl_seconds, str_val))
            except Exception as e:
                logger.debug(f"Redis setex failed ({e}), writing to in-memory fallback")

        # In-memory fallback
        self._purge_expired_in_memory_cache()
        _in_memory_cache[key] = (str_val, time.time() + ttl_seconds)
        return True

    def delete_cache(self, key: str) -> bool:
        """Deletes key from Redis or in-memory fallback store."""
        deleted = False
        client = self.client
        if client:
            try:
                deleted = bool(client.delete(key))
            except Exception as e:
                logger.debug(f"Redis delete failed ({e})")

        if key in _in_memory_cache:
            _in_memory_cache.pop(key, None)
            deleted = True
        return deleted

    def check_rate_limit(
        self,
        identifier: str,
        limit: int = 60,
        window_seconds: int = 60
    ) -> Tuple[bool, int, int]:
        """
        Sliding-window rate limiter per client identifier (IP / User ID).
        
        Returns:
            (allowed: bool, remaining_requests: int, reset_window_seconds: int)
        """
        key = f"ratelimit:{identifier}"
        now = int(time.time())

        client = self.client
        if client:
            try:
                pipe = client.pipeline()
                pipe.incr(key)
                pipe.ttl(key)
                count, ttl = pipe.execute()

                if ttl == -1 or ttl is None:
                    client.expire(key, window_seconds)
                    ttl = window_seconds

                remaining = max(0, limit - count)
                allowed = count <= limit
                return allowed, remaining, max(int(ttl), 0)
            except Exception as e:
                logger.debug(f"Redis rate-limit check failed ({e}), using in-memory fallback")

        # In-memory fallback using sliding window timestamps
        cutoff = now - window_seconds
        timestamps = [ts for ts in _in_memory_rate_limits.get(identifier, []) if ts > cutoff]
        allowed = len(timestamps) < limit
        if allowed:
            timestamps.append(now)
        _in_memory_rate_limits[identifier] = timestamps

        remaining = max(0, limit - len(timestamps))
        reset_time = window_seconds - (now - timestamps[0]) if timestamps else window_seconds

        return allowed, remaining, max(int(reset_time), 0)


redis_service = RedisService()
