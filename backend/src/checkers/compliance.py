import os
import json
import time
from functools import lru_cache
from openai import AsyncAzureOpenAI
from sentence_transformers import SentenceTransformer

from ..connectors.base import ContentItem
from ..services.search import retrieve_rules
from .rules import get_rules_for_platform


@lru_cache(maxsize=1)
def _get_embedder() -> SentenceTransformer:
    return SentenceTransformer("all-MiniLM-L6-v2")


SYSTEM_PROMPT = """You are a social media compliance expert specialising in FTC regulations,
platform advertising policies, and consumer protection law.

You will receive the full text of a social media post or video (title + description + captions)
along with relevant compliance rules retrieved from an authoritative regulatory knowledge base.

Your job:
1. Detect whether the content contains any sponsored/paid/gifted promotion (look for brand names,
   product mentions, "link in bio", promo codes, review requests, affiliate language, etc.)
2. If promotion is detected, verify all required disclosures are present and prominent
3. Check for false or misleading claims
4. Check for health/medical claims without proper disclaimers
5. Check for platform-specific policy violations
6. Apply ALL rules from the retrieved knowledge base — do not limit yourself to obvious violations

Respond ONLY with a valid JSON object in exactly this structure:
{
  "is_sponsored": true | false,
  "sponsorship_evidence": "brief explanation of what triggered sponsorship detection, or null",
  "score": 0-100,
  "status": "pass" | "warning" | "fail",
  "violations": [
    {
      "rule_id": "ftc-001",
      "severity": "critical" | "high" | "medium" | "low",
      "title": "short violation title",
      "description": "what exactly is wrong",
      "evidence": "quote or reference from the content that shows the violation",
      "recommendation": "exactly what needs to be added or changed"
    }
  ],
  "compliant_items": [
    {
      "rule_id": "ftc-001",
      "title": "what was done correctly",
      "evidence": "quote or reference showing compliance"
    }
  ],
  "summary": "2-3 sentence plain English summary of the compliance status"
}

Scoring guide:
- 90-100: Fully compliant, no issues
- 70-89: Minor issues, no critical violations
- 50-69: Significant issues, at least one high-severity violation
- 0-49: Critical violations present, legal risk

If content is NOT sponsored/promotional, score 100 unless other violations exist."""


def _format_retrieved_rules(chunks: list[dict]) -> str:
    if not chunks:
        return "(no rules retrieved — using general compliance knowledge)"
    lines = []
    for c in chunks:
        lines.append(
            f"[{c.get('source','').upper()} — {c.get('section','')}] {c.get('title','')}\n"
            f"{c.get('content','')}\n"
        )
    return "\n---\n".join(lines)


class ComplianceChecker:

    def __init__(self):
        self._client = AsyncAzureOpenAI(
            azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
            api_key=os.environ["AZURE_OPENAI_API_KEY"],
            api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-10-21"),
        )
        self._chat_model      = os.environ.get("AZURE_OPENAI_CHAT_DEPLOYMENT", "gpt-4o")
        self._embedding_model = os.environ.get("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small")

    def _embed(self, text: str) -> list[float]:
        return _get_embedder().encode([text[:2000]], show_progress_bar=False)[0].tolist()

    async def check(self, content: ContentItem) -> dict:
        start = time.perf_counter()

        # ── 1. Build a query from the content to drive semantic search ────────
        query_text = f"{content.title}\n{content.description[:500]}\n{' '.join(content.hashtags)}"

        # ── 2. Embed the query (local model, synchronous but fast) ────────────
        query_vector = self._embed(query_text)

        # ── 3. Retrieve relevant rule chunks from Azure AI Search ─────────────
        retrieved_chunks = retrieve_rules(
            query_vector=query_vector,
            platform=content.platform,
            top_k=8,
        )

        # ── 4. Fall back to hardcoded rules if index is empty ─────────────────
        if not retrieved_chunks:
            from .rules import get_rules_text
            rules_section = get_rules_text(content.platform)
            rules_source  = "hardcoded"
        else:
            rules_section = _format_retrieved_rules(retrieved_chunks)
            rules_source  = "vector-db"

        # ── 5. Build prompt ───────────────────────────────────────────────────
        user_message = f"""Platform: {content.platform}
Channel: {content.channel_name}
Published: {content.published_at}
URL: {content.url}

--- TITLE ---
{content.title}

--- DESCRIPTION ---
{content.description or "(no description)"}

--- CAPTIONS / TRANSCRIPT ---
{content.captions[:6000] if content.captions else "(no captions available)"}

--- HASHTAGS FOUND ---
{", ".join(content.hashtags) or "none"}

--- APPLICABLE COMPLIANCE RULES (source: {rules_source}) ---
{rules_section}
"""

        # ── 6. Call GPT-4o ────────────────────────────────────────────────────
        response = await self._client.chat.completions.create(
            model=self._chat_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_message},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        elapsed = round(time.perf_counter() - start, 2)
        result  = json.loads(response.choices[0].message.content)
        result["check_time_seconds"] = elapsed
        result["rules_applied"] = (
            [c.get("id", c.get("section","")) for c in retrieved_chunks]
            if retrieved_chunks
            else [r["id"] for r in get_rules_for_platform(content.platform)]
        )

        return result
