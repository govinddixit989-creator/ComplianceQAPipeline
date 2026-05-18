from pydantic import BaseModel
from typing import Literal


# ── Summary (Hero stats) ──────────────────────────────────────────────────────
class SummaryResponse(BaseModel):
    accuracy_rate: str
    avg_check_time: str
    rules_enforced: str
    frameworks: int


# ── Metrics (MetricsBar) ──────────────────────────────────────────────────────
class Metric(BaseModel):
    label: str
    value: str
    change: str
    up: bool


class MetricsResponse(BaseModel):
    metrics: list[Metric]


# ── Compliance checks (ComplianceCards) ──────────────────────────────────────
class ComplianceCheck(BaseModel):
    id: str
    name: str
    status: Literal["pass", "warning", "fail"]
    score: int
    framework: str
    category: str


class ChecksResponse(BaseModel):
    checks: list[ComplianceCheck]


# ── Pipeline run results (ResultsTable) ───────────────────────────────────────
class RunResult(BaseModel):
    id: str
    doc: str
    framework: str
    rules: int
    passed: int
    status: Literal["pass", "warning", "fail"]
    time: str


class ResultsResponse(BaseModel):
    results: list[RunResult]


# ── Activity feed (BentoGrid) ─────────────────────────────────────────────────
class ActivityEvent(BaseModel):
    label: str
    time: str
    type: Literal["pass", "fail", "warning", "info"]


class ActivityResponse(BaseModel):
    events: list[ActivityEvent]


# ── Trend sparkline (BentoGrid) ───────────────────────────────────────────────
class TrendResponse(BaseModel):
    points: list[int]
    labels: list[str]


# ── Frameworks (BentoGrid) ────────────────────────────────────────────────────
class Framework(BaseModel):
    name: str
    color: str


class FrameworksResponse(BaseModel):
    total: int
    frameworks: list[Framework]


# ── Accuracy breakdown (BentoGrid) ───────────────────────────────────────────
class AccuracyScore(BaseModel):
    label: str
    pct: int
    color: str


class AccuracyResponse(BaseModel):
    overall: str
    description: str
    scores: list[AccuracyScore]


# ── Pipeline run trigger ──────────────────────────────────────────────────────
class PipelineRunRequest(BaseModel):
    document: str | None = None
    framework: str | None = None


class PipelineRunResponse(BaseModel):
    run_id: str
    status: str
    message: str
