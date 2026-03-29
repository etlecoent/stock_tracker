from datetime import datetime, timedelta

TTL_SECONDS = 60

_store: dict[str, dict] = {}


def get(key: str):
    entry = _store.get(key)
    if entry and not is_stale(key):
        return entry["data"]
    return None


def set(key: str, data):
    _store[key] = {"data": data, "fetched_at": datetime.utcnow()}


def is_stale(key: str) -> bool:
    entry = _store.get(key)
    if not entry:
        return True
    return datetime.utcnow() - entry["fetched_at"] > timedelta(seconds=TTL_SECONDS)


def recent_keys() -> list[str]:
    """Return keys that were accessed within the last TTL window (for scheduler use)."""
    cutoff = datetime.utcnow() - timedelta(seconds=TTL_SECONDS * 2)
    return [k for k, v in _store.items() if v["fetched_at"] > cutoff]
