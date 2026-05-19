"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useRecorder } from "@/hooks/useRecorder";
import { Orb } from "@/components/orb/Orb";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { AuroraBackground } from "@/components/landing/AuroraBackground";
import { formatDuration } from "@/lib/utils/format";

export default function RecordPage() {
  const router = useRouter();
  const {
    state,
    elapsedMs,
    audioLevel,
    error,
    result,
    requestPermission,
    start,
    stop,
  } = useRecorder();

  const isRecording = state === "recording";
  const isReady = state === "ready";
  const isStopping = state === "stopping";

  // Auto-request permission on first interaction
  const handlePrimary = async () => {
    if (state === "idle") {
      await requestPermission();
    } else if (state === "ready") {
      start();
    } else if (state === "recording") {
      stop();
    }
  };

  // When recording completes, navigate to processing page
  React.useEffect(() => {
    if (result) {
      // Store blob in sessionStorage as base64 for the processing page to pick up
      // (We'll wire actual IndexedDB save in STEP 13)
      const id = crypto.randomUUID();
      console.log("Recording complete:", { id, blob: result.blob, duration: result.durationMs });
      // For now, just log. In STEP 13 we route to /processing/[id]
      // router.push(`/processing/${id}`);
    }
  }, [result, router]);

  const buttonLabel = (() => {
    if (state === "idle") return "Enable microphone";
    if (state === "requesting-permission") return "Requesting...";
    if (state === "ready") return "Start recording";
    if (state === "recording") return "Stop recording";
    if (state === "stopping") return "Processing...";
    return "Try again";
  })();

  return (
    <>
      <AuroraBackground />

      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="size-2 rounded-full bg-destructive"
              />
              <span className="font-mono text-xs text-text-primary">REC</span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-6 gap-12 relative">
        {/* The orb */}
        <Orb
          audioLevel={audioLevel}
          isActive={isRecording}
          size="xl"
          showParticles
          interactive
        />

        {/* Elapsed time */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-5xl md:text-6xl tabular-nums tracking-tight"
          >
            {formatDuration(elapsedMs)}
          </motion.div>
          <motion.p
            key={`label-${state}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-text-muted text-sm"
          >
            {isRecording
              ? "Recording... speak naturally"
              : isReady
              ? "Microphone ready"
              : state === "stopping"
              ? "Wrapping up..."
              : state === "error"
              ? "Microphone access denied"
              : "Tap to begin"}
          </motion.p>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col items-center gap-4">
          <MagneticButton
            onClick={handlePrimary}
            disabled={isStopping || state === "requesting-permission"}
            className={`
              group relative px-10 py-5 rounded-full font-medium text-base
              transition-all duration-500
              ${
                isRecording
                  ? "bg-destructive text-white"
                  : "bg-gradient-hero text-white glow-accent"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isRecording ? (
              <Square className="size-4 mr-2" strokeWidth={2.5} fill="currentColor" />
            ) : (
              <Mic className="size-4 mr-2" strokeWidth={2.5} />
            )}
            {buttonLabel}
          </MagneticButton>

          {/* Secondary: upload file */}
          {!isRecording && state !== "stopping" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <Upload className="size-3.5" />
              Or upload an audio file
            </motion.button>
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm max-w-md text-center"
            >
              {error.message}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}