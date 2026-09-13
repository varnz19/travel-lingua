import time
from app.core.redis_client import redis_service


def test_redis_cache_operations():
    key = "test:travel:hello"
    val = "Konnichiwa"

    # Set cache with TTL
    success = redis_service.set_cache(key, val, ttl_seconds=60)
    assert success is True

    # Retrieve cache
    retrieved = redis_service.get_cache(key)
    assert retrieved == val

    # Delete cache
    deleted = redis_service.delete_cache(key)
    assert deleted is True

    # Confirm key deleted
    assert redis_service.get_cache(key) is None


def test_redis_cache_expiry():
    key = "test:travel:temp"
    val = "short-lived"

    # Set 1 second TTL
    redis_service.set_cache(key, val, ttl_seconds=1)
    assert redis_service.get_cache(key) == val

    # Wait for expiry
    time.sleep(1.1)
    assert redis_service.get_cache(key) is None


def test_redis_rate_limiter():
    client_id = "user_test_999"
    limit = 3
    window = 5

    # Request 1: allowed
    allowed1, remaining1, reset1 = redis_service.check_rate_limit(client_id, limit=limit, window_seconds=window)
    assert allowed1 is True
    assert remaining1 == 2
    assert reset1 > 0

    # Request 2: allowed
    allowed2, remaining2, _ = redis_service.check_rate_limit(client_id, limit=limit, window_seconds=window)
    assert allowed2 is True
    assert remaining2 == 1

    # Request 3: allowed
    allowed3, remaining3, _ = redis_service.check_rate_limit(client_id, limit=limit, window_seconds=window)
    assert allowed3 is True
    assert remaining3 == 0

    # Request 4: blocked
    allowed4, remaining4, _ = redis_service.check_rate_limit(client_id, limit=limit, window_seconds=window)
    assert allowed4 is False
    assert remaining4 == 0
