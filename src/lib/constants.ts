/**
 * App-wide constants. One source of truth.
 */

export const APP_NAME = "Notely";
export const APP_TAGLINE = "Every meeting, distilled in seconds.";
export const APP_DESCRIPTION =
  "Notely turns lectures, meetings, and conversations into AI-generated transcripts, summaries, and action items — instantly.";

// Recording limits
export const MAX_RECORDING_DURATION_SECONDS = 60 * 60; // 1 hour cap
export const RECORDING_MIME_TYPE = "audio/webm;codecs=opus";
export const RECORDING_BITRATE = 64_000; // 64 kbps opus — clear for speech, keeps files ~14 MB/30 min

// AI models (Groq)
export const TRANSCRIPTION_MODEL = "whisper-large-v3";
export const SUMMARIZATION_MODEL = "llama-3.3-70b-versatile";
export const DIARIZATION_MODEL = "llama-3.3-70b-versatile";

// API routes
export const API_ROUTES = {
  transcribe: "/api/transcribe",
  summarize: "/api/summarize",
  diarize: "/api/diarize",
} as const;

// Routes
export const ROUTES = {
  home: "/",
  record: "/record",
  processing: (id: string) => `/processing/${id}`,
  result: (id: string) => `/r/${id}`,
  library: "/library",
  settings: "/settings",
} as const;