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
    "excel", "numbers", "sheets", "code", "xcode",
    "pycharm", "intellij", "vim", "neovim", "emacs",
    "terminal", "iterm", "warp", "zotero", "anki",
    "acrobat", "preview", "kindle",
}

DISTRACTION_APPS = {
    "instagram", "tiktok", "snapchat", "twitter", "x",
    "facebook", "reddit", "youtube", "netflix", "hulu",
    "discord", "messages", "whatsapp", "telegram",
    "twitch", "imessage",
}


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
    window_switches: int = signals.get("window_switches", 0)
    idle_seconds: int = signals.get("idle_seconds", 0)

    if not face_present:
        score -= 0.6
        distraction_type = "face_absent"

    if phone_detected:
        score -= 0.5
        distraction_type = "phone_detected"

    if not looking_at_screen:
        score -= 0.3

    if any(app in active_app for app in DISTRACTION_APPS):
        score -= 0.7
        distraction_type = "social_media" if active_app not in {"youtube", "netflix", "twitch", "hulu"} else "video_site"

    if window_switches > 5:
        score -= min(0.3, (window_switches - 5) * 0.05)
        if not distraction_type:
            distraction_type = "rapid_switching"

    if idle_seconds > 300:
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
