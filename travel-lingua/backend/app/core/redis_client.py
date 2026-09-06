import json
import logging
import time
from typing import Optional, Tuple, Dict
import redis
from app.core.config import settings

logger = logging.getLogger("travel-lingua.core.redis")

# In-memory fallback stores in case Redis server is offline
_in_memory_cache: Dict[str, Tuple[str, float]] = {}
_in_memory_rate_limits: Dict[str, list] = {}


class RedisService:
    def __init__(self):
        self._client: Optional[redis.Redis] = None
        self._init_client()

    def _init_client(self):
        try:
            self._client = redis.Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=1,
                socket_connect_timeout=1
            )
            # Ping to verify active connection
            self._client.ping()
            logger.info("Connected to Redis server successfully.")
        except Exception as e:
            logger.warning(f"Redis unavailable ({e}). Using in-memory fallback store.")
            self._client = None

    @property
    def is_connected(self) -> bool:
        if self._client is None:
            return False
        try:
            return bool(self._client.ping())
        except Exception:
            return False

    def get_cache(self, key: str) -> Optional[str]:
        """Fetch cached string value from Redis or fallback store."""
        if self._client:
            try:
                return self._client.get(key)
            except Exception as e:
                logger.debug(f"Redis get failed ({e}), checking in-memory fallback")

        # In-memory fallback
        if key in _in_memory_cache:
            val, expiry = _in_memory_cache[key]
            if time.time() < expiry:
                return val
            del _in_memory_cache[key]
        return None

    def set_cache(self, key: str, value: str, ttl_seconds: int = 86400) -> bool:
        """Store string value in Redis with TTL or fallback store."""
        if self._client:
            try:
                return bool(self._client.setex(key, ttl_seconds, value))
            except Exception as e:
                logger.debug(f"Redis setex failed ({e}), writing to in-memory fallback")

        # In-memory fallback
        _in_memory_cache[key] = (value, time.time() + ttl_seconds)
        return True

    def check_rate_limit(
        self,
        identifier: str,
        limit: int = 60,
        window_seconds: int = 60
    ) -> Tuple[bool, int, int]:
        """
        Sliding-window / fixed-window rate limiter.
        Returns: (allowed: bool, remaining_requests: int, reset_window_seconds: int)
        """
        key = f"ratelimit:{identifier}"
        now = int(time.time())

        if self._client:
            try:
                pipe = self._client.pipeline()
                pipe.incr(key)
                pipe.ttl(key)
                count, ttl = pipe.execute()

                if ttl == -1 or ttl is None:
                    self._client.expire(key, window_seconds)
                    ttl = window_seconds

                remaining = max(0, limit - count)
                allowed = count <= limit
                return allowed, remaining, max(ttl, 0)
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
