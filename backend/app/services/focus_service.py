from app.models.focus import FocusPrediction


DISTRACTION_TYPES = {
    "face_absent": "You've been away from your desk",
    "phone_detected": "Phone detected",
    "social_media": "Social media opened",
    "video_site": "Video site opened",
    "rapid_switching": "Rapid window switching detected",
    "idle": "No activity detected",
}

FOCUSED_APPS = {
    "notion", "obsidian", "word", "pages", "docs",
    "excel", "numbers", "sheets", "code", "xcode", "cursor",
    "pycharm", "intellij", "vim", "neovim", "emacs", "sublime",
    "terminal", "iterm", "warp", "ghostty", "zotero", "anki",
    "acrobat", "preview", "kindle", "goodnotes", "notability",
    "zoom", "teams", "meet",  # lecture mode apps
}

DISTRACTION_APPS = {
    "instagram", "tiktok", "snapchat", "twitter", "x",
    "facebook", "reddit", "youtube", "netflix", "hulu",
    "discord", "messages", "whatsapp", "telegram",
    "twitch", "imessage", "threads", "bereal",
    "9gag", "tumblr", "pinterest",
}

# Video/entertainment patterns — used to classify video_site vs social_media
VIDEO_PATTERNS = {"youtube", "youtu.be", "netflix", "twitch", "hulu", "primevideo", "disneyplus"}

# Browser URL distraction domains — catches YouTube/Reddit in Chrome/Safari/etc.
DISTRACTION_DOMAINS = {
    "youtube.com", "youtu.be",
    "instagram.com", "tiktok.com",
    "twitter.com", "x.com",
    "facebook.com",
    "reddit.com",
    "netflix.com", "hulu.com",
    "twitch.tv",
    "9gag.com",
    "snapchat.com",
    "discord.com",
    "threads.net",
    "pinterest.com",
    "primevideo.com", "disneyplus.com",
}

# Physical study modes where Mac keyboard/mouse idle is normal (user is reading/writing on paper)
PHYSICAL_MODES = {"physical_book", "physical_writing"}

# Idle threshold: 5 minutes default; physical modes don't count Mac idle at all
IDLE_THRESHOLD_SECONDS = 300


def _is_video_distraction(text: str) -> bool:
    return any(v in text for v in VIDEO_PATTERNS)


def compute_focus_score(signals: dict) -> tuple[float, bool, str | None]:
    """
    Returns (score 0.0-1.0, is_focused bool, distraction_type or None).
    Score is computed from weighted signals sent by the desktop app.
    Camera data never leaves the device — only boolean signals arrive here.
    """
    score = 1.0
    distraction_type = None

    face_present: bool = signals.get("face_present", True)
    looking_at_screen: bool = signals.get("looking_at_screen", True)
    phone_detected: bool = signals.get("phone_detected", False)
    active_app: str = signals.get("active_app", "").lower()
    browser_url: str = (signals.get("browser_url") or "").lower()
    window_switches: int = signals.get("window_switches", 0)
    idle_seconds: int = signals.get("idle_seconds", 0)
    study_mode: str = signals.get("study_mode", "mac_pc")

    # ── Webcam signals (placeholder until MediaPipe integrated) ──────────────
    if not face_present:
        score -= 0.6
        distraction_type = "face_absent"

    if phone_detected:
        score -= 0.5
        distraction_type = "phone_detected"

    if not looking_at_screen:
        score -= 0.3

    # ── App-level distraction detection ──────────────────────────────────────
    app_distracted = any(d in active_app for d in DISTRACTION_APPS)
    if app_distracted:
        score -= 0.7
        distraction_type = "video_site" if _is_video_distraction(active_app) else "social_media"

    # ── Browser URL distraction detection (Chrome / Safari / Arc / Firefox) ──
    # Only fires if the app check didn't already catch it, so we don't double-penalise
    elif browser_url:
        url_distracted = any(domain in browser_url for domain in DISTRACTION_DOMAINS)
        if url_distracted:
            score -= 0.7
            distraction_type = "video_site" if _is_video_distraction(browser_url) else "social_media"

    # ── Rapid window switching ────────────────────────────────────────────────
    if window_switches > 5:
        score -= min(0.3, (window_switches - 5) * 0.05)
        if not distraction_type:
            distraction_type = "rapid_switching"

    # ── Idle detection (skipped for physical study modes) ────────────────────
    # In physical_book / physical_writing mode the student isn't typing — that's normal.
    if study_mode not in PHYSICAL_MODES and idle_seconds > IDLE_THRESHOLD_SECONDS:
        score -= 0.4
        if not distraction_type:
            distraction_type = "idle"

    score = max(0.0, min(1.0, score))
    is_focused = score >= 0.6 and distraction_type is None

    return score, is_focused, distraction_type


async def save_focus_prediction(
    user_id: str,
    session_id: str,
    window_start: int,
    window_end: int,
    signals: dict,
) -> FocusPrediction:
    score, is_focused, _ = compute_focus_score(signals)

    prediction = FocusPrediction(
        user_id=user_id,
        session_id=session_id,
        window_start=window_start,
        window_end=window_end,
        focus_score=score,
        is_focused=is_focused,
        signals=signals,
    )
    await prediction.insert()
    return prediction
