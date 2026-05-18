"""
Compliance rule definitions.
Each rule is a plain dict so it can be serialised, stored in Azure AI Search,
or swapped for DB-backed rules later without changing the checker logic.
"""

FTC_RULES = [
    {
        "id": "ftc-001",
        "regulation": "FTC",
        "article": "16 CFR Part 255.5",
        "title": "Material Connection Disclosure",
        "description": (
            "Any material connection between an endorser and the brand must be clearly "
            "and conspicuously disclosed. Material connections include payment, free products, "
            "discounts, family/employment relationships, or any other benefit."
        ),
        "required_signals": ["#ad", "#sponsored", "#advertisement", "#paidpartnership",
                             "paid partnership", "advertisement", "sponsored by"],
        "severity": "critical",
        "applies_to": ["youtube", "instagram", "tiktok", "twitter", "facebook"],
    },
    {
        "id": "ftc-002",
        "regulation": "FTC",
        "article": "16 CFR Part 255.1",
        "title": "Disclosure Prominence",
        "description": (
            "Disclosures must be prominent and unavoidable. They cannot be buried in a "
            "long list of hashtags, placed only in the description after a 'show more' fold, "
            "or spoken quickly at the end of a video."
        ),
        "severity": "high",
        "applies_to": ["youtube", "instagram", "tiktok", "twitter"],
    },
    {
        "id": "ftc-003",
        "regulation": "FTC",
        "article": "15 U.S.C. § 45",
        "title": "False or Misleading Claims",
        "description": (
            "Endorsers cannot make false, deceptive, or unsubstantiated claims about "
            "a product or service. Claims must reflect the endorser's honest opinion "
            "and cannot be contrary to their actual experience."
        ),
        "severity": "critical",
        "applies_to": ["youtube", "instagram", "tiktok", "twitter", "facebook"],
    },
    {
        "id": "ftc-004",
        "regulation": "FTC",
        "article": "16 CFR Part 255.2",
        "title": "Expert Endorsements",
        "description": (
            "If an endorser is presented as an expert, they must actually possess the "
            "claimed expertise and the endorsement must be supported by their expertise."
        ),
        "severity": "high",
        "applies_to": ["youtube", "instagram", "tiktok", "twitter"],
    },
    {
        "id": "ftc-005",
        "regulation": "FTC / FDA",
        "article": "21 CFR Part 101",
        "title": "Health and Medical Claims",
        "description": (
            "Unsubstantiated health claims, disease cure claims, or claims that imply "
            "FDA approval without it are prohibited. Dietary supplement claims require "
            "specific disclaimer language."
        ),
        "severity": "critical",
        "applies_to": ["youtube", "instagram", "tiktok", "twitter", "facebook"],
    },
]

YOUTUBE_POLICY_RULES = [
    {
        "id": "yt-001",
        "regulation": "YouTube",
        "article": "YouTube Partner Program Policies",
        "title": "Paid Product Placement",
        "description": (
            "Videos containing paid product placements, endorsements, or sponsorships "
            "must be marked using YouTube's built-in paid promotion disclosure checkbox "
            "in addition to any verbal/text disclosure."
        ),
        "severity": "high",
        "applies_to": ["youtube"],
    },
    {
        "id": "yt-002",
        "regulation": "YouTube",
        "article": "YouTube Community Guidelines",
        "title": "Misleading Metadata",
        "description": (
            "Video title, description, and tags must accurately represent the content. "
            "Clickbait titles that do not reflect actual content are a policy violation."
        ),
        "severity": "medium",
        "applies_to": ["youtube"],
    },
]

ALL_RULES = FTC_RULES + YOUTUBE_POLICY_RULES


def get_rules_for_platform(platform: str) -> list[dict]:
    return [r for r in ALL_RULES if platform in r.get("applies_to", [])]


def get_rules_text(platform: str) -> str:
    rules = get_rules_for_platform(platform)
    lines = []
    for r in rules:
        lines.append(
            f"[{r['id']}] {r['regulation']} — {r['title']} ({r['article']})\n"
            f"Severity: {r['severity']}\n"
            f"{r['description']}\n"
        )
    return "\n".join(lines)
