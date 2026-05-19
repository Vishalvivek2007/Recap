import Groq, { toFile } from "groq-sdk";
import type { NextRequest } from "next/server";
import { TRANSCRIPTION_MODEL } from "@/lib/constants";
import type { Transcript } from "@/types/meeting";

export const maxDuration = 60;

// Groq's verbose_json response shape (not fully typed in the SDK)
interface VerboseTranscription {
  text: string;
  language?: string;
  segments?: Array<{ text: string; start: number; end: number }>;
  words?: Array<{ word: string; start: number; end: number }>;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioEntry = formData.get("audio");

    if (!audioEntry || !(audioEntry instanceof File)) {
      return Response.json({ error: "Missing audio file" }, { status: 400 });
    }

    const file = await toFile(audioEntry, "recording.webm", {
      type: "audio/webm",
    });

    const raw = (await groq.audio.transcriptions.create({
      file,
      model: TRANSCRIPTION_MODEL,
      response_format: "verbose_json",
      timestamp_granularities: ["word", "segment"],
      temperature: 0,
    })) as unknown as VerboseTranscription;

    const transcript: Transcript = {
      text: raw.text,
      language: raw.language,
      segments: (raw.segments ?? []).map((s, i) => ({
        id: i,
        text: s.text,
        start: s.start,
        end: s.end,
      })),
      words: (raw.words ?? []).map((w) => ({
        word: w.word,
        start: w.start,
        end: w.end,
      })),
    };

    return Response.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
