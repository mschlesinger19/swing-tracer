# Ground-Truth Impact Reference

Verified by frame-level ball-departure inspection, performed independently of
the app pipeline.

**Method:** audio RMS transient analysis (5 ms hop) + visual ball-ROI departure
check at source-frame resolution. "True impact" = boundary between the last
frame with the ball present and the first frame with the ball gone.

## Clips

| clip | view | res | fps | dur | true impact (frames) | true impact (t) | raw audio peak | hp2k audio peak |
|------|------|-----|-----|-----|----------------------|-----------------|----------------|-----------------|
| IMG_1183.mov | DTL, course | 1080×1594 | 30 | 3.81 s | n=42 → n=43 | 1.400–1.433 s | 1.430 s ✓ | 1.430 s ✓ |
| IMG_5150.mov | DTL, range bay | 540×960 | 30 | 4.50 s | n=63 → n=64 | 2.100–2.133 s | 2.120 s ✓ | 2.120 s ✓ |
| IMG_6774.mov | Face-on, outdoor range | 1080×1920 | 30 | 17.43 s (unclipped) | n=313 → n=314 | 10.433–10.467 s | 10.465 s ✓ | 10.435 s ✓✓ (frame-exact) |

## Dominance stats: raw vs 2 kHz high-pass

Gate = CONFIRMED iff **≥20× ambient AND ≥5× next transient**. (6774 stats
computed within simulated user bounds 8.5–13.0 s.)

| clip | raw amb | raw next | raw gate | hp2k amb | hp2k next | hp2k gate | peak correct? |
|------|---------|----------|----------|----------|-----------|-----------|---------------|
| IMG_1183 | 17.9× | 5.5× | est. | 619× | 171× | CONFIRMED | YES |
| IMG_5150 | 19.8× | 2.7× | est. | 76.5× | 5.3× | CONFIRMED | YES |
| IMG_6774 | 37.2× | 3.5× | est. | 150× | 10.0× | CONFIRMED | YES |

## Findings

1. Raw-envelope peak finding was frame-accurate on all 3 clips, but the
   dominance gate demoted all 3 correct estimates (0/3 recall). Cause: swing
   whoosh and low-frequency rumble inflate ambient and "next transient"
   measurements. The gate as calibrated is safe but nearly useless.
2. A 4th-order Butterworth high-pass at 2 kHz before envelope computation fixes
   calibration with no threshold changes: all 3 correct peaks pass the existing
   gate. The impact click is broadband/high-frequency; whoosh and reverb are
   predominantly low-frequency.
3. hp2k also improved localization on IMG_6774 by ~1 frame (10.465 → 10.435 s,
   landing exactly on the club-at-ball frame).
4. Next-transient competitors identified: range ball-scrape sounds at 33–37% of
   peak (IMG_5150, t=3.48/3.93 s) and club-handling noise at clip end (IMG_6774,
   t=16.9 s — outside user bounds, which is why window-restricting the
   next-transient search matters).
5. Untested at the time: whether hp2k fixes the indoor-reverb late-peak case
   (garage face-on clip). See the addendum below — it does.

## Recommended changes

- Insert 2 kHz high-pass before RMS envelope in the audio impact detector. Keep
  existing gate thresholds (20×/5×). Re-run all archived clips; expect prior
  CONFIRMED clips to stay confirmed with larger margins.
- Restrict the next-transient search to the user-marked swing window (raw or
  filtered).
- Add these clips + impact frame numbers to the regression suite as ground
  truth: assert `|detected_impact − truth| ≤ 1 frame`, and assert gate outcome
  per the hp2k column.
- IMG_5150 note: 540 px source short side is at the Q1 floor (500 px). Sheets
  from this clip pass but are marginal — consider a footer warning when source
  short side < 640 px.

## Addendum: IMG_0687.mov — garage (indoor reverb) test case

1080×1920, 29.97 fps, 9.19 s. The hard case: audio is a train of ~10 transients
over 6.46–7.15 s (strike + net + floor bounces + reverb), and the ball is NOT
optically resolvable — a full-frame per-pixel scan found zero pixels with a
ball-departure step signature, so the ball-ROI check cannot run on this clip.
Impact determined by acoustic evidence rather than visual certification
(confidence: high, not frame-certified):

