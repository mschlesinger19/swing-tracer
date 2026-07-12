# Swing Tracer

Telestrator-style golf swing video analyzer. Load a swing clip (DTL or face-on), scrub frame-by-frame, draw plane lines and measure angles, mark P-positions, flag faults, and get an AI coaching read from Claude that compiles drills into a session plan.

Runs entirely client-side — videos never leave the device. The only network call is the optional AI analysis (frames go to the Anthropic API with your key).

## Run locally

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages — no installs needed

GitHub Actions builds the app on GitHub's servers, so you never need Node, npm, or an editor on your machine.

1. On github.com: New repository → name it `swing-tracer` → Public → Create (don't add a README). The name must match the `base` in `vite.config.js` — change both if you pick a different name.
2. Unzip this project on your computer.
3. On the new repo's page, click the "uploading an existing file" link. Drag in **everything inside** the `swing-tracer-app` folder (not the folder itself): `src`, `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `README.md`. Commit.
4. Hidden folders often don't survive drag-and-drop, so add the workflow by hand: **Add file → Create new file**, name it exactly `.github/workflows/deploy.yml` (typing the slashes creates the folders), and paste in the contents of that file from this zip. Commit.
5. Repo **Settings → Pages** → under "Build and deployment", set Source to **GitHub Actions**.
6. Go to the **Actions** tab — a run should already be going (or hit "Run workflow"). Green check = live at `https://<your-username>.github.io/swing-tracer/`.
7. Open that URL on your phone and Add to Home Screen.

Every future change works the same way: edit a file on github.com (or upload a replacement), commit, and Actions redeploys automatically in about a minute.

### Alternative: run locally

If you ever want a local dev loop: `npm install && npm run dev` (needs Node), or open the repo in GitHub Codespaces — VS Code in your browser on GitHub's machines, nothing installed locally.

## AI Coach setup

Paste an Anthropic API key (console.anthropic.com) into the field on the AI Coach tab. It's stored in the browser's localStorage only — never committed, never sent anywhere except api.anthropic.com. The call uses the `anthropic-dangerous-direct-browser-access` header, which is the supported pattern for personal, single-user browser apps. If you ever share this app with others, move the API call behind a proxy (a Supabase Edge Function works well) so your key isn't in their browsers.

## Why not run this as a Claude artifact?

The artifact preview sandbox blocks local media sources by URL safety policy (`MEDIA_ELEMENT_ERROR: Media load rejected by URL safety check`), so `<video>` can't play user-selected files there. Standalone, browsers handle this normally — including iPhone HEVC (.mov) clips, which iOS Safari decodes natively.

## Filming notes

- iPhone slow-mo (240fps) is ideal; set the Clip FPS control to match for accurate frame stepping.
- DTL: camera at hand height on the target line. Face-on: chest height, square to the golfer.
- Trim clips to ~3 seconds around the swing before loading — faster everywhere.

## Roadmap ideas

- Pose estimation (MediaPipe) to auto-measure spine angle, pelvis translation (early extension), and lag — feed numbers + frames to Claude for a measured read instead of a visual one.
- Side-by-side compare (this swing vs. a reference swing).
- Supabase persistence for session plans + swing history, matching the gym-log pattern.
