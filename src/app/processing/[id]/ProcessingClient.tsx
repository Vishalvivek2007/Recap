"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Orb } from "@/components/orb/Orb";
import { AuroraBackground } from "@/components/landing/AuroraBackground";
import { peekRecording, clearRecording } from "@/lib/audio/recordingStore";
import { saveMeeting } from "@/lib/db/queries";
import { API_ROUTES, ROUTES } from "@/lib/constants";
import type { Transcript, Summary, SpeakerSegment } from "@/types/meeting";

interface Props {
  id: string;
}

type Phase = "transcribing" | "summarizing" | "saving" | "error";

const PHASES: Array<{
  key: Exclude<Phase, "error">;
  label: string;
  sublabel: string;
  audioLevel: number;
  stepIndex: number;
}> = [
  {
    key: "transcribing",
    label: "Transcribing audio",
    sublabel: "Converting your words to text...",
    audioLevel: 0.3,
    stepIndex: 0,
  },
  {
    key: "summarizing",
    label: "Extracting insights",
    sublabel: "Identifying key points, decisions & speakers...",
    audioLevel: 0.65,
    stepIndex: 1,
  },
  {
    key: "saving",
    label: "Saving to library",
    sublabel: "Storing your notes securely on-device...",
    audioLevel: 0.9,
    stepIndex: 2,
  },
];

const STEP_LABELS = ["Transcribe", "Summarize", "Save"];

export function ProcessingClient({ id }: Props) {
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>("transcribing");
  const [errorMsg, setErrorMsg] = React.useState("");
  // useRef prevents React strict-mode from double-starting the pipeline
  const pipelineStarted = React.useRef(false);

  const currentPhaseConfig = PHASES.find((p) => p.key === phase);

  React.useEffect(() => {
    if (pipelineStarted.current) return;
    pipelineStarted.current = true;

    const recording = peekRecording(id);
    if (!recording) {
      // Blob gone (e.g. direct URL visit or page refresh) — go back
      router.replace(ROUTES.record);
      return;
    }

    async function run() {
      try {
        // ── Phase 1: Transcribe ──────────────────────────────────────────
        setPhase("transcribing");
        const formData = new FormData();
        formData.append("audio", recording!.blob, "recording.webm");

        const transcribeRes = await fetch(API_ROUTES.transcribe, {
          method: "POST",
          body: formData,
        });

        if (!transcribeRes.ok) {
          const err = await transcribeRes.json().catch(() => ({}));
          throw new Error(err.error ?? `Transcription failed (${transcribeRes.status})`);
        }

        const { transcript }: { transcript: Transcript } = await transcribeRes.json();

        // ── Phase 2: Summarize + Diarize (parallel) ─────────────────────
        setPhase("summarizing");

        const [summarizeSettled, diarizeSettled] = await Promise.allSettled([
          fetch(API_ROUTES.summarize, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: transcript.text }),
          }),
          fetch(API_ROUTES.diarize, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ segments: transcript.segments }),
          }),
        ]);

        if (summarizeSettled.status === "rejected" || !summarizeSettled.value.ok) {
          const errBody =
            summarizeSettled.status === "fulfilled"
              ? await summarizeSettled.value.json().catch(() => ({}))
              : {};
          throw new Error(errBody.error ?? `Summarization failed`);
        }

        const { summary }: { summary: Summary } = await summarizeSettled.value.json();

        // Speaker separation is best-effort — failure silently degrades to flat transcript
        if (diarizeSettled.status === "fulfilled" && diarizeSettled.value.ok) {
          const diarizeData = await diarizeSettled.value.json().catch(() => ({}));
          const speakers: SpeakerSegment[] = diarizeData.speakers ?? [];
          if (speakers.length) transcript.speakers = speakers;
        }

        // ── Phase 3: Save ────────────────────────────────────────────────
        setPhase("saving");

        await saveMeeting({
          id,
          createdAt: Date.now(),
          title: summary.title,
          duration: Math.round(recording!.durationMs / 1000),
          audioBlob: recording!.blob,
          transcript,
          summary,
        });

        clearRecording(id);

        // Small beat so the "Saving" phase is visible
        await new Promise((r) => setTimeout(r, 600));

        router.push(ROUTES.result(id));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        setErrorMsg(msg);
        setPhase("error");
      }
    }

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AuroraBackground />

      <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-10 relative">
        {/* Orb — reacts to current phase */}
        <motion.div
          key={phase}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Orb
            audioLevel={currentPhaseConfig?.audioLevel ?? 0}
            isActive={phase !== "error"}
            size="xl"
            interactive={false}
          />
        </motion.div>

        {/* Phase text */}
        <div className="flex flex-col items-center gap-3 text-center">
          <AnimatePresence mode="wait">
            {phase === "error" ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-xl font-medium text-destructive">Processing failed</p>
                <p className="text-sm text-text-muted max-w-sm">{errorMsg}</p>
                <button
                  onClick={() => router.push(ROUTES.record)}
                  className="mt-2 px-6 py-2.5 rounded-full bg-gradient-hero text-white text-sm font-medium"
                >
                  Try again
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-2"
              >
                <p className="text-xl md:text-2xl font-medium text-text-primary">
                  {currentPhaseConfig?.label}
                </p>
                <p className="text-sm text-text-muted">{currentPhaseConfig?.sublabel}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step indicator */}
        {phase !== "error" && (
          <div className="flex items-center gap-3">
            {STEP_LABELS.map((label, i) => {
              const stepIndex = currentPhaseConfig?.stepIndex ?? 0;
              const isDone = i < stepIndex;
              const isActive = i === stepIndex;
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      className={`size-2.5 rounded-full transition-colors duration-500 ${
                        isDone
                          ? "bg-accent"
                          : isActive
                          ? "bg-accent-pink"
                          : "bg-border-strong"
                      }`}
                      animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                      transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
                    />
                    <span
                      className={`text-xs transition-colors duration-300 ${
                        isActive
                          ? "text-text-secondary"
                          : isDone
                          ? "text-accent"
                          : "text-text-muted"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <motion.div
                      className="h-px w-8 rounded-full"
                      style={{
                        background:
                          isDone
                            ? "hsl(var(--accent))"
                            : "hsl(var(--border-strong))",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
