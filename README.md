# Notely

> Every meeting, distilled in seconds.

AI-powered meeting and lecture note-taker. Record or upload audio → Notely transcribes it with Groq Whisper, then uses Llama 3.3 70B to extract a summary, action items, decisions, and open questions — all stored locally in your browser.

**Live demo:** [notely.vercel.app](https://notely.vercel.app)  
**Repo:** [github.com/Vishalvivek2007/Recap](https://github.com/Vishalvivek2007/Recap)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind v4 + shadcn/ui |
| 3D visuals | React Three Fiber + drei + postprocessing (custom GLSL shader orb) |
| Animation | Framer Motion + Lenis smooth scroll |
| Transcription | Groq Whisper large-v3 |
| Summarization | Groq Llama 3.3 70B |
| Storage | Dexie.js (IndexedDB — no backend, no server, no privacy risk) |
| Deployment | Vercel |

---

## How It Works

1. **Record** — tap the orb to start. The 3D shader orb reacts to your voice amplitude in real time via Web Audio API. Or upload an existing audio file (mp3, wav, webm, m4a, flac, ogg — up to 25 MB).

2. **Process** — audio is sent to `/api/transcribe` (Groq Whisper large-v3) which returns a `verbose_json` transcript with word and segment timestamps. The transcript is then passed to `/api/summarize` (Groq Llama 3.3 70B) which produces structured JSON validated against a Zod schema.

3. **Review** — the result page shows a TL;DR card, tabbed views for Overview (key points by topic), Transcript (with timecodes), Action Items, and Decisions. Copy all as markdown or export a `.md` file.

4. **Library** — every meeting is stored client-side in IndexedDB. Browse, search, and delete from the Library page.

---

## Key Technical Decisions

**No backend / no database** — everything lives in IndexedDB on the user's device. The only server code is the two API routes that proxy to Groq (to keep the API key off the client). This means no auth, no data leakage, no infra cost.

**Groq over OpenAI** — Whisper on Groq is dramatically faster than OpenAI's Whisper endpoint (often 10–30x real-time speed), which means a 10-minute recording transcribes in ~10 seconds. Llama 3.3 70B produces sharp, structured summaries at very low cost.

**Custom 3D shader orb** — the signature visual element is a WebGL icosahedron with a custom GLSL fragment shader that blends three brand colors (purple #7c5cff, pink #ff6b9d, amber #ffb547) via simplex noise. It reads audio amplitude in real time via `AnalyserNode`. GPU-tier fallback to a CSS gradient orb on low-end devices.

**EffectComposer transparency fix** — `@react-three/postprocessing`'s EffectComposer uses MSAA render targets by default, which don't support alpha channels — causing a visible rectangle around the orb. Fixed by setting `multisampling={0}` and `frameBufferType={THREE.HalfFloatType}`.

**React strict-mode safe pipeline** — the processing page uses `useRef(false)` to guard against React's strict-mode double-invocation of effects, preventing duplicate API calls in development.

---

## What's Cut (Future Work)

- **WaveSurfer playback** — the transcript includes word-level timestamps from Whisper; infrastructure is in place for highlighted word-sync audio playback, but the player UI wasn't built in time.
- **Streaming summary** — the summarize route currently waits for the full Llama response. Streaming via SSE would make the processing screen feel faster.
- **Speaker diarization** — Whisper doesn't identify speakers; integrating a diarization step would significantly improve multi-person meeting notes.
- **/settings page** — planned for model selection, summary depth, and language preference.
- **PWA / offline mode** — the app already works offline for the library (IndexedDB), but recording + processing requires network access to Groq.
- **Sharing** — generating a shareable link for a meeting note (would require a lightweight backend or Vercel KV).

---

## Running Locally

```bash
git clone https://github.com/Vishalvivek2007/Recap.git
cd Recap
npm install
```

Create `.env.local`:
```
GROQ_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Limits

- Max audio file: **25 MB** (Groq Whisper API limit) — roughly 50 minutes at 64 kbps
- Max recording duration: 1 hour
- Vercel Hobby plan has a 4.5 MB request body limit; recordings longer than ~8 min need Pro plan or use the file upload path with pre-compressed audio

---

## AI Logs

See [`ai-logs/`](./ai-logs/) for session logs of the AI-assisted development process, including decision rationale and what was considered and rejected.
