"""eSpeak-NG engine adapter."""
import io
import shutil
import subprocess
import tempfile
import os

import numpy as np

from app.services.engines.base import AbstractTTSEngine, strip_ssml


class ESpeakAdapter(AbstractTTSEngine):
    """Wraps eSpeak-NG via subprocess for offline TTS synthesis."""

    BINARY_NAMES = ["espeak-ng", "espeak"]

    def _find_binary(self) -> str:
        for name in self.BINARY_NAMES:
            path = shutil.which(name)
            if path:
                return path
        raise RuntimeError(
            "eSpeak-NG binary not found. Install espeak-ng to use this engine."
        )

    def synthesize(self, text: str, voice_id: str, params: dict) -> bytes:
        binary = self._find_binary()

        # Strip SSML — eSpeak doesn't support it natively
        plain_text = strip_ssml(text)

        speed = int(params.get('speed', 1.0) * 175)  # eSpeak default ~175 wpm
        pitch = int(params.get('pitch', 1.0) * 50)   # eSpeak pitch 0-99, default 50
        volume = int(params.get('volume', 0.8) * 200) # eSpeak amplitude 0-200

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            result = subprocess.run(
                [
                    binary,
                    '--ipa=0',
                    '-v', 'en-us',
                    '-s', str(speed),
                    '-p', str(pitch),
                    '-a', str(volume),
                    '-w', tmp_path,
                    plain_text,
                ],
                capture_output=True,
                timeout=30,
            )

            if result.returncode != 0:
                raise RuntimeError(
                    f"eSpeak synthesis failed: {result.stderr.decode(errors='replace')}"
                )

            with open(tmp_path, 'rb') as f:
                wav_bytes = f.read()

        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

        if not wav_bytes:
            raise ValueError("Engine returned no audio. Try different text or voice settings.")

        return wav_bytes
