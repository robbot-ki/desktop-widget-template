# -*- coding: utf-8 -*-
"""Whisper worker for the desktop widget.

Loads the model once, then reads one JSON job per line from stdin:
    {"file": "path/to/audio.webm"}
and answers with one JSON line per job:
    {"text": "..."}   or   {"error": "..."}
The first line after loading is {"ready": true}. Everything runs locally, telemetry is off.

Settings come from environment variables set by main.js:
    WIDGET_MODEL     model name (default large-v3-turbo)
    WIDGET_THREADS   CPU threads, 0 = automatic
    WIDGET_LANGUAGE  "en" or "de" (language of your speech)
"""
import json
import os
import sys

os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
sys.stdout.reconfigure(encoding="utf-8")
sys.stdin.reconfigure(encoding="utf-8")

from faster_whisper import WhisperModel  # noqa: E402


def send(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
    sys.stdout.flush()


MODEL = os.environ.get("WIDGET_MODEL", "large-v3-turbo")
LANGUAGE = os.environ.get("WIDGET_LANGUAGE", "en")
THREADS = int(os.environ.get("WIDGET_THREADS", "0") or 0)
if THREADS <= 0:
    THREADS = min(8, os.cpu_count() or 4)

model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=THREADS)
send({"ready": True})

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        path = json.loads(line)["file"]
        segments, _info = model.transcribe(
            path,
            language=LANGUAGE,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
            condition_on_previous_text=False,
            beam_size=1,
        )
        send({"text": " ".join(s.text.strip() for s in segments).strip()})
    except Exception as e:  # noqa: BLE001
        send({"error": str(e)})
