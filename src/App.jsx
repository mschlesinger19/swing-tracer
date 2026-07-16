import React, { useState, useRef, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/* Content: checkpoints, faults, drills                                */
/* ------------------------------------------------------------------ */

// Only the swing's bounds are marked directly — everything in between is
// sampled automatically for export (see getExportFrames). The individual
// P-position checkpoints referenced in CHECKPOINTS/FAULTS below are still
// useful instructional reference text; they just aren't separately marked.
const POSITIONS = [
  { id: "p1", label: "Swing start" },
  { id: "p10", label: "Swing end" },
];

const CHECKPOINTS = {
  dtl: [
    {
      pos: "P1 · Setup",
      what: "Draw a line up the shaft through the body — this is your reference plane. Add a vertical line touching the tush; it's your early-extension reference for the whole swing. Arms should hang under the shoulders.",
    },
    {
      pos: "P2 · Shaft parallel back",
      what: "Clubhead stays just outside the hands, shaft roughly parallel to the toe line. If the club whips inside here, expect compensations later.",
    },
    {
      pos: "P4 · Top",
      what: "Shaft points at the target or slightly left of it (parallel across the line is fine). Pointing right of target = across the line. Lead arm sits near the shoulder plane.",
    },
    {
      pos: "P6 · Shaft parallel down",
      what: "The money frame. Shaft should be on or just under the setup plane line, hands working down and in — not out toward the ball.",
    },
    {
      pos: "P7 · Impact",
      what: "Tush still touching the vertical line from setup, spine angle maintained, hips open. Rising belt line or a gap at the tush line = early extension.",
    },
    {
      pos: "P10 · Finish",
      what: "Balanced, chest facing the target, weight fully on the lead side.",
    },
  ],
  fo: [
    {
      pos: "P1 · Setup",
      what: "Check ball position (forward of center for driver, middle for wedges), slight trail-side spine tilt, pressure about 50/50 (a touch more trail side with driver).",
    },
    {
      pos: "P2–P4 · Backswing",
      what: "Head stays roughly centered — draw a vertical line at the trail hip/head at setup. Load into the trail hip without the hip or head drifting outside the trail foot.",
    },
    {
      pos: "P6 · Delivery",
      what: "Pressure strongly into the lead side (~70–80%), hips opening, wrist angles still loaded. If the club has fully released here, that's a cast.",
    },
    {
      pos: "P7 · Impact",
      what: "Irons: hands ahead of the ball with visible shaft lean. Driver: head slightly behind the ball, hitting up. Weight stacked into the lead leg.",
    },
    {
      pos: "P8–P10 · Release & finish",
      what: "Both arms extend fully past the ball (no lead-elbow chicken wing), full rotation, balanced hold on the lead leg.",
    },
  ],
};

const FAULTS = {
  dtl: [
    {
      id: "ott",
      name: "Over the top",
      look:
        "Draw the shaft plane line at P1. In transition (P5–P6), watch whether the hands and clubhead move OUT above that line toward the ball. Steep, out-to-in delivery usually shows a shaft above the plane line at P6.",
      drills: [
        {
          name: "Pump drill",
          how: "Swing to the top, then rehearse P4→P6 three times, dropping the shaft under the plane line each time. On the third pump, hit the ball at 70% speed.",
        },
        {
          name: "Headcover gate",
          how: "Place a headcover just outside and slightly above the ball line. Miss it on the way down — contact means the club came over the top.",
        },
        {
          name: "Drop-step feel",
          how: "From the top, feel the trail shoulder stay back while pressure shifts lead — like the first move is 'down' with the arms, not 'out' with the shoulders.",
        },
      ],
    },
    {
      id: "early-ext",
      name: "Early extension",
      look:
        "Draw a vertical line touching the tush at P1. If the hips thrust toward the ball in the downswing, a gap opens at that line and the belt buckle rises through impact.",
      drills: [
        {
          name: "Glute wall drill",
          how: "Set up with your tush brushing a wall. Make slow swings keeping contact (or near-contact) from P1 through impact — trail glute, then lead glute.",
        },
        {
          name: "Chair drill",
          how: "Place a chair or bag behind you at setup depth. Hit half shots without losing contact through the strike.",
        },
        {
          name: "Hinge-and-hold rehearsals",
          how: "Slow-motion swings to P7 holding hip hinge, checking the tush line in the mirror or on camera each rep.",
        },
      ],
    },
    {
      id: "across",
      name: "Across the line at the top",
      look:
        "Pause at P4. For a right-hander, the shaft pointing right of the target line means it's across the line — a common source of steep or stuck deliveries.",
      drills: [
        {
          name: "Trail armpit drill",
          how: "Keep a glove or towel lightly pinched in the trail armpit to the top. It keeps the trail elbow in front of the seam and shortens the arm run-on.",
        },
        {
          name: "Stop-at-top checks",
          how: "Swing to P4 and stop. Film or mirror-check that the shaft points at or left of the target before completing the swing.",
        },
        {
          name: "Flat lead wrist reps",
          how: "Rehearse the top with a flat (or slightly bowed) lead wrist — a cupped wrist at P4 often drags the club across the line.",
        },
      ],
    },
    {
      id: "posture",
      name: "Loss of posture / standing up",
      look:
        "Compare spine angle at P1 vs P6–P7 using the angle tool. The head rising and the chest lifting out of the shot go hand-in-hand with early extension and thin strikes.",
      drills: [
        {
          name: "Head-on-wall drill",
          how: "Rest your forehead lightly on a wall (no club), take your posture, and rotate back and through without the head pushing off the wall.",
        },
        {
          name: "Maintain-flex pumps",
          how: "Slow swings focusing on keeping trail-knee flex and chest-down feel through the delivery zone.",
        },
      ],
    },
    {
      id: "inside-takeaway",
      name: "Takeaway too inside",
      look:
        "At P2, the clubhead should be just outside or covering the hands. If it's well inside the hands with the face rolled open, the club tends to lift steep or go across the line later.",
      drills: [
        {
          name: "Takeaway gate",
          how: "Lay an alignment stick along the toe line. Trace the clubhead just outside it to P2, keeping the face looking at the ball longer.",
        },
        {
          name: "One-piece triangle",
          how: "Rehearse P1→P2 moving chest, arms and club together — no independent hand roll.",
        },
      ],
    },
  ],
  fo: [
    {
      id: "sway",
      name: "Sway off the ball",
      look:
        "Draw a vertical line at the outside of the trail hip at P1. In the backswing the hip should load and rotate INTO that line, not slide past it. Head drifting well right of its setup spot is the same fault.",
      drills: [
        {
          name: "Stick outside trail hip",
          how: "Stab an alignment stick in the ground (or place a bag) just outside the trail hip. Turn without bumping it.",
        },
        {
          name: "Trail-knee flex hold",
          how: "Keep some trail-knee flex to the top — the knee straightening and drifting is usually where the sway starts.",
        },
      ],
    },
    {
      id: "hang-back",
      name: "Hanging back",
      look:
        "At P7, pressure should be clearly into the lead side with the hips open. Weight stuck on the trail foot, excessive backward spine tilt and a scoopy release are the tell-tales.",
      drills: [
        {
          name: "Step drill",
          how: "Start with feet together, step toward the target with the lead foot as the club starts down, then swing through. Forces the shift before the strike.",
        },
        {
          name: "Lead-leg finish holds",
          how: "Hit half shots finishing fully stacked over the lead leg, holding the finish for a 3-count.",
        },
      ],
    },
    {
      id: "cast",
      name: "Casting / early release",
      look:
        "Use the angle tool on the lead arm and shaft when the lead arm is parallel down (P6). Under ~90° retained is a throwaway — expect weak, high strikes and no shaft lean at P7.",
      drills: [
        {
          name: "Whoosh drill",
          how: "Flip a club upside down and make swings, making the loudest 'whoosh' happen past the lead leg — not at the top of the downswing.",
        },
        {
          name: "Pump-and-hold",
          how: "Pump P4→P6 keeping the wrist angle loaded, then hit at partial speed retaining lag into the strike.",
        },
        {
          name: "Split-grip swings",
          how: "Grip with hands separated a few inches and swing — the split makes an early throwaway feel obvious.",
        },
      ],
    },
    {
      id: "chicken-wing",
      name: "Chicken wing",
      look:
        "Through P8, both arms should extend fully. A lead elbow that bends and points at the target right after impact is the wing — usually paired with a steep, out-to-in delivery.",
      drills: [
        {
          name: "Towel under lead arm",
          how: "Pin a towel or glove under the lead armpit and hit smooth half shots without dropping it until well past impact.",
        },
        {
          name: "P8 handshake",
          how: "Rehearse swinging to P8 with both arms long and the clubhead 'shaking hands' down the target line.",
        },
      ],
    },
    {
      id: "reverse-spine",
      name: "Reverse spine tilt",
      look:
        "At P4, the upper body leaning TOWARD the target (instead of a slight tilt away) is reverse spine — it forces a steep transition and is rough on the lower back.",
      drills: [
        {
          name: "Setup tilt rehearsal",
          how: "At address, bump the lead hip slightly toward the target so the spine tilts a touch away. Re-check tilt at P4 on camera.",
        },
        {
          name: "Load-the-trail-side feel",
          how: "Backswing feels: chest turns 'behind' the ball, pressure into the trail heel, head steady.",
        },
      ],
    },
  ],
};

const SPEEDS = [0.1, 0.25, 0.5, 1, 2];
const FPS_OPTIONS = [30, 60, 120, 240];
const DRAW_COLORS = ["#FF5A36", "#EDF2EA", "#55C97B", "#4DA3FF"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmt = (t) => {
  if (!isFinite(t)) return "0:00.00";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
};

const angleBetween = (a, v, b) => {
  const v1 = { x: a.x - v.x, y: a.y - v.y };
  const v2 = { x: b.x - v.x, y: b.y - v.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (!m1 || !m2) return 0;
  return (Math.acos(Math.min(1, Math.max(-1, dot / (m1 * m2)))) * 180) / Math.PI;
};

const lineAngleDeg = (p1, p2, w, h) => {
  // angle vs horizontal in *pixel* space so it matches what you see
  const dx = (p2.x - p1.x) * w;
  const dy = (p2.y - p1.y) * h;
  let deg = Math.abs((Math.atan2(-dy, dx) * 180) / Math.PI);
  if (deg > 90) deg = 180 - deg;
  return deg;
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function SwingTracer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);

  const [src, setSrc] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(0.5);
  const [fps, setFps] = useState(60);
  const [view, setView] = useState("dtl");
  const [tool, setTool] = useState("off");
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const [shapes, setShapes] = useState([]);
  const [draft, setDraft] = useState(null);
  const [anglePts, setAnglePts] = useState([]);
  const [markers, setMarkers] = useState({});
  const [markMode, setMarkMode] = useState(false);
  const [loop, setLoop] = useState(false);
  const [tab, setTab] = useState("ai");
  const [showIntro, setShowIntro] = useState(true);
  const [flags, setFlags] = useState({});
  const [notes, setNotes] = useState("");
  const [openFault, setOpenFault] = useState(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [scrubT, setScrubT] = useState(null); // non-null while finger owns the scrubber
  const wasPlayingRef = useRef(false);
  const primedRef = useRef(false); // first frame painted yet?
  const [loadState, setLoadState] = useState("idle"); // idle | loading | ready | error
  const [loadMsg, setLoadMsg] = useState("");
  const fileRef = useRef(null);
  const triedDataUrl = useRef(false);
  const [aiState, setAiState] = useState("idle"); // idle | capturing | analyzing | done | error
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");
  // { action: null|"sheet"|"prompt"|"share", status: "idle"|"working"|"done"|"copied" } —
  // action isolates which button's label should react; status alone (via
  // exportBusy below) still gates the shared single-occupancy video access
  const [exportState, setExportState] = useState({ action: null, status: "idle" });
  const exportBusy = exportState.status === "working";
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem("swing-tracer-api-key") || ""; } catch { return ""; }
  });
  const saveApiKey = (k) => {
    setApiKey(k);
    try { localStorage.setItem("swing-tracer-api-key", k); } catch {}
  };
  const [hevcOk] = useState(() => {
    const t = document.createElement("video");
    return !!(
      t.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"') ||
      t.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"') ||
      t.canPlayType('video/quicktime; codecs="hvc1"')
    );
  });

  /* ---------- video wiring ---------- */

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (src && src.startsWith("blob:")) URL.revokeObjectURL(src);
    fileRef.current = f;
    triedDataUrl.current = false;
    primedRef.current = false;
    setLoadState("loading");
    setLoadMsg(`Loading ${f.name} (${(f.size / 1048576).toFixed(1)} MB)…`);
    setSrc(URL.createObjectURL(f));
    setShapes([]);
    setAnglePts([]);
    setMarkers({});
    setSuggested({});
    setDetectState("idle");
    setDetectMsg("");
    setDetectTrace(null);
    setPlaying(false);
    setTime(0);
  };

  const onVideoError = () => {
    const f = fileRef.current;
    const err = videoRef.current?.error;
    const code = err?.code; // 1 aborted, 2 network, 3 decode, 4 src not supported
    if (f && !triedDataUrl.current) {
      // Blob URLs can be blocked by the sandbox's content policy — retry as a data URL.
      triedDataUrl.current = true;
      setLoadState("loading");
      setLoadMsg("First loader was blocked — retrying with an embedded loader (large clips take a few seconds)…");
      const r = new FileReader();
      r.onload = () => setSrc(r.result);
      r.onerror = () => {
        setLoadState("error");
        setLoadMsg("Couldn't read the file from disk. Try re-selecting it.");
      };
      r.readAsDataURL(f);
    } else {
      setLoadState("error");
      const detail = `[error code ${code ?? "?"}${err?.message ? `: ${err.message}` : ""}]`;
      if (code === 4) {
        setLoadMsg(
          `Both loaders were rejected ${detail}. Error 4 means the source was refused — either this environment's security sandbox blocks local video playback (common in embedded app browsers), or the container/codec is unsupported. To tell which: try a known H.264 clip here. If H.264 also fails, it's the sandbox — the app needs to run as a standalone page (e.g. GitHub Pages) instead of inside this preview. If H.264 works, it's the codec — share/AirDrop the .mov so iOS converts it, or film in Most Compatible.`
        );
      } else if (code === 3) {
        setLoadMsg(
          `The clip started loading but failed to decode ${detail}. The file may be corrupted or use an unusual encoding profile. Trim it in Photos and save as a new clip to force a clean re-encode.`
        );
      } else {
        setLoadMsg(
          `Playback failed ${detail}. Try re-selecting the file; if it persists, test a short H.264 clip to rule out a sandbox restriction on local video.`
        );
      }
    }
  };

  // true while a frame-capture pass (export or AI analysis) is seeking
  // through the video — playback/frame-stepping must stay off the video
  // element while that has exclusive control of it
  const busy = exportBusy || aiState === "capturing" || aiState === "analyzing";

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || busy) return;
    if (v.paused) {
      v.playbackRate = speed;
      v.play();
    } else v.pause();
  };

  const step = (dir) => {
    const v = videoRef.current;
    if (!v || busy) return;
    v.pause();
    v.currentTime = Math.min(Math.max(0, v.currentTime + dir / fps), duration || 0);
  };

  const seek = (t) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, t), duration || 0);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed, src]);

  // iOS won't reliably decode the first frame until playback happens, even
  // with a nudge seek. Muted videos may be played programmatically, so:
  // play for one frame, pause, rewind — guarantees a painted first frame.
  const primeFirstFrame = () => {
    const v = videoRef.current;
    if (!v || primedRef.current) return;
    primedRef.current = true;
    const p = v.play();
    if (p && p.then) {
      p.then(() => {
        requestAnimationFrame(() => {
          v.pause();
          try { v.currentTime = 0; } catch {}
        });
      }).catch(() => {
        try { v.currentTime = 0.01; } catch {} // fallback: the old nudge
      });
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setTime(v.currentTime);
    if (loop && markers.p1 != null && markers.p10 != null && markers.p10 > markers.p1) {
      if (v.currentTime >= markers.p10) v.currentTime = markers.p1;
    }
  };

  /* ---------- canvas sizing + drawing ---------- */

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setStageSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

  const drawShape = useCallback((ctx, s, w, h) => {
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    const P = (p) => ({ x: p.x * w, y: p.y * h });

    const chip = (text, x, y) => {
      ctx.font = "600 12px 'JetBrains Mono', ui-monospace, monospace";
      const tw = ctx.measureText(text).width;
      ctx.save();
      ctx.fillStyle = "rgba(10,14,11,0.85)";
      ctx.beginPath();
      ctx.roundRect(x - 6, y - 16, tw + 12, 22, 5);
      ctx.fill();
      ctx.restore();
      ctx.fillText(text, x, y);
    };

    if (s.type === "line") {
      const a = P(s.pts[0]), b = P(s.pts[1]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const deg = lineAngleDeg(s.pts[0], s.pts[1], w, h);
      chip(`${deg.toFixed(1)}°`, (a.x + b.x) / 2 + 8, (a.y + b.y) / 2 - 8);
    }
    if (s.type === "circle") {
      const c = P(s.pts[0]), e = P(s.pts[1]);
      const r = Math.hypot(e.x - c.x, e.y - c.y);
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (s.type === "angle") {
      const [a, v, b] = s.pts.map(P);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(v.x, v.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      [a, v, b].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      const deg = angleBetween(
        { x: a.x, y: a.y },
        { x: v.x, y: v.y },
        { x: b.x, y: b.y }
      );
      chip(`${deg.toFixed(1)}°`, v.x + 12, v.y - 12);
    }
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = stageSize.w, h = stageSize.h;
    if (!w || !h) return;
    c.width = w * dpr;
    c.height = h * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    shapes.forEach((s) => drawShape(ctx, s, w, h));
    if (draft) drawShape(ctx, draft, w, h);
    // pending angle points
    if (anglePts.length) {
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      anglePts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      if (anglePts.length === 2) {
        ctx.beginPath();
        ctx.moveTo(anglePts[0].x * w, anglePts[0].y * h);
        ctx.lineTo(anglePts[1].x * w, anglePts[1].y * h);
        ctx.stroke();
      }
    }
  }, [shapes, draft, anglePts, stageSize, drawShape, color]);

  /* ---------- pointer handling ---------- */

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  };

  const onPointerDown = (e) => {
    if (tool === "off") return;
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    const p = getPos(e);
    if (tool === "angle") {
      const next = [...anglePts, p];
      if (next.length === 3) {
        setShapes((s) => [...s, { type: "angle", pts: next, color }]);
        setAnglePts([]);
      } else setAnglePts(next);
      return;
    }
    setDraft({ type: tool, pts: [p, p], color });
  };

  const onPointerMove = (e) => {
    if (!draft) return;
    e.preventDefault();
    const p = getPos(e);
    setDraft((d) => ({ ...d, pts: [d.pts[0], p] }));
  };

  const onPointerUp = () => {
    if (!draft) return;
    const [a, b] = draft.pts;
    const len = Math.hypot((b.x - a.x) * stageSize.w, (b.y - a.y) * stageSize.h);
    if (len > 8) setShapes((s) => [...s, draft]);
    setDraft(null);
  };

  /* ---------- markers ---------- */

  const tapMarker = (id) => {
    if (markMode) {
      const v = videoRef.current;
      if (v && !v.paused) v.pause(); // stamp the frame you're looking at, not one later
      setMarkers((m) => ({ ...m, [id]: v?.currentTime ?? 0 }));
      setSuggested((s) => ({ ...s, [id]: false }));
    } else if (markers[id] != null) {
      seek(markers[id]);
    }
  };

  /* ---------- summary ---------- */

  const flaggedFaults = FAULTS[view].filter((f) => flags[`${view}:${f.id}`]);
  const allFlagged = [...FAULTS.dtl, ...FAULTS.fo].filter(
    (f) => flags[`dtl:${f.id}`] || flags[`fo:${f.id}`]
  );

  const copySummary = () => {
    const lines = ["SWING SESSION SUMMARY", ""];
    allFlagged.forEach((f) => {
      lines.push(`FAULT: ${f.name}`);
      f.drills.forEach((d) => lines.push(`  • ${d.name} — ${d.how}`));
      lines.push("");
    });
    if (notes.trim()) lines.push("NOTES:", notes.trim());
    navigator.clipboard?.writeText(lines.join("\n"));
  };

  /* ---------- Claude analysis ---------- */

  const captureFrame = async (t) => {
    const v = videoRef.current;
    await seekAndPaint(v, t);
    const scale = Math.min(1, 768 / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7).split(",")[1];
  };

  const captureCanvasAt = async (t, maxDim = 640) => {
    const v = videoRef.current;
    await seekAndPaint(v, t);
    const scale = Math.min(1, maxDim / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    return c;
  };

  /* ---------- auto position detection (motion energy) ---------- */

  // Seek, then wait until the *correct* frame is painted before capturing.
  // The frame callback reports the mediaTime of the frame it painted, so we
  // verify it matches the seek target — a stale frame just means we wait for
  // the next paint. Grace + backstop timers guarantee this can never hang,
  // and same-time seeks short-circuit (they fire no 'seeked' event at all).
  const seekAndPaint = (v, t) =>
    new Promise((resolve) => {
      let settled = false;
      let vfcHandle = null;
      let grace = null;
      const finish = () => {
        if (settled) return;
        settled = true;
        v.removeEventListener("seeked", onSeeked);
        if (vfcHandle != null && "cancelVideoFrameCallback" in v) v.cancelVideoFrameCallback(vfcHandle);
        clearTimeout(backstop);
        clearTimeout(grace);
        resolve();
      };
      const onFrame = (_now, meta) => {
        vfcHandle = null;
        if (settled) return;
        if (meta && Math.abs(meta.mediaTime - t) < 0.2) {
          finish(); // painted frame verified as the target
        } else if ("requestVideoFrameCallback" in v) {
          vfcHandle = v.requestVideoFrameCallback(onFrame); // stale — wait for next paint
        }
      };
      const onSeeked = () => {
        // fallback path if frame callbacks stay silent: give decode a beat
        grace = setTimeout(finish, 200);
      };
      const backstop = setTimeout(finish, 900); // absolute: never hang
      if (Math.abs((v.currentTime || 0) - t) < 0.001) {
        requestAnimationFrame(() => requestAnimationFrame(finish));
        return;
      }
      if ("requestVideoFrameCallback" in v) vfcHandle = v.requestVideoFrameCallback(onFrame);
      v.addEventListener("seeked", onSeeked);
      v.currentTime = t;
    });

  const sampleLuma = async (t, w, h, ctx) => {
    const v = videoRef.current;
    await seekAndPaint(v, t);
    ctx.drawImage(v, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
  };

  // shared pixel-diff metric — average per-pixel change (R+B channels) between
  // two same-size frame captures. Used by the keyframe-style dedup in
  // getExportFrames below.
  const diffOf = (a, b) => {
    let sum = 0;
    for (let p = 0; p < a.length; p += 4) sum += Math.abs(a[p] - b[p]) + Math.abs(a[p + 2] - b[p + 2]);
    return sum / (a.length / 4);
  };

  // Shared frame selection for the downloadable frame sheet, the chat-export
  // prompt, and the AI Coach direct-analysis path. Precise P-position labels
  // turned out not to matter for a vision-capable AI reading a swing — it
  // can tell address from impact from finish on sight. What matters is
  // marking the swing's actual start and end (tap P1 and P10 in Mark mode);
  // everything between them is filled by keyframe-style dedup — walk the
  // real pixel content and keep a frame only when it looks meaningfully
  // different from the last one kept, so fast stretches (the downswing)
  // naturally get more frames and static holds (address, the finish) get
  // collapsed to one or two, capped at maxCount.
  // No cap by default — the download/copy/share paths cost nothing extra
  // per frame, so every genuinely distinct moment is kept. runAnalysis
  // passes an explicit cap since it sends real images to the paid API,
  // where more frames means more cost and latency per analysis.
  const getExportFrames = async (v, maxCount = Infinity) => {
    // P1/P10 marked by hand are the reliable bounds; if either isn't marked,
    // fall back to the whole clip rather than guessing at where the swing is
    const start = markers.p1 ?? 0;
    const end = markers.p10 ?? duration;

    const CANDIDATES = 90;
    const candTimes = Array.from({ length: CANDIDATES }, (_, i) => start + (i / (CANDIDATES - 1)) * (end - start));
    const W = 96;
    const H = Math.max(2, Math.round((v.videoHeight / v.videoWidth) * W) || 54);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true });

    const rawData = [];
    const diffs = [0];
    let prev = null;
    for (const t of candTimes) {
      const data = await sampleLuma(t, W, H, ctx);
      rawData.push(data);
      if (prev) diffs.push(diffOf(data, prev));
      prev = data;
    }
    // threshold adapts to this clip's own noise floor rather than a fixed
    // magic number, since contrast/lighting/distance vary a lot by footage
    const sortedDiffs = [...diffs].sort((a, b) => a - b);
    const median = sortedDiffs[Math.floor(sortedDiffs.length / 2)] || 0.001;

    // greedy keep at a given threshold: compare each candidate to the last
    // KEPT frame (not just the previous candidate), so slow, steady drift
    // across many small steps still eventually triggers a keep once it
    // accumulates enough real change
    const greedyKeep = (thresh) => {
      const idx = [0];
      let lastKeptData = rawData[0];
      for (let i = 1; i < candTimes.length; i++) {
        if (diffOf(rawData[i], lastKeptData) > thresh) {
          idx.push(i);
          lastKeptData = rawData[i];
        }
      }
      if (idx[idx.length - 1] !== candTimes.length - 1) idx.push(candTimes.length - 1);
      return idx;
    };

    // if too many frames pass, raise the bar and retry rather than blindly
    // index-subsampling the result afterward — a fast stretch (impact) can
    // produce a dense run of "distinct" frames, and evenly subsampling BY
    // INDEX across an unevenly-dense list can thin out exactly that cluster
    // disproportionately. Raising the threshold instead preferentially
    // drops the least-distinct frames first, wherever they are.
    let mult = 1.5;
    let keptIdx = greedyKeep(Math.max(median * mult, 1e-6));
    let guard = 0;
    while (keptIdx.length > maxCount && guard < 20) {
      mult *= 1.25;
      keptIdx = greedyKeep(Math.max(median * mult, 1e-6));
      guard++;
    }

    // last-resort safety net if the loop above couldn't converge in time —
    // should rarely trigger
    let finalIdx = keptIdx;
    if (finalIdx.length > maxCount) {
      finalIdx = Array.from(
        { length: maxCount },
        (_, i) => keptIdx[Math.round((i * (keptIdx.length - 1)) / (maxCount - 1))]
      );
    }

    // always guarantee the single sharpest consecutive-frame transition is
    // captured explicitly. Motion blur at high club-head speed can actually
    // SUPPRESS the greedy-keep comparison right around impact — a fast,
    // blurred transition can look LESS different from a somewhat-distant
    // "last kept" reference than a slower, sharper transition elsewhere, so
    // relying purely on "distinct from last kept" can walk right past the
    // exact moment that matters most. This can push the result one frame
    // over maxCount in the rare case it wasn't already captured — worth it
    // to never silently miss impact.
    let peakDiffIdx = 1;
    for (let i = 2; i < diffs.length; i++) if (diffs[i] > diffs[peakDiffIdx]) peakDiffIdx = i;
    if (!finalIdx.includes(peakDiffIdx)) finalIdx = [...finalIdx, peakDiffIdx].sort((a, b) => a - b);

    const times = finalIdx.map((i) => candTimes[i]);
    return times.map((t, i) => ({ label: `Frame ${i + 1} of ${times.length} — ${fmt(t)}`, t }));
  };

  // Composite the exported frames into one labeled JPEG sheet. Shared by the
  // download button and the one-tap share action below.
  const buildFrameSheetCanvas = async (frames) => {
    const cells = [];
    for (const fr of frames) cells.push({ ...fr, canvas: await captureCanvasAt(fr.t, 640) });

    const cols = cells.length <= 4 ? 2 : 3;
    const rows = Math.ceil(cells.length / cols);
    const cw = cells[0].canvas.width;
    const ch = cells[0].canvas.height;
    const labelH = 34;
    const pad = 6;
    const sheet = document.createElement("canvas");
    sheet.width = cols * cw + (cols + 1) * pad;
    sheet.height = rows * (ch + labelH + pad) + pad;
    const ctx = sheet.getContext("2d");
    ctx.fillStyle = "#0C120E";
    ctx.fillRect(0, 0, sheet.width, sheet.height);
    cells.forEach((cell, i) => {
      const cx = pad + (i % cols) * (cw + pad);
      const cy = pad + Math.floor(i / cols) * (ch + labelH + pad);
      ctx.drawImage(cell.canvas, cx, cy);
      ctx.fillStyle = "#EDF2EA";
      ctx.font = "600 18px ui-monospace, Menlo, monospace";
      ctx.fillText(cell.label, cx + 6, cy + ch + 24);
    });
    return sheet;
  };

  // Build the chat-analysis prompt text. Shared by the copy button and the
  // one-tap share action below.
  const buildChatPromptText = (frames) => {
    const lines = [
      `I'm attaching a frame sheet from one of my golf swings, filmed ${
        view === "dtl" ? "down the line (camera behind the hands, looking at the target)" : "face on (camera facing my chest)"
      }. Frames read left to right, top to bottom, in swing order.`,
      `Each frame is labeled: ${frames.map((f) => f.label).join(", ")}. Labels are approximate — go by what's actually visible in each frame, not the label.`,
      `The clip is ${fps}fps, ${fmt(duration)} long.`,
      "",
      "Act as a golf instructor. For each labeled frame, give one specific observation (shaft direction, spine angle, hip depth, head position, weight, arm structure).",
      "Then identify the 1-2 highest-priority faults clearly visible — e.g. over the top, early extension, across the line at the top, sway, casting, chicken wing — citing which frame shows the evidence.",
      "Finish with 2-3 specific drills for the top-priority fault, and tell me exactly what to look for in my next video to confirm progress.",
    ];
    const flaggedNames = allFlagged.map((f) => f.name);
    if (flaggedNames.length)
      lines.push("", `Context: I've already flagged these as suspected issues: ${flaggedNames.join(", ")}.`);
    if (notes.trim()) lines.push("", `My session notes: ${notes.trim()}`);
    return lines.join("\n");
  };

  const exportFrameSheet = async () => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.pause();
    const resumeT = v.currentTime;
    setExportState({ action: "sheet", status: "working" });
    try {
      const frames = await getExportFrames(v);
      const sheet = await buildFrameSheetCanvas(frames);
      v.currentTime = resumeT;

      const a = document.createElement("a");
      a.href = sheet.toDataURL("image/jpeg", 0.85);
      a.download = `swing-${view}-frames.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExportState({ action: "sheet", status: "done" });
    } catch (err) {
      setExportState({ action: null, status: "idle" });
      setAiState("error");
      setAiError("Frame export failed: " + String(err?.message || err));
    }
  };

  const copyChatPrompt = async () => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.pause();
    const resumeT = v.currentTime;
    setExportState({ action: "prompt", status: "working" });
    try {
      const frames = await getExportFrames(v);
      v.currentTime = resumeT;
      navigator.clipboard?.writeText(buildChatPromptText(frames));
      setExportState({ action: "prompt", status: "copied" });
      setTimeout(() => setExportState({ action: null, status: "idle" }), 2500);
    } catch (err) {
      setExportState({ action: null, status: "idle" });
      setAiState("error");
      setAiError("Building the chat prompt failed: " + String(err?.message || err));
      if (videoRef.current) videoRef.current.currentTime = resumeT;
    }
  };

  // One-tap path: build the same frame sheet + prompt, then hand them to the
  // OS share sheet (navigator.share) so the user can pick "Claude" directly
  // if it's installed and registered as a share target — no known way to
  // deep-link/pre-fill claude.ai itself, so this is the closest "one click
  // into Claude" that's actually achievable with standard web APIs. Falls
  // back to the existing download+copy flow where file sharing isn't
  // supported (e.g. most desktop browsers).
  const shareSwing = async () => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.pause();
    const resumeT = v.currentTime;
    setExportState({ action: "share", status: "working" });
    try {
      const frames = await getExportFrames(v);
      const sheet = await buildFrameSheetCanvas(frames);
      const text = buildChatPromptText(frames);
      v.currentTime = resumeT;

      const blob = await new Promise((resolve) => sheet.toBlob(resolve, "image/jpeg", 0.85));
      const file = new File([blob], `swing-${view}-frames.jpg`, { type: "image/jpeg" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: "Swing analysis" });
        setExportState({ action: "share", status: "done" });
      } else {
        // no native file sharing here — fall back to the two-step flow, but
        // still do it in one tap: download the image, copy the prompt
        const a = document.createElement("a");
        a.href = sheet.toDataURL("image/jpeg", 0.85);
        a.download = `swing-${view}-frames.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        navigator.clipboard?.writeText(text);
        setAiError("This browser can't share files directly — downloaded the frame sheet and copied the prompt instead. Open Claude and attach + paste manually.");
        setExportState({ action: "share", status: "copied" });
        setTimeout(() => setExportState({ action: null, status: "idle" }), 4000);
      }
    } catch (err) {
      setExportState({ action: null, status: "idle" });
      if (String(err?.name) !== "AbortError") {
        // AbortError = user just closed the share sheet, not a real failure
        setAiState("error");
        setAiError("Share failed: " + String(err?.message || err));
      }
      if (videoRef.current) videoRef.current.currentTime = resumeT;
    }
  };

  const runAnalysis = async () => {
    const v = videoRef.current;
    if (!v || !duration) return;
    if (!apiKey) {
      setAiState("error");
      setAiError("Add your Anthropic API key above first (stored only in this browser).");
      return;
    }
    v.pause();
    const resumeT = v.currentTime;
    setAiState("capturing");
    setAiError("");
    setAiResult(null);
    try {
      const frames = await getExportFrames(v, 18); // cap here only — real cost/latency per image on the paid API path

      const shots = [];
      for (const fr of frames) {
        shots.push({ label: fr.label, b64: await captureFrame(fr.t) });
      }
      v.currentTime = resumeT;

      setAiState("analyzing");
      const viewName = view === "dtl" ? "down the line (camera behind hands, looking at target)" : "face on (camera facing the golfer's chest)";
      const faultCatalog = FAULTS[view].map((f) => `"${f.id}" = ${f.name}`).join("; ");

      const content = [];
      shots.forEach((s) => {
        content.push({ type: "text", text: s.label });
        content.push({
          type: "image",
          source: { type: "base64", media_type: "image/jpeg", data: s.b64 },
        });
      });
      content.push({
        type: "text",
        text:
          `You are an expert golf instructor. These frames are from one swing filmed ${viewName}, in chronological order with approximate labels — go by what's actually visible in each frame rather than trusting the label precisely. ` +
          `Analyze the swing. Be specific and reference what is visible (shaft direction, spine angle, hip depth, head position, weight, arm structure). ` +
          `Fault catalog for this camera angle: ${faultCatalog}. ` +
          `Respond with ONLY valid JSON, no markdown, no preamble, exactly this shape: ` +
          `{"summary":"2-3 sentence overall read","positives":["short strength","short strength"],` +
          `"observations":[{"frame":"frame label","note":"one concise observation"}],` +
          `"fault_ids":["ids from the catalog that are clearly visible, empty array if none"],` +
          `"fault_evidence":[{"id":"fault id","evidence":"what in which frame shows it"}]}. ` +
          `Only include a fault_id if the frames genuinely show it. Keep every string under 30 words.`,
      });

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content }],
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const text = (data.content || [])
        .filter((i) => i.type === "text")
        .map((i) => i.text)
        .join("\n");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setAiResult(parsed);
      if (Array.isArray(parsed.fault_ids)) {
        setFlags((fl) => {
          const next = { ...fl };
          parsed.fault_ids.forEach((id) => {
            if (FAULTS[view].some((f) => f.id === id)) next[`${view}:${id}`] = true;
          });
          return next;
        });
      }
      setAiState("done");
    } catch (err) {
      setAiState("error");
      setAiError(String(err?.message || err));
      if (videoRef.current) videoRef.current.currentTime = resumeT;
    }
  };

  /* ---------------------------------------------------------------- */

  return (
    <div className="st-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        .st-root {
          --bg:#0C120E; --panel:#141C16; --panel2:#1B241D; --edge:#26332A;
          --chalk:#EDF2EA; --muted:#8FA096; --tracer:#FF5A36; --green:#55C97B; --amber:#FFB020;
          background:var(--bg); color:var(--chalk); min-height:100vh;
          font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          -webkit-tap-highlight-color:transparent;
        }
        .st-wrap { max-width:760px; margin:0 auto; padding:14px 14px 60px; }
        .st-eyebrow { font-family:'JetBrains Mono',ui-monospace,monospace; font-size:11px; letter-spacing:.18em; color:var(--tracer); text-transform:uppercase; }
        .st-title { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:34px; letter-spacing:.02em; line-height:1; margin:2px 0 0; text-transform:uppercase; }
        .st-sub { color:var(--muted); font-size:13px; margin-top:4px; }
        .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .btn { background:var(--panel2); border:1px solid var(--edge); color:var(--chalk); border-radius:8px; padding:8px 12px; font-size:13px; font-weight:600; cursor:pointer; }
        .btn:active { transform:translateY(1px); }
        .btn.primary { background:var(--tracer); border-color:var(--tracer); color:#12100F; }
        .btn.on { border-color:var(--tracer); color:var(--tracer); }
        .btn.small { padding:6px 9px; font-size:12px; }
        .seg { display:flex; background:var(--panel); border:1px solid var(--edge); border-radius:9px; overflow:hidden; }
        .seg button { background:transparent; border:none; color:var(--muted); padding:8px 14px; font-size:13px; font-weight:600; cursor:pointer; }
        .seg button.on { background:var(--panel2); color:var(--chalk); box-shadow:inset 0 -2px 0 var(--tracer); }
        .stage { position:relative; margin-top:12px; border-radius:12px; overflow:hidden; border:1px solid var(--edge); background:#000; }
        .stage video { display:block; width:100%; height:auto; }
        .stage canvas { position:absolute; inset:0; width:100%; height:100%; }
        .mono { font-family:'JetBrains Mono',ui-monospace,monospace; }
        .transport { margin-top:10px; display:flex; flex-direction:column; gap:8px; }
        input[type=range].scrub { width:100%; accent-color:var(--tracer); }
        select { background:var(--panel2); color:var(--chalk); border:1px solid var(--edge); border-radius:8px; padding:7px 8px; font-size:13px; }
        .chips { display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
        .chip { border:1px solid var(--edge); background:var(--panel); color:var(--muted); border-radius:999px; padding:6px 11px; font-size:12px; font-weight:600; cursor:pointer; }
        .chip.set { color:var(--chalk); border-color:var(--green); }
        .chip.set .t { color:var(--green); }
        .dot { width:22px; height:22px; border-radius:50%; border:2px solid transparent; cursor:pointer; }
        .dot.on { border-color:var(--chalk); }
        .tabs { display:flex; gap:2px; margin-top:18px; border-bottom:1px solid var(--edge); }
        .tabs button { background:transparent; border:none; color:var(--muted); font-family:'Barlow Condensed',sans-serif; font-size:17px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; padding:8px 12px; cursor:pointer; }
        .tabs button.on { color:var(--chalk); box-shadow:inset 0 -2px 0 var(--tracer); }
        .card { background:var(--panel); border:1px solid var(--edge); border-radius:10px; padding:12px 14px; margin-top:10px; }
        .card h4 { margin:0; font-family:'Barlow Condensed',sans-serif; font-size:18px; letter-spacing:.03em; text-transform:uppercase; }
        .card p { margin:6px 0 0; font-size:13.5px; line-height:1.5; color:var(--muted); }
        .fault-head { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .flagbox { width:20px; height:20px; border-radius:5px; border:1.5px solid var(--edge); flex:none; display:flex; align-items:center; justify-content:center; font-size:13px; cursor:pointer; background:var(--panel2); }
        .flagbox.on { background:var(--tracer); border-color:var(--tracer); color:#12100F; font-weight:700; }
        .drill { border-top:1px dashed var(--edge); padding-top:8px; margin-top:8px; }
        .drill b { color:var(--green); font-size:13px; }
        textarea { width:100%; min-height:110px; background:var(--panel2); border:1px solid var(--edge); border-radius:10px; color:var(--chalk); padding:10px; font-size:14px; font-family:inherit; box-sizing:border-box; }
        .empty { border:1.5px dashed var(--edge); border-radius:14px; padding:44px 20px; text-align:center; margin-top:14px; }
        .hint { font-size:12px; color:var(--muted); }
        @media (prefers-reduced-motion: reduce) { * { transition:none !important; } }
      `}</style>

      <div className="st-wrap">
        <div className="st-eyebrow">DTL + Face-On Telestrator</div>
        <h1 className="st-title">Swing Tracer</h1>
        <div className="st-sub">
          Load a swing, scrub it frame by frame, draw plane lines and angles, then flag faults to build a drill plan.
        </div>

        {showIntro && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <h4 style={{ margin: 0 }}>How to use Swing Tracer</h4>
              <button className="btn small" onClick={() => setShowIntro(false)}>✕</button>
            </div>
            <ol style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              <li>Load your swing video (down the line or face on).</li>
              <li>In <b>✎ Mark start/end</b>, tap the swing-start and swing-end pills at the right frames.</li>
              <li>Optional: draw plane lines, angles, or circles to check yourself against the checkpoints below.</li>
              <li>Head to <b>AI coach</b> to get Claude's read, or download a frame sheet to analyze in a chat.</li>
            </ol>
          </div>
        )}

        {/* view + upload */}
        <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
          <div className="seg">
            <button className={view === "dtl" ? "on" : ""} onClick={() => setView("dtl")}>Down the line</button>
            <button className={view === "fo" ? "on" : ""} onClick={() => setView("fo")}>Face on</button>
          </div>
          <label className="btn primary" style={{ display: "inline-block" }}>
            {src ? "Load new video" : "Load video"}
            <input type="file" accept="video/*" onChange={onFile} style={{ display: "none" }} />
          </label>
        </div>

        {!src && (
          <div className="empty">
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, textTransform: "uppercase", letterSpacing: ".04em" }}>
              No swing loaded
            </div>
            <p className="hint" style={{ maxWidth: 420, margin: "8px auto 0" }}>
              Film from down the line (camera at hand height, on the target line) or face on (camera at chest height, square to you).
              Slow-mo clips from your phone work great — the frame stepper assumes the FPS you pick below.
            </p>
            <p className="hint mono" style={{ marginTop: 10, color: hevcOk ? "var(--green)" : "var(--amber)" }}>
              {hevcOk
                ? "✓ This browser decodes iPhone HEVC clips — load them directly."
                : "△ This browser can't decode iPhone HEVC clips. Open this on your iPhone (Safari plays them natively), or film with Settings → Camera → Formats → Most Compatible."}
            </p>
          </div>
        )}

        {src && (
          <>
            {/* stage */}
            <div className="stage" ref={stageRef}>
              <video
                ref={videoRef}
                src={src}
                playsInline
                muted
                preload="auto"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                onLoadedData={() => { setLoadState("ready"); setLoadMsg(""); primeFirstFrame(); }}
                onCanPlay={() => { setLoadState("ready"); setLoadMsg(""); primeFirstFrame(); }}
                onError={onVideoError}
              />
              <canvas
                ref={canvasRef}
                style={{ touchAction: tool === "off" ? "auto" : "none", pointerEvents: tool === "off" ? "none" : "auto" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
            </div>

            {loadState === "loading" && (
              <div className="card" style={{ borderColor: "var(--amber)" }}>
                <p style={{ color: "var(--amber)", margin: 0 }}>{loadMsg}</p>
              </div>
            )}
            {loadState === "error" && (
              <div className="card" style={{ borderColor: "var(--tracer)" }}>
                <h4 style={{ color: "var(--tracer)" }}>Video couldn't load</h4>
                <p>{loadMsg}</p>
              </div>
            )}

            {/* draw tools */}
            <div className="row" style={{ marginTop: 10 }}>
              <button className={`btn small ${tool === "off" ? "on" : ""}`} onClick={() => { setTool("off"); setAnglePts([]); }}>✋ View</button>
              <button className={`btn small ${tool === "line" ? "on" : ""}`} onClick={() => setTool("line")}>／ Plane line</button>
              <button className={`btn small ${tool === "angle" ? "on" : ""}`} onClick={() => { setTool("angle"); setAnglePts([]); }}>∠ Angle</button>
              <button className={`btn small ${tool === "circle" ? "on" : ""}`} onClick={() => setTool("circle")}>◯ Circle</button>
              <span style={{ flex: 1 }} />
              {DRAW_COLORS.map((c) => (
                <span key={c} className={`dot ${c === color ? "on" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
              <button className="btn small" onClick={() => setShapes((s) => s.slice(0, -1))}>Undo</button>
              <button className="btn small" onClick={() => { setShapes([]); setAnglePts([]); }}>Clear</button>
            </div>
            {tool === "angle" && (
              <div className="hint" style={{ marginTop: 6 }}>
                Angle tool: tap three points — end, vertex, end ({anglePts.length}/3). E.g. shoulder → hip → knee for spine angle, or hands → clubhead vs lead arm for lag.
              </div>
            )}
            {tool === "line" && (
              <div className="hint" style={{ marginTop: 6 }}>
                Drag along the shaft at setup to set your plane line — the chip shows its angle from horizontal.
              </div>
            )}

            {/* transport */}
            <div className="transport">
              <input
                className="scrub"
                type="range"
                min={0}
                max={duration || 0}
                step={0.001}
                value={scrubT ?? time}
                disabled={busy}
                onPointerDown={() => {
                  const v = videoRef.current;
                  wasPlayingRef.current = !!(v && !v.paused);
                  if (v) v.pause();
                  setScrubT(videoRef.current?.currentTime ?? time);
                }}
                onChange={(e) => {
                  const t = parseFloat(e.target.value);
                  setScrubT(t);
                  seek(t);
                }}
                onPointerUp={() => {
                  setScrubT(null);
                  const v = videoRef.current;
                  if (wasPlayingRef.current && v && !busy) {
                    v.playbackRate = speed;
                    v.play();
                  }
                  wasPlayingRef.current = false;
                }}
                onPointerCancel={() => { setScrubT(null); wasPlayingRef.current = false; }}
              />
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row">
                  <button className="btn" onClick={() => step(-1)} disabled={busy}>⏮ Frame</button>
                  <button className="btn primary" onClick={togglePlay} disabled={busy}>
                    {playing ? "Pause" : "Play"}
                  </button>
                  <button className="btn" onClick={() => step(1)} disabled={busy}>Frame ⏭</button>
                </div>
                <span className="mono" style={{ fontSize: 13, color: "var(--amber)" }}>
                  {fmt(time)} / {fmt(duration)}
                </span>
              </div>
              <div className="row">
                <label className="hint">Speed</label>
                <select value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}>
                  {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
                </select>
                <label className="hint">Clip FPS</label>
                <select value={fps} onChange={(e) => setFps(parseInt(e.target.value))}>
                  {FPS_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <span style={{ flex: 1 }} />
                <button
                  className={`btn small ${loop ? "on" : ""}`}
                  onClick={() => setLoop(!loop)}
                  disabled={markers.p1 == null || markers.p10 == null}
                  title="Mark swing start and end to loop the swing"
                >
                  ↻ Loop swing
                </button>
              </div>
            </div>

            {/* swing bounds */}
            <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
              <span className="st-eyebrow" style={{ color: "var(--green)" }}>Swing bounds</span>
              <div className="row">
                <button className={`btn small ${markMode ? "on" : ""}`} onClick={() => setMarkMode(!markMode)}>
                  {markMode ? "Marking: tap a pill to stamp this frame" : "✎ Mark start/end"}
                </button>
              </div>
            </div>
            <p className="hint" style={{ marginTop: 4 }}>
              Mark where your swing starts and ends — everything exported in between is sampled automatically.
            </p>
            <div className="chips">
              {POSITIONS.map((p) => (
                <button
                  key={p.id}
                  className={`chip ${markers[p.id] != null ? "set" : ""}`}
                  onClick={() => tapMarker(p.id)}
                >
                  {p.label}{markers[p.id] != null && <span className="t mono"> {fmt(markers[p.id])}</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {/* tabs */}
        <div className="tabs">
          <button className={tab === "ai" ? "on" : ""} onClick={() => setTab("ai")}>AI coach</button>
          <button className={tab === "mechanics" ? "on" : ""} onClick={() => setTab("mechanics")}>Golf Swing Mechanics</button>
          <button className={tab === "plan" ? "on" : ""} onClick={() => setTab("plan")}>
            Session plan{allFlagged.length ? ` (${allFlagged.length})` : ""}
          </button>
          <button className={tab === "settings" ? "on" : ""} onClick={() => setTab("settings")}>Settings</button>
        </div>

        {tab === "mechanics" && (
          <>
            <h4 style={{ marginTop: 10 }}>Checkpoints</h4>
            {CHECKPOINTS[view].map((c) => (
              <div className="card" key={c.pos}>
                <h4>{c.pos}</h4>
                <p>{c.what}</p>
              </div>
            ))}

            <h4 style={{ marginTop: 16 }}>Faults & drills</h4>
            <p className="hint" style={{ marginTop: 6 }}>
              Showing {view === "dtl" ? "down-the-line" : "face-on"} faults. Tap a card to see what to look for; tap the box to flag it for your session plan.
            </p>
            {FAULTS[view].map((f) => {
              const key = `${view}:${f.id}`;
              const open = openFault === key;
              return (
                <div className="card" key={key}>
                  <div className="fault-head" onClick={() => setOpenFault(open ? null : key)}>
                    <span
                      className={`flagbox ${flags[key] ? "on" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setFlags((fl) => ({ ...fl, [key]: !fl[key] })); }}
                    >
                      {flags[key] ? "✓" : ""}
                    </span>
                    <h4 style={{ flex: 1 }}>{f.name}</h4>
                    <span className="hint">{open ? "▾" : "▸"}</span>
                  </div>
                  {open && (
                    <>
                      <p><b style={{ color: "var(--amber)" }}>What to look for: </b>{f.look}</p>
                      {f.drills.map((d) => (
                        <div className="drill" key={d.name}>
                          <b>{d.name}</b>
                          <p style={{ margin: "3px 0 0" }}>{d.how}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}

        {tab === "ai" && (
          <>
            <div className="card">
              <h4>Claude swing analysis</h4>
              <p>
                Captures key frames from your clip and sends them to Claude for a coaching read.
                Mark your swing start and end first for the best sampling — Claude then sees frames
                spanning the actual swing instead of guesses across the whole clip. Detected faults
                are auto-flagged into your session plan with their drills.
              </p>
              {!apiKey && (
                <p className="hint" style={{ marginTop: 6, color: "var(--amber)" }}>
                  No API key set — add one in the{" "}
                  <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => setTab("settings")}>
                    Settings
                  </span>{" "}
                  tab first.
                </p>
              )}
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  className="btn primary"
                  onClick={runAnalysis}
                  disabled={!src || !duration || !apiKey || aiState === "capturing" || aiState === "analyzing"}
                >
                  {aiState === "capturing"
                    ? "Capturing frames…"
                    : aiState === "analyzing"
                    ? "Claude is analyzing…"
                    : "Analyze this swing"}
                </button>
                <span className="hint">
                  {markers.p1 != null && markers.p10 != null
                    ? "Using your marked swing start/end"
                    : "Swing start/end not marked — will sample across the whole clip"}
                </span>
              </div>
            </div>

            <div className="card">
              <h4>No API key? Analyze in a chat</h4>
              <p>
                Download a frame sheet spanning your swing, then in a Claude chat: attach the image
                and paste the copied prompt. Same analysis, no key needed — the prompt includes
                your camera angle, flagged faults, and notes.
              </p>
              {typeof navigator !== "undefined" && navigator.share && (
                <>
                  <div className="row" style={{ marginTop: 10 }}>
                    <button
                      className="btn primary"
                      onClick={shareSwing}
                      disabled={!src || !duration || exportBusy}
                    >
                      {exportState.action === "share" && exportBusy ? "Preparing…" : "📤 Share to Claude"}
                    </button>
                  </div>
                  <p className="hint" style={{ marginTop: 6 }}>
                    Opens your device's share sheet with the frame sheet + prompt — pick Claude if it's installed.
                  </p>
                  <p className="hint" style={{ marginTop: 10 }}>Or do it manually:</p>
                </>
              )}
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  className="btn"
                  onClick={exportFrameSheet}
                  disabled={!src || !duration || exportBusy}
                >
                  {exportState.action === "sheet" && exportBusy ? "Building sheet…" : "1 · Download frame sheet"}
                </button>
                <button className="btn" onClick={copyChatPrompt} disabled={!duration || exportBusy}>
                  {exportState.action === "prompt" && exportBusy
                    ? "Building prompt…"
                    : exportState.action === "prompt" && exportState.status === "copied"
                    ? "Copied ✓"
                    : "2 · Copy chat prompt"}
                </button>
              </div>
            </div>

            {aiState === "error" && (
              <div className="card" style={{ borderColor: "var(--tracer)" }}>
                <h4 style={{ color: "var(--tracer)" }}>Analysis failed</h4>
                <p>{aiError} — if this mentions parsing, just run it again; if it mentions the network, wait a moment and retry.</p>
              </div>
            )}

            {aiResult && aiState === "done" && (
              <>
                <div className="card">
                  <h4 style={{ color: "var(--green)" }}>Overall read</h4>
                  <p style={{ color: "var(--chalk)" }}>{aiResult.summary}</p>
                  {Array.isArray(aiResult.positives) && aiResult.positives.length > 0 && (
                    <p>
                      <b style={{ color: "var(--green)" }}>Working well: </b>
                      {aiResult.positives.join(" · ")}
                    </p>
                  )}
                </div>
                {Array.isArray(aiResult.observations) &&
                  aiResult.observations.map((o, i) => (
                    <div className="card" key={i}>
                      <h4>{o.frame}</h4>
                      <p>{o.note}</p>
                    </div>
                  ))}
                {Array.isArray(aiResult.fault_evidence) && aiResult.fault_evidence.length > 0 && (
                  <div className="card" style={{ borderColor: "var(--amber)" }}>
                    <h4 style={{ color: "var(--amber)" }}>Faults spotted (flagged to your plan)</h4>
                    {aiResult.fault_evidence.map((fe, i) => {
                      const f = FAULTS[view].find((x) => x.id === fe.id);
                      return (
                        <div className="drill" key={i}>
                          <b style={{ color: "var(--tracer)" }}>{f ? f.name : fe.id}</b>
                          <p style={{ margin: "3px 0 0" }}>{fe.evidence}</p>
                        </div>
                      );
                    })}
                    <p className="hint" style={{ marginTop: 8 }}>
                      Drills for these are compiled in the Session plan tab. Static frames can't measure
                      tempo or exact path — treat this as a second set of eyes, and verify with the drawing tools.
                    </p>
                  </div>
                )}
                {Array.isArray(aiResult.fault_ids) && aiResult.fault_ids.length === 0 && (
                  <div className="card" style={{ borderColor: "var(--green)" }}>
                    <p style={{ color: "var(--green)", margin: 0 }}>
                      No clear faults visible in these frames. Nice swing — check the other camera angle too.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === "plan" && (
          <>
            {allFlagged.length === 0 && (
              <div className="card"><p>No faults flagged yet. Work through the Faults & drills tab while you scrub the video, and flag anything you spot — the drills collect here.</p></div>
            )}
            {allFlagged.map((f) => (
              <div className="card" key={f.id}>
                <h4 style={{ color: "var(--tracer)" }}>{f.name}</h4>
                {f.drills.map((d) => (
                  <div className="drill" key={d.name}>
                    <b>{d.name}</b>
                    <p style={{ margin: "3px 0 0" }}>{d.how}</p>
                  </div>
                ))}
              </div>
            ))}
            <div className="card">
              <h4>Session notes</h4>
              <textarea
                placeholder="Ball flight, feels, launch monitor numbers, what to check next session…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="row" style={{ marginTop: 8, justifyContent: "flex-end" }}>
                <button className="btn" onClick={copySummary}>Copy plan to clipboard</button>
              </div>
              <p className="hint" style={{ marginTop: 6 }}>
                Notes live in this session only — copy the plan out before you close the tab.
              </p>
            </div>
          </>
        )}

        {tab === "settings" && (
          <div className="card" style={{ marginTop: 10 }}>
            <h4>Anthropic API key</h4>
            <p>
              Only needed for the direct "Analyze this swing" button on the AI coach tab — the
              chat-export path (download frame sheet + copy prompt) works without one.
            </p>
            <div className="row" style={{ marginTop: 10 }}>
              <input
                type="password"
                placeholder="Anthropic API key (sk-ant-…)"
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                style={{
                  flex: 1, minWidth: 200, background: "var(--panel2)", color: "var(--chalk)",
                  border: "1px solid var(--edge)", borderRadius: 8, padding: "8px 10px", fontSize: 13,
                }}
              />
            </div>
            <p className="hint" style={{ marginTop: 6 }}>
              Stored only in this browser's local storage. Get a key at console.anthropic.com — each analysis costs a few cents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
