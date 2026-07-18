"""
Reference audio impact detector — validated against 4 ground-truth clips on 2026-07-17.

Validated behavior (see ground-truth-impacts.md):
  IMG_1183 (course DTL):        peak 1.430s  CONFIRMED   truth 1.400-1.433s
  IMG_5150 (range bay DTL):     peak 2.120s  CONFIRMED   truth 2.100-2.133s
  IMG_6774 (outdoor face-on):   peak ~10.44s CONFIRMED   truth 10.433-10.467s
  IMG_0687 (garage, reverb):    peak 6.525s  UNCONFIRMED truth ~6.525s (+/-2fr, acoustic)

Key design decisions, each earned by a measured failure:
  - 2kHz 4th-order Butterworth high-pass BEFORE envelope: the strike click is
    high-frequency; swing whoosh, reverb tails, and net thuds are low-frequency.
    Without it the gate demoted 3/3 correct peaks and the garage peak was ~10
    frames late.
  - Next-transient search restricted to the user-marked swing window: unrelated
    noises outside the window (club handling, ball scrapes) otherwise compete.
  - Asymmetric exclusion around the peak (-50ms/+300ms): reverb/secondary
    impacts trail the strike, never precede it.
  - Gate thresholds unchanged (>=20x ambient AND >=5x next transient). The
    high-pass fixes calibration; the thresholds were never the problem.

Dependencies: numpy, scipy. Audio input: mono float array + sample rate
(extract with: ffmpeg -i clip.mov -ac 1 -ar 16000 -f wav out.wav).
"""

import numpy as np
from scipy.signal import butter, sosfilt

HP_CUTOFF_HZ = 2000
HOP_S = 0.005
WIN_S = 0.010
EXCL_PRE_S = 0.050     # exclusion before peak for next-transient search
EXCL_POST_S = 0.300    # wider after peak: reverb trails the strike
GATE_AMBIENT = 20.0    # peak must be >= this x median RMS
GATE_NEXT = 5.0        # peak must be >= this x next transient


def detect_impact(audio: np.ndarray, sr: int,
                  window_start_s: float | None = None,
                  window_end_s: float | None = None) -> dict:
    """Locate the impact transient within the user-marked swing window.

    Returns dict with:
      impact_s        estimated impact time (seconds)
      confirmed       bool — True only if both dominance gates pass
      ambient_x       peak / median-RMS dominance
      next_x          peak / next-transient dominance
      note            human-readable method string for the sheet footer
    """
    # 1. high-pass: isolate the strike click from whoosh/reverb/thud energy
    sos = butter(4, HP_CUTOFF_HZ, "hp", fs=sr, output="sos")
    hp = sosfilt(sos, audio.astype(np.float64))

    # 2. short-window RMS envelope
    hop, win = int(sr * HOP_S), int(sr * WIN_S)
    n = (len(hp) - win) // hop
    rms = np.sqrt(np.mean(
        hp[np.arange(n)[:, None] * hop + np.arange(win)[None, :]] ** 2, axis=1))
    t = np.arange(n) * hop / sr

    # 3. restrict everything to the marked swing window
    lo = window_start_s if window_start_s is not None else t[0]
    hi = window_end_s if window_end_s is not None else t[-1]
    m = (t >= lo) & (t <= hi)
    t, rms = t[m], rms[m]
    if len(rms) == 0:
        return {"impact_s": None, "confirmed": False, "ambient_x": 0.0,
                "next_x": 0.0, "note": "no audio in window"}

    # 4. peak + dominance stats
    ambient = max(float(np.median(rms)), 1e-12)
    pi = int(np.argmax(rms))
    peak_t, peak_v = float(t[pi]), float(rms[pi])
    excl = (t < peak_t - EXCL_PRE_S) | (t > peak_t + EXCL_POST_S)
    next_v = float(rms[excl].max()) if excl.any() else 1e-12

    ambient_x = peak_v / ambient
    next_x = peak_v / next_v
    confirmed = (ambient_x >= GATE_AMBIENT) and (next_x >= GATE_NEXT)

    note = (f"audio impact click (hp{HP_CUTOFF_HZ // 1000}k), "
            f"{ambient_x:.0f}x ambient, {next_x:.1f}x next transient — "
            f"{'confirmed' if confirmed else 'unconfirmed, coverage safety rules kept'}")
    return {"impact_s": peak_t, "confirmed": confirmed,
            "ambient_x": ambient_x, "next_x": next_x, "note": note}
