import re
import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled

from .base import BaseConnector, ContentItem

VIDEO_ID_RE = re.compile(
    r"(?:v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})"
)

YDL_OPTS = {
    "quiet": True,
    "no_warnings": True,
    "skip_download": True,       # metadata only, never download the video
    "extract_flat": False,
}


class YouTubeConnector(BaseConnector):
    platform = "youtube"

    async def fetch(self, url: str) -> ContentItem:
        video_id = self._extract_id(url)
        if not video_id:
            raise ValueError(f"Could not extract video ID from: {url}")

        # yt-dlp extracts everything from the URL — no API key needed
        with yt_dlp.YoutubeDL(YDL_OPTS) as ydl:
            info = ydl.extract_info(url, download=False)

        title         = info.get("title", "")
        description   = info.get("description", "") or ""
        channel_name  = info.get("uploader", "") or info.get("channel", "")
        channel_url   = info.get("uploader_url", "") or info.get("channel_url", "")
        published_at  = info.get("upload_date", "")          # YYYYMMDD
        tags          = info.get("tags", []) or []
        thumbnail_url = info.get("thumbnail", "")

        captions = self._fetch_captions(video_id)

        all_text = f"{title}\n{description}\n{captions}"

        return ContentItem(
            platform      = "youtube",
            content_id    = video_id,
            url           = f"https://www.youtube.com/watch?v={video_id}",
            title         = title,
            description   = description,
            captions      = captions,
            channel_name  = channel_name,
            channel_url   = channel_url,
            published_at  = published_at,
            thumbnail_url = thumbnail_url,
            tags          = tags,
            hashtags      = self.extract_hashtags(all_text),
            mentions      = self.extract_mentions(all_text),
        )

    def _extract_id(self, url: str) -> str | None:
        m = VIDEO_ID_RE.search(url)
        return m.group(1) if m else None

    def _fetch_captions(self, video_id: str) -> str:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            return " ".join(e["text"] for e in transcript)
        except (NoTranscriptFound, TranscriptsDisabled):
            return ""
        except Exception:
            return ""
