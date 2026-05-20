import Groq from "groq-sdk";
import { z } from "zod";
import type { NextRequest } from "next/server";
import { DIARIZATION_MODEL } from "@/lib/constants";
import type { TranscriptSegment, SpeakerSegment } from "@/types/meeting";

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Zod schema for LLM output ───────────────────────────────────────────────

const DiarizeResponseSchema = z.object({
  speakerCount: z.number().int().min(1),
  assignments: z.array(
    z.object({
      index: z.number().int(),
      speaker: z.string(),
    })
  ),
});

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a speaker diarization assistant. Given timestamped transcript segments, assign each segment to a speaker label based on conversational cues.

Look for: question/answer patterns, "I think…" vs responses, greetings and replies, topic introductions vs follow-up, different sentence lengths or styles.

Rules:
1. If this is a single speaker (lecture, monologue, solo recording), assign ALL segments to "Speaker 1" and set speakerCount to 1.
2. Be CONSERVATIVE — only create a new speaker when there is strong evidence of a turn change. Fewer speakers is better.
3. Use labels "Speaker 1", "Speaker 2", etc. — never invent real names.
4. Consecutive turns by the same speaker share the same label.
5. Every segment index in the input MUST appear in assignments exactly once.

Respond ONLY with valid JSON:
{
  "speakerCount": <integer 1–10>,
  "assignments": [
    { "index": 0, "speaker": "Speaker 1" },
    { "index": 1, "speaker": "Speaker 2" }
  ]
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSegments(segs: TranscriptSegment[]): string {
  return segs
    .map((s) => {
      const m = Math.floor(s.start / 60);
      const sec = Math.floor(s.start % 60);
      return `[${s.id}] ${m}:${sec.toString().padStart(2, "0")} "${s.text.trim()}"`;
    })
    .join("\n");
}

function buildSpeakerSegments(
  allSegments: TranscriptSegment[],
  assignments: Array<{ index: number; speaker: string }>
): SpeakerSegment[] {
  const speakerMap = new Map(assignments.map((a) => [a.index, a.speaker]));
  const result: SpeakerSegment[] = [];
  let current: SpeakerSegment | null = null;
  let lastSpeaker = "Speaker 1";

  for (const seg of allSegments) {
    const speaker = speakerMap.get(seg.id) ?? lastSpeaker;
    lastSpeaker = speaker;

    if (current && current.speaker === speaker) {
      current.end = seg.end;
      current.text += " " + seg.text.trim();
    } else {
      if (current) result.push(current);
      current = { speaker, start: seg.start, end: seg.end, text: seg.text.trim() };
    }
  }
  if (current) result.push(current);
  return result;
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const segments: TranscriptSegment[] = body.segments ?? [];

    if (segments.length < 3) {
      return Response.json({ speakers: [] });
    }

    // Cap at 120 segments (~10-15 min) to stay within token budget.
    // Speaker patterns establish early; the tail gets the last known speaker.
    const limited = segments.slice(0, 120);
    const formatted = formatSegments(limited);

    const completion = await groq.chat.completions.create({
      model: DIARIZATION_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Transcript segments:\n\n${formatted}` },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = DiarizeResponseSchema.safeParse(JSON.parse(raw));

    if (!parsed.success) {
      return Response.json({ speakers: [] });
    }

    const { assignments } = parsed.data;
    const speakerSegments = buildSpeakerSegments(segments, assignments);

    // Single speaker → omit labels (flat transcript is cleaner)
    const uniqueSpeakers = new Set(speakerSegments.map((s) => s.speaker));
    if (uniqueSpeakers.size <= 1) {
      return Response.json({ speakers: [] });
    }

    return Response.json({ speakers: speakerSegments });
  } catch (err) {
    // Non-fatal — the rest of the page works fine without speaker data
    console.error("[diarize]", err);
    return Response.json({ speakers: [] });
  }
}
