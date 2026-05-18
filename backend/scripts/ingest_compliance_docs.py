"""
Ingest real compliance documents into Azure AI Search.

Sources:
  - FTC Endorsement Guides (16 CFR Part 255) — eCFR
  - FTC .com Disclosures Guide
  - YouTube Advertiser-Friendly Content Guidelines
  - YouTube Paid Product Placement Policy
  - YouTube Community Guidelines (key sections)

Run:
    cd /path/to/ComplianceQAPipeline
    .venv/bin/python backend/scripts/ingest_compliance_docs.py
"""

import os, sys, hashlib, asyncio, textwrap
from pathlib import Path
from dotenv import load_dotenv

# ── load env ──────────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from sentence_transformers import SentenceTransformer

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.services.search import ensure_index, INDEX_NAME

_embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ──────────────────────────────────────────────────────────────────────────────
# Source documents (real regulatory text)
# ──────────────────────────────────────────────────────────────────────────────

DOCS = [
    # ── FTC ───────────────────────────────────────────────────────────────────
    {
        "source": "ftc",
        "title": "FTC Endorsement Guides — Material Connections (§255.5)",
        "section": "255.5",
        "url": "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255/section-255.5",
        "platforms": "all",
        "content": textwrap.dedent("""\
            16 CFR § 255.5 — Disclosure of Material Connections

            When there exists a connection between the endorser and the seller of the advertised product
            or service that might materially affect the weight or credibility of the endorsement (i.e.,
            the connection is not reasonably expected by the audience), such connection must be fully
            disclosed.

            Material connections include:
            - Payment or other compensation (cash, free products, discounts, commissions)
            - Employment or family/personal relationships with the brand
            - Gifted products or services provided in exchange for a review
            - Affiliate relationships where the endorser earns a commission on sales
            - Equity or ownership stake in the advertised company

            Required disclosure language examples:
            - "#ad" or "#advertisement" — acceptable but must be prominent and unambiguous
            - "#sponsored" — acceptable
            - "Paid partnership with [Brand]" — acceptable
            - "#gifted" — acceptable for gifted products, but only when conspicuous
            - NOT acceptable: "#ambassador", "#collab", "#partner" (too vague)
            - NOT acceptable: disclosure buried among many hashtags (e.g., 30th hashtag in a list)
            - NOT acceptable: disclosure only in description below the fold (requires "Show More")

            Disclosures must be:
            1. Clear — use plain language the audience will understand
            2. Conspicuous — not hidden, not in small print, not spoken rapidly at the end
            3. Close — placed near the promotional claim, not separated by unrelated content
            4. Unavoidable — consumers must be able to notice it without extra action
        """),
    },
    {
        "source": "ftc",
        "title": "FTC Endorsement Guides — General Principles (§255.0–255.1)",
        "section": "255.0",
        "url": "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255/section-255.0",
        "platforms": "all",
        "content": textwrap.dedent("""\
            16 CFR § 255.0 — Purpose and Definitions
            16 CFR § 255.1 — General Considerations for Endorsements

            An "endorsement" is any advertising message that consumers are likely to believe
            reflects the opinions, beliefs, findings, or experience of a party other than the
            sponsoring advertiser.

            Key principles:
            - Endorsements must reflect the honest opinion of the endorser
            - Endorsers cannot make claims the advertiser itself could not legally make
            - An endorsement may not convey an impression that differs from the actual experience
              of the endorser with the product
            - If the endorser no longer has the views stated in the original ad, the endorsement
              must be discontinued or updated
            - Endorsements by organisations must reflect a genuine collective judgment of the
              organisation's membership

            Scope:
            - Applies to social media posts, video reviews, blog posts, podcasts, live streams
            - Applies to unpaid endorsers if there is any material connection (gifts, trips, etc.)
            - Applies to employees and brand ambassadors who post about their employer's products
            - Applies regardless of platform (YouTube, Instagram, TikTok, Twitter, Facebook, etc.)
        """),
    },
    {
        "source": "ftc",
        "title": "FTC Endorsement Guides — Testimonials and Results (§255.2)",
        "section": "255.2",
        "url": "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255/section-255.2",
        "platforms": "all",
        "content": textwrap.dedent("""\
            16 CFR § 255.2 — Consumer and Expert Endorsements

            Consumer endorsements:
            - If an ad represents an endorser as a typical consumer, the results depicted must
              actually be typical for consumers using the product as described
            - If results are not typical, a clear and conspicuous disclosure of what typical
              results are must be provided (e.g., "Results not typical. Average user loses 1 lb/week.")
            - "Results may vary" alone is NOT sufficient disclosure under current guidelines

            Expert endorsements:
            - An expert endorser must actually possess the expertise implied in the endorsement
            - The expert's endorsement must be supported by an actual exercise of that expertise
            - A doctor endorsing a medical product must have actually evaluated it professionally
            - Fake credentials or misrepresented expertise violates both FTC Act § 5 and these guides

            Before/after claims:
            - Before-and-after photos must reflect genuine results achievable by typical consumers
            - Photos must not be digitally altered to exaggerate results
            - The timeframe, diet, exercise, or other factors that contributed to the result must
              be disclosed if they would materially affect how consumers interpret the result
        """),
    },
    {
        "source": "ftc",
        "title": "FTC .com Disclosures — Social Media and Video Guidelines",
        "section": "dotcom-disclosures",
        "url": "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking",
        "platforms": "all",
        "content": textwrap.dedent("""\
            FTC .com Disclosures Guide — Key Rules for Social Media and Video Content

            Hashtag disclosures:
            - "#ad" and "#sponsored" are acceptable IF they are the first hashtag or placed
              prominently at the beginning of the caption/title
            - "#ad" buried as the 15th hashtag in a list is NOT compliant
            - "#ambassador" and "#partner" are NOT sufficient — too ambiguous for consumers

            Video-specific rules:
            - Verbal disclosures in videos must be made at the start, not only at the end
            - Written disclosures must appear in the video itself (superimposed text), not
              only in the video description which requires a click to expand
            - YouTube's "Includes paid promotion" banner satisfies the platform policy
              requirement but does NOT by itself satisfy FTC disclosure requirements —
              a verbal or on-screen disclosure is also required
            - If a video is a review of a product received for free, this must be disclosed
              both in the video and in the description

            Live streaming:
            - Sponsored live streams must have recurring disclosures (not just at the start)
              because viewers join at different points
            - Recommended: disclose every 15–20 minutes of a sponsored stream

            Sponsored social posts:
            - Instagram Stories: disclosure must be in the image or video itself, not just
              in the swipe-up link description
            - TikTok: "#ad" must be visible in the text overlay or caption, not hidden
            - Twitter/X: "#ad" or "Sponsored" must appear within the 280-character limit,
              not in a follow-up reply

            Influencer-specific guidance:
            - Micro-influencers (10k–100k followers) are held to the same standard as celebrities
            - Gifted-only relationships (no payment) still require disclosure if the creator
              promotes the product
            - Brand ambassadors must disclose their ongoing relationship even when they are not
              being paid for a specific post
        """),
    },
    {
        "source": "ftc",
        "title": "FTC Health and Medical Claims — Section 5 and FDA Cross-Reference",
        "section": "health-claims",
        "url": "https://www.ftc.gov/business-guidance/advertising-marketing/health-claims",
        "platforms": "all",
        "content": textwrap.dedent("""\
            FTC Act § 5 — Unfair or Deceptive Acts or Practices (Health Claims)
            Cross-reference: FDA 21 CFR Part 101 (Food Labeling), 21 CFR Part 202 (Prescription Drugs)

            Health claims prohibited in social media content:
            - Disease cure claims without FDA approval (e.g., "cures diabetes", "eliminates cancer")
            - Weight loss claims without substantiation (e.g., "lose 30 lbs in 30 days guaranteed")
            - Claims that imply FDA approval when none exists
            - Testimonials about extraordinary health results presented as typical

            Dietary supplement claims (DSHEA 1994):
            - Structure/function claims are allowed (e.g., "supports immune health") but must
              include: "This statement has not been evaluated by the Food and Drug Administration.
              This product is not intended to diagnose, treat, cure, or prevent any disease."
            - This disclaimer must be clear and conspicuous, not in fine print

            Substantiation requirement:
            - All objective claims about a product's performance must be substantiated by
              competent and reliable scientific evidence before the claim is made
            - Testimonials from real customers do not substitute for scientific substantiation
            - "Our customers say..." does not mean the claim is substantiated

            Social media influencers promoting health products must:
            1. Disclose any material connection to the brand
            2. Only make claims they personally believe to be true based on their own experience
            3. Not make claims the product's manufacturer could not legally make
            4. Include any required FDA disclaimers when promoting supplements or medical devices
        """),
    },

    # ── YouTube ───────────────────────────────────────────────────────────────
    {
        "source": "youtube",
        "title": "YouTube Paid Product Placement and Endorsement Policy",
        "section": "paid-product-placement",
        "url": "https://support.google.com/youtube/answer/154235",
        "platforms": "youtube",
        "content": textwrap.dedent("""\
            YouTube Paid Product Placement, Endorsements, and Sponsorships Policy

            Definition:
            Paid product placement is content where a third party has paid the creator to include
            a product, service, or brand mention within the video content itself (not as a separate ad).

            Creator requirements — you MUST:
            1. Enable the "video contains paid promotion" toggle in YouTube Studio before publishing
               any video with paid product placement, endorsements, or sponsorships
            2. Make a clear verbal or on-screen disclosure within the video (the YouTube banner alone
               is insufficient under FTC guidelines)
            3. Disclose in the video description

            The "Includes Paid Promotion" notice:
            - This banner appears automatically when you check the paid promotion box
            - It appears at the start of the video for a few seconds
            - It satisfies YouTube's PLATFORM requirement
            - It does NOT satisfy the FTC's LEGAL requirement — a verbal/text disclosure is also needed

            What counts as paid promotion requiring disclosure:
            - Cash payment to feature a product
            - Free products, trips, or services provided in exchange for inclusion
            - Affiliate links where you earn commission on sales (YouTube requires disclosure;
              FTC legally requires it)
            - Sponsored segments within otherwise non-sponsored content
            - Brand deal integrations (even if the creator has creative control)

            What does NOT require the paid promotion toggle:
            - Products you purchased yourself and are reviewing independently
            - Products you received but are NOT featuring/endorsing in the video
            - Self-promotion of your own merchandise (though FTC rules still apply)

            Violations:
            - Failing to check the paid promotion box on sponsored content can result in:
              - Video removal
              - Channel strike
              - Monetisation suspension
              - Termination from YouTube Partner Program
        """),
    },
    {
        "source": "youtube",
        "title": "YouTube Advertiser-Friendly Content Guidelines",
        "section": "advertiser-friendly",
        "url": "https://support.google.com/youtube/answer/6162278",
        "platforms": "youtube",
        "content": textwrap.dedent("""\
            YouTube Advertiser-Friendly Content Guidelines

            Content that is NOT suitable for most advertisers (limited or no ads):

            Inappropriate language:
            - Frequent use of strong profanity in the title, thumbnail, or first 30 seconds
            - Profanity throughout the video (occasional mild profanity is acceptable)

            Violence:
            - Graphic depictions of violence, bodily harm, or death
            - Content that glorifies or promotes violent acts

            Adult content:
            - Nudity or sexually suggestive content
            - Content that focuses on sexual acts or body parts in a suggestive manner

            Harmful or dangerous acts:
            - Content that instructs viewers how to commit crimes
            - Dangerous challenges or stunts that could result in injury
            - Drug use (showing recreational use of illegal substances)

            Hateful content:
            - Content that promotes hatred based on race, ethnicity, religion, gender,
              sexual orientation, disability, or nationality

            Misleading thumbnails and titles (particularly relevant for compliance):
            - Thumbnails or titles must accurately represent the video content
            - Clickbait that misleads viewers about the content is a policy violation
            - Using a sensationalised or misleading title to gain views is not allowed
            - Titles suggesting exclusivity ("World's First", "Only Video") when untrue

            Controversial or sensitive subjects:
            - Content that makes light of tragedies or disasters
            - Content involving public health crises that contradicts official guidance
        """),
    },
    {
        "source": "youtube",
        "title": "YouTube Community Guidelines — Spam and Deceptive Practices",
        "section": "spam-deceptive",
        "url": "https://support.google.com/youtube/answer/2801973",
        "platforms": "youtube",
        "content": textwrap.dedent("""\
            YouTube Community Guidelines — Spam, Deceptive Practices, and Scams

            Misleading metadata:
            - Video title, thumbnail, description, and tags must accurately represent
              the content of the video
            - Using keywords unrelated to the content to manipulate search results is prohibited
            - Adding irrelevant or excessive tags is prohibited
            - Using the name/face of a celebrity or influencer in thumbnails or titles without
              their involvement in the content is prohibited

            Artificial engagement:
            - Buying views, likes, subscribers, or comments is prohibited
            - Using third-party services that artificially inflate engagement metrics is prohibited
            - Coordinating like/comment campaigns in ways that mislead other users

            Impersonation:
            - Impersonating another creator, celebrity, company, or YouTube employee
            - Creating channels designed to look like another creator's channel

            Scams and fraud:
            - Get-rich-quick schemes, pyramid schemes, or multi-level marketing misrepresentation
            - Fake giveaways that require viewers to pay to enter or claim a prize
            - Phishing attempts within video descriptions or comments

            Links and external content:
            - Links in descriptions, comments, or end screens must direct to legitimate content
            - Affiliate links must be disclosed (see YouTube's paid promotion policy)
            - Links to malware, phishing sites, or adult content (without proper age gates) violate policy

            Context for compliance checking:
            - A video description that lists unrelated keywords to game search = violation
            - A title that implies a product does something it cannot = misleading metadata violation
            - Affiliate link in description without "#ad" or disclosure = sponsorship violation
        """),
    },
    {
        "source": "youtube",
        "title": "YouTube Partner Program Policies — Monetisation Requirements",
        "section": "yt-partner-program",
        "url": "https://support.google.com/youtube/answer/1311392",
        "platforms": "youtube",
        "content": textwrap.dedent("""\
            YouTube Partner Program (YPP) — Monetisation Policies

            To maintain YPP eligibility, creators must comply with:
            1. YouTube's Terms of Service
            2. YouTube's Community Guidelines
            3. YouTube's Advertiser-Friendly Content Guidelines
            4. Copyright laws — no uploading content you don't own or have rights to

            Sponsorship and brand deal rules for YPP creators:
            - All sponsored content must use the paid promotion disclosure toggle
            - Sponsored content that violates advertiser-friendly guidelines may result in
              demonetisation even with the paid promotion box checked
            - Creators cannot use YouTube's ad revenue AND hide that content is sponsored —
              double-monetising without disclosure is a policy violation

            Copyright in sponsored content:
            - Playing licensed music in a sponsored segment transfers any copyright claim
              to the video, which may divert ad revenue to the rights holder
            - Using royalty-free or licensed music is required for full monetisation

            Age-restricted content and sponsorships:
            - Age-restricted videos cannot display ads and cannot feature paid product placement
              for most product categories
            - Alcohol, gambling, and financial products sponsoring age-restricted content
              require additional compliance checks

            Consequences of policy violations:
            - Individual video demonetisation
            - Channel-level demonetisation (YPP suspension)
            - Copyright strikes (3 = channel termination)
            - Community Guidelines strikes (3 in 90 days = channel termination)
        """),
    },
]


