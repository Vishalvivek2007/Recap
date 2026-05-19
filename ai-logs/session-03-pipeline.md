# Session 03 — AI Pipeline, Pages, Bug Fixes

**Date:** 2026-05-19  
**Model:** Claude Sonnet 4.6  
**Scope:** Bug fixes + STEP 13 (Groq AI pipeline) + processing/result/library pages

## Decisions Made

### Bug Fix 1: ScrambleText bfcache
- **Root cause:** `pageshow` handler called `setHasRun(false)` and relied on React's effect cascade to re-trigger `scramble()`. In bfcache restore, React may not process this chain synchronously.
- **Fix:** Call `scramble()` directly from the `pageshow` handler, no state cascade needed.

### Bug Fix 2: AudioOrb transparent background
- **Root cause:** `EffectComposer` from `@react-three/postprocessing` uses MSAA render targets internally. MSAA render targets (`WebGLMultisampleRenderTarget`) do not support alpha channels, causing an opaque rectangle to be composited over the transparent WebGL canvas.
- **Fix:** Set `multisampling={0}` (disable MSAA) and `frameBufferType={THREE.HalfFloatType}` (half-float FBOs preserve alpha) on EffectComposer.

### Groq Transcription (`/api/transcribe`)
- Used `groq-sdk` with `toFile()` to wrap the `File` from FormData into an `Uploadable`
- `response_format: "verbose_json"` + `timestamp_granularities: ["word", "segment"]` gives word-level timestamps for future wavesurfer sync
- The Groq SDK types `Transcription` as `{ text: string }` only; verbose_json extras are cast via a local `VerboseTranscription` interface
- Preserve original file name/type from the upload so Whisper knows the codec (was originally hardcoded to audio/webm which broke mp3/wav uploads)

### Groq Summarization (`/api/summarize`)
- System prompt engineering: strict JSON schema instructions, no hallucinated field names, all fields required
- One automatic retry on Zod parse failure with a stricter follow-up prompt
- `response_format: { type: "json_object" }` ensures Llama returns pure JSON
- `temperature: 0.2` keeps output deterministic and accurate

### Blob handoff (record → processing)
- Module-level `Map` (`recordingStore.ts`) holds `{ blob, durationMs }` between client-side page navigations
- Peek (non-destructive read) + explicit clear pattern; clears after pipeline completes
- Processing page uses `useRef(false)` guard to prevent React strict-mode double-invocation

### Recording bitrate
- Lowered from 128 kbps → 64 kbps (Opus codec)
- 64 kbps is perceptually transparent for speech
- Halves file sizes: 30 min ≈ 14 MB (within Groq's 25 MB limit)

### File upload flow
- Hidden `<input type="file">` triggered by button click
- `getAudioDuration()` reads file metadata via `<audio>` element
- 25 MB size guard before navigating to processing
- Accepts all formats Whisper supports: webm, mp3, mp4, wav, flac, ogg, m4a

## What Was Cut
- WaveSurfer audio playback on result page (time constraint)
- /settings page (not needed for MVP)
- Word-level sync highlighting on transcript (infrastructure in place via word timestamps)