| candidate | t | hp2k dominance | attack (10–90%) | ZCR @ peak | verdict |
|-----------|---|----------------|-----------------|------------|---------|
| A (first transient) | 6.460 s | 249× amb | 4.5 ms | ~911 Hz | LF thud (90% LF) — footwork or incidental contact |
| B (hp2k peak) | 6.525 s | 419× amb | 2.0 ms | ~1316 Hz | club-strike click — best on every measure |

- **Best-evidence impact: 6.525 s (frame ~196), ±2 frames.**
- Raw-envelope peak lands at 6.865 s → ~10 frames late. This REPRODUCES the
  original garage failure mode (reverb/secondary bangs dominate the raw
  envelope).
- hp2k peak lands exactly on the best-evidence strike → hp2k fixes garage
  localization.
- hp2k next-transient dominance is only 1.6× → gate says **est.** — CORRECT
  behavior. A garage is genuinely multi-bang; audio alone should not confirm
  there, and the ball check can't rescue it. Indoor clips land in the
  honest-degraded path (est. marker + coverage rules), by design.

Regression entry for this clip: assert hp2k peak within ±2 frames of 6.525 s;
assert gate outcome UNCONFIRMED; assert the ball-departure check reports no-ball
rather than a false positive.

## Addendum 2 (2026-07-18): IMG_1259.mov — patio slo-mo + the iOS decode gap

1080×1920, 30 fps (slo-mo export), 14.53 s, AAC stereo + APAC spatial track.

**Why this clip is here:** it exposed that the audio path had never actually
run on-device. Safari's `decodeAudioData` refuses to demux audio from video
containers (.mov/.mp4) — Chrome demuxes them, so every desktop/headless test
passed while every iPhone export silently lost audio and fell back to the
motion peak (which slow-motion turns into noise; this clip's sheet anchored
"impact" on a finish-hold frame at 13.62 s and spent 9 of 18 frames on the
finish). Fixed in the app by extracting the mp4a track's frames from the
container and re-wrapping them as ADTS, which Safari accepts. The extractor
was validated against ffmpeg's container-aware demux on all 5 clips: detector
results within ±9 ms, identical gate outcomes. Two traps worth recording:

- The mp4a sample-entry `sampleRate` lives at offset +24 (16.16 fixed). A
  mis-read that defaulted to 48 kHz made the two 44.1 kHz tracks (IMG_5150,
  IMG_6774) decode 8.8% fast — a −805 ms impact error on a 17 s clip.
- The edit list trims ~2112 samples of AAC priming (~44 ms); the decoded
  ADTS stream must be shifted by the elst offset to sit on the movie clock.

**Impact reference:**

| evidence | t | note |
|----------|---|------|
| ball-departure (visual, certified) | n254 → n255, ≈8.47–8.50 s | ball on mat with clubhead arriving at n254; airborne at n255 |
| hp2k audio click | 8.630 s (onset 8.618 s) | sharp, clean, from silence; 68×/16.8× in window 4.78–13.62 s → CONFIRMED |

The ~+0.15 s disagreement is an **audio-vs-video retiming offset in the
slo-mo export itself** (Apple applies separate retime curves; the click is
not stretched, just placed late). No audio-only detector can correct this.
Consequence: on slo-mo exports the ★ impact marker may sit a few frames after
true contact; the dense pre-impact window (impact−0.35 s) still captures the
true-contact frame. The regression case for this clip asserts the
**audio-stream** truth (8.630 s), which is what the detector can and must
find.

Also reconfirmed on this clip: window restriction is load-bearing — clip-end
handling noise (13.9/14.3 s) outside the marked swing drops dominance from
16.8× to 1.9× if the search isn't windowed.

---

*Ground truth established 2026-07-17 (addenda 2026-07-18). These numbers are
physical truth, not calibration targets — do not loosen the test tolerances
in `test_detect_impact.py` to make a future change pass.*
