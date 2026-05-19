import Groq from "groq-sdk";
import type { NextRequest } from "next/server";
import { SUMMARIZATION_MODEL } from "@/lib/constants";
import { SummarySchema } from "@/lib/ai/schema";
import type { Summary } from "@/types/meeting";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert note-taker. Given a meeting or lecture transcript, extract structured insights.

Respond ONLY with valid JSON matching this exact schema:
{
  "title": "concise title (max 80 chars)",
  "tldr": "1-3 sentence executive summary",
  "topics": ["topic1", "topic2"],
  "keyPoints": [
    { "topic": "Topic Name", "points": ["point 1", "point 2"] }
  ],
  "decisions": [
    { "decision": "what was decided", "context": "why / background" }
  ],
  "actionItems": [
    { "assignee": "person or 'team'", "task": "what to do", "deadline": "date string or null" }
  ],
  "questions": ["open question 1", "open question 2"]
}

Rules:
- title: derive from content, never use generic names
- tldr: must capture the essence in plain language
- topics: 2–6 high-level themes
- keyPoints: group related points under topics, 2–4 groups max
- decisions: only include explicit decisions, empty array if none
- actionItems: only include explicit tasks, empty array if none
- questions: unresolved questions raised, empty array if none
- All fields are required. Never omit any key.`;

async function callLLM(transcriptText: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: SUMMARIZATION_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Transcript:\n\n${transcriptText}` },
    ],
    temperature: 0.2,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });
  return completion.choices[0]?.message?.content ?? "{}";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcriptText: string = body.text;

    if (!transcriptText?.trim()) {
      return Response.json({ error: "Missing transcript text" }, { status: 400 });
    }

    let rawJson = await callLLM(transcriptText);
    let parsed = SummarySchema.safeParse(JSON.parse(rawJson));

    // Retry once with a stricter prompt if parsing fails
    if (!parsed.success) {
      const retryJson = await callLLM(
        `${transcriptText}\n\nCRITICAL: Your previous response failed schema validation. Return ONLY the JSON object with all required fields.`
      );
      parsed = SummarySchema.safeParse(JSON.parse(retryJson));
    }

    if (!parsed.success) {
      return Response.json(
        { error: "Failed to parse AI response", details: parsed.error.flatten() },
        { status: 500 }
      );
    }

    const summary: Summary = parsed.data;
    return Response.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summarization failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
