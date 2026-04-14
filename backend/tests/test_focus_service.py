import pytest
from app.services.focus_service import compute_focus_score


def test_fully_focused():
    signals = {
        "face_present": True,
        "looking_at_screen": True,
        "phone_detected": False,
        "active_app": "notion",
        "window_switches": 1,
        "idle_seconds": 0,
    }
    score, is_focused, distraction = compute_focus_score(signals)
    assert is_focused is True
    assert score >= 0.6
    assert distraction is None


def test_face_absent():
    signals = {
        "face_present": False,
        "looking_at_screen": False,
        "phone_detected": False,
        "active_app": "notion",
        "window_switches": 0,
        "idle_seconds": 0,
    }
    score, is_focused, distraction = compute_focus_score(signals)
    assert is_focused is False
    assert distraction == "face_absent"


def test_social_media_open():
    signals = {
        "face_present": True,
        "looking_at_screen": True,
        "phone_detected": False,
        "active_app": "instagram",
        "window_switches": 2,
        "idle_seconds": 0,
    }
    score, is_focused, distraction = compute_focus_score(signals)
    assert is_focused is False
    assert distraction == "social_media"


def test_phone_detected():
    signals = {
        "face_present": True,
        "looking_at_screen": False,
        "phone_detected": True,
        "active_app": "notion",
        "window_switches": 0,
        "idle_seconds": 0,
    }
    score, is_focused, distraction = compute_focus_score(signals)
    assert is_focused is False
    assert distraction == "phone_detected"


def test_checkin_only_fires_when_distracted():
    """Core product rule: check-ins never fire during focus."""
    focused_signals = {
        "face_present": True,
        "looking_at_screen": True,
        "phone_detected": False,
        "active_app": "code",
        "window_switches": 0,
        "idle_seconds": 0,
    }
    _, is_focused, distraction = compute_focus_score(focused_signals)
    fire_checkin = not is_focused and distraction is not None
    assert fire_checkin is False, "Check-in must NEVER fire during active focus"
