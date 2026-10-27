"""SRT and VTT subtitle file parser."""
import re
from dataclasses import dataclass


@dataclass
class SubtitleCue:
    index: int
    start_ms: int
    end_ms: int
    text: str


def _timestamp_to_ms(ts: str) -> int:
    """Convert HH:MM:SS,mmm or HH:MM:SS.mmm to milliseconds."""
    ts = ts.strip().replace(",", ".")
    parts = ts.split(":")
    if len(parts) == 3:
        h, m, s = parts
    elif len(parts) == 2:
        h, m, s = "0", parts[0], parts[1]
    else:
        raise ValueError(f"Unrecognised timestamp: {ts!r}")
    sec, ms = (s.split(".") + ["0"])[:2]
    return (
        int(h) * 3_600_000
        + int(m) * 60_000
        + int(sec) * 1_000
        + int(ms[:3].ljust(3, "0"))
    )


def _strip_tags(text: str) -> str:
    """Remove HTML/VTT inline tags and cue settings."""
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\{[^}]+\}", "", text)
    return text.strip()


def parse_srt(content: str) -> list[SubtitleCue]:
    content = content.strip().replace("\r\n", "\n").replace("\r", "\n")
    blocks = re.split(r"\n{2,}", content)
    cues: list[SubtitleCue] = []
    for block in blocks:
        lines = block.strip().splitlines()
        if len(lines) < 3:
            continue
        # First line is index (may be absent in malformed SRTs — be lenient)
        try:
            idx = int(lines[0].strip())
            time_line = lines[1]
            text_lines = lines[2:]
        except ValueError:
            idx = len(cues) + 1
            time_line = lines[0]
            text_lines = lines[1:]

        arrow_match = re.match(
            r"(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})",
            time_line,
        )
        if not arrow_match:
            continue

        text = _strip_tags(" ".join(text_lines)).strip()
        if not text:
            continue

        cues.append(SubtitleCue(
            index=idx,
            start_ms=_timestamp_to_ms(arrow_match.group(1)),
            end_ms=_timestamp_to_ms(arrow_match.group(2)),
            text=text,
        ))
    return cues


def parse_vtt(content: str) -> list[SubtitleCue]:
    content = content.strip().replace("\r\n", "\n").replace("\r", "\n")
    if not content.startswith("WEBVTT"):
        raise ValueError("Not a valid VTT file — missing WEBVTT header.")
    # Drop header block
    body = re.sub(r"^WEBVTT[^\n]*\n", "", content, count=1)
    # Drop NOTE and STYLE blocks
    body = re.sub(r"NOTE\b[^\n]*(?:\n[^\n]+)*", "", body)
    body = re.sub(r"STYLE\b[^\n]*(?:\n[^\n]+)*", "", body)
    blocks = re.split(r"\n{2,}", body)
    cues: list[SubtitleCue] = []
    for block in blocks:
        lines = [l for l in block.strip().splitlines() if l.strip()]
        if not lines:
            continue
        # Optional cue identifier on the first line
        time_line_idx = 0
        if "-->" not in lines[0]:
            time_line_idx = 1
        if time_line_idx >= len(lines):
            continue

        arrow_match = re.match(
            r"(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3}|"
            r"\d{1,2}:\d{2}[,\.]\d{1,3})\s*-->\s*"
            r"(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3}|"
            r"\d{1,2}:\d{2}[,\.]\d{1,3})",
            lines[time_line_idx],
        )
        if not arrow_match:
            continue

        text = _strip_tags(" ".join(lines[time_line_idx + 1:])).strip()
        if not text:
            continue

        cues.append(SubtitleCue(
            index=len(cues) + 1,
            start_ms=_timestamp_to_ms(arrow_match.group(1)),
            end_ms=_timestamp_to_ms(arrow_match.group(2)),
            text=text,
        ))
    return cues


def parse_subtitle_file(filename: str, content: str) -> list[SubtitleCue]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "srt":
        return parse_srt(content)
    if ext == "vtt":
        return parse_vtt(content)
    raise ValueError(f"Unsupported subtitle format '.{ext}'. Upload an .srt or .vtt file.")
