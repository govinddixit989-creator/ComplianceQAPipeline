"""
Connector registry — add new platforms here.
Each connector must subclass BaseConnector and implement fetch().
"""
from .base import BaseConnector, ContentItem
from .youtube import YouTubeConnector

# ── registry: platform name → connector instance ──────────────────────────────
_REGISTRY: dict[str, BaseConnector] = {
    "youtube": YouTubeConnector(),
    # "instagram": InstagramConnector(),   ← add later
    # "tiktok":    TikTokConnector(),
    # "twitter":   TwitterConnector(),
}


def get_connector(platform: str) -> BaseConnector:
    conn = _REGISTRY.get(platform.lower())
    if not conn:
        supported = ", ".join(_REGISTRY.keys())
        raise ValueError(f"Platform '{platform}' not supported yet. Supported: {supported}")
    return conn


def supported_platforms() -> list[str]:
    return list(_REGISTRY.keys())
