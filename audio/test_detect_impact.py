"""Regression tests for detect_impact against verified ground truth.

Run: python3 test_detect_impact.py  (expects the 4 wav files alongside;
extract with ffmpeg -i CLIP.mov -ac 1 -ar 16000 -f wav CLIP.wav)

Ground truth established 2026-07-17 by independent frame-level ball-departure
inspection (IMG_1183, IMG_5150, IMG_6774) and acoustic attack/spectral analysis
(IMG_0687, ball not optically resolvable). Do not loosen tolerances to make a
change pass — these numbers are physical truth, not calibration targets.
"""

import wave
import numpy as np
from detect_impact import detect_impact

FPS30 = 1 / 30  # tolerance unit: one 30fps frame

CASES = [
    # (wav, window, truth_impact_s, tol_s, expect_confirmed)
    ("IMG_1183.wav", (None, None), 1.417, 1.5 * FPS30, True),
    ("IMG_5150.wav", (None, None), 2.117, 1.5 * FPS30, True),
    ("IMG_6774.wav", (8.5, 13.0), 10.450, 1.5 * FPS30, True),   # unclipped source: window required
    ("IMG_0687.wav", (5.0, 8.5), 6.525, 2.5 * FPS30, False),    # garage: must stay unconfirmed
]


def load(path):
    w = wave.open(path)
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16) / 32768.0
    return x, w.getframerate()


def main():
    failures = 0
    for wav, (lo, hi), truth, tol, expect_conf in CASES:
        x, sr = load(wav)
        r = detect_impact(x, sr, lo, hi)
        err = abs(r["impact_s"] - truth)
        ok_t = err <= tol
        ok_c = r["confirmed"] == expect_conf
        status = "PASS" if (ok_t and ok_c) else "FAIL"
        failures += 0 if (ok_t and ok_c) else 1
        print(f"{status} {wav}: impact {r['impact_s']:.3f}s (truth {truth:.3f} "
              f"err {err * 1000:.0f}ms tol {tol * 1000:.0f}ms) "
              f"conf={r['confirmed']} (expect {expect_conf}) "
              f"[{r['ambient_x']:.0f}x/{r['next_x']:.1f}x]")
    print(f"\n{len(CASES) - failures}/{len(CASES)} passed")
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
