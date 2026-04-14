from beanie import Document
from pydantic import Field


class FocusSignals(Document):
    keystrokes_pm: float = 0.0
    mouse_clicks_pm: float = 0.0
    window_switches: int = 0
    face_present: bool = False
    looking_at_screen: bool = False


class FocusPrediction(Document):
    user_id: str
    session_id: str
    window_start: int
    window_end: int
    focus_score: float
    is_focused: bool
    signals: dict = Field(default_factory=dict)

    class Settings:
        name = "focus_predictions"
        indexes = [
            "user_id",
            "session_id",
        ]