# ──────────────────────────────────────────────────────────────────────────────
# Chunking
# ──────────────────────────────────────────────────────────────────────────────

CHUNK_SIZE  = 600   # words per chunk
CHUNK_OVERLAP = 80  # words of overlap between consecutive chunks


def chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks, start = [], 0
    while start < len(words):
        end = start + CHUNK_SIZE
        chunks.append(" ".join(words[start:end]))
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


# ──────────────────────────────────────────────────────────────────────────────
# Embedding  (local — all-MiniLM-L6-v2, 384 dims, no API key needed)
# ──────────────────────────────────────────────────────────────────────────────

def embed_batch(texts: list[str]) -> list[list[float]]:
    return _embedder.encode(texts, show_progress_bar=False).tolist()


# ──────────────────────────────────────────────────────────────────────────────
# Main ingestion
# ──────────────────────────────────────────────────────────────────────────────

def ingest():
    print("[ingest] Ensuring index exists...")
    ensure_index()

    search_client = SearchClient(
        endpoint=os.environ["AZURE_SEARCH_ENDPOINT"],
        index_name=INDEX_NAME,
        credential=AzureKeyCredential(os.environ["AZURE_SEARCH_API_KEY"]),
    )

    all_docs = []
    for doc in DOCS:
        print(f"[ingest] Processing: {doc['title'][:60]}...")
        chunks = chunk_text(doc["content"])
        print(f"         {len(chunks)} chunk(s)")
        for i, chunk in enumerate(chunks):
            doc_id = hashlib.md5(f"{doc['source']}-{doc['section']}-{i}".encode()).hexdigest()
            all_docs.append({
                "id": doc_id,
                "title": doc["title"],
                "content": chunk,
                "source": doc["source"],
                "section": doc["section"],
                "url": doc["url"],
                "platforms": doc["platforms"],
                "_chunk_text": chunk,
            })

    # Embed locally in batches
    print(f"\n[ingest] Embedding {len(all_docs)} chunks (local model)...")
    batch_size = 32
    for i in range(0, len(all_docs), batch_size):
        batch = all_docs[i : i + batch_size]
        vectors = embed_batch([d["_chunk_text"] for d in batch])
        for d, vec in zip(batch, vectors):
            d["content_vector"] = vec
        print(f"         {min(i + batch_size, len(all_docs))}/{len(all_docs)} embedded")

    upload_docs = [{k: v for k, v in d.items() if not k.startswith("_")} for d in all_docs]

    print(f"\n[ingest] Uploading {len(upload_docs)} documents to Azure AI Search...")
    result = search_client.upload_documents(documents=upload_docs)
    succeeded = sum(1 for r in result if r.succeeded)
    print(f"[ingest] Done — {succeeded}/{len(upload_docs)} documents indexed successfully.")


if __name__ == "__main__":
    ingest()
