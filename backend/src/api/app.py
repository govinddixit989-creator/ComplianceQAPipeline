import os
from pathlib import Path
from dotenv import load_dotenv

# walk up from this file to find the .env in the project root
_env = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=_env, override=False)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ..connectors import get_connector, supported_platforms
from ..checkers import ComplianceChecker

app = FastAPI(title="Compliance QA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# lazy-initialised so the server starts even without env vars set
_checker: ComplianceChecker | None = None

def get_checker() -> ComplianceChecker:
    global _checker
    if _checker is None:
        _checker = ComplianceChecker()
    return _checker


# ── request / response models ────────────────────────────────────────────────

class CheckRequest(BaseModel):
    url: str
    platform: str = "youtube"


class CheckResponse(BaseModel):
    platform: str
    content_id: str
    url: str
    title: str
    channel_name: str
    thumbnail_url: str
    published_at: str
    hashtags: list[str]
    is_sponsored: bool
    sponsorship_evidence: str | None
    score: int
    status: str
    violations: list[dict]
    compliant_items: list[dict]
    summary: str
    check_time_seconds: float
    rules_applied: list[str]


# ── routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "supported_platforms": supported_platforms()}


@app.post("/api/check", response_model=CheckResponse)
async def check_content(req: CheckRequest):
    try:
        connector  = get_connector(req.platform)
        content    = await connector.fetch(req.url)
        result     = await get_checker().check(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Check failed: {str(e)}")

    return CheckResponse(
        platform        = content.platform,
        content_id      = content.content_id,
        url             = content.url,
        title           = content.title,
        channel_name    = content.channel_name,
        thumbnail_url   = content.thumbnail_url,
        published_at    = content.published_at,
        hashtags        = content.hashtags,
        **result,
    )


@app.get("/api/platforms")
async def platforms():
    return {"platforms": supported_platforms()}
