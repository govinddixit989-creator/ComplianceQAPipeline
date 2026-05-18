from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class ContentItem:
    """Normalised content from any platform — the compliance checker only sees this."""
    platform: str
    content_id: str
    url: str
    title: str
    description: str
    captions: str
    channel_name: str
    channel_url: str
    published_at: str
    thumbnail_url: str
    hashtags: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    mentions: list[str] = field(default_factory=list)
    raw: dict = field(default_factory=dict)          # original API payload

    @property
    def full_text(self) -> str:
        """Everything the compliance checker should read."""
        parts = [self.title, self.description, self.captions]
        return "\n\n".join(p for p in parts if p.strip())


class BaseConnector(ABC):
    """
    One method contract.  Adding a new platform = subclass this + register below.
    """

    @property
    @abstractmethod
    def platform(self) -> str: ...

    @abstractmethod
    async def fetch(self, url: str) -> ContentItem: ...

    @staticmethod
    def extract_hashtags(text: str) -> list[str]:
        import re
        return re.findall(r"#\w+", text)

    @staticmethod
    def extract_mentions(text: str) -> list[str]:
        import re
        return re.findall(r"@\w+", text)
