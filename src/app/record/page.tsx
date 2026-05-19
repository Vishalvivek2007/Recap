"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Upload, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

import { useRecorder } from "@/hooks/useRecorder";
import { Orb } from "@/components/orb/Orb";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { AuroraBackground } from "@/components/landing/AuroraBackground";
import { formatDuration } from "@/lib/utils/format";
import { storeRecording } from "@/lib/audio/recordingStore";
import { ROUTES } from "@/lib/constants";

// Groq Whisper's max file size (25 MB)
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const ACCEPTED_AUDIO = [
  "audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg",
  "audio/wav", "audio/flac", "audio/x-m4a", "audio/mp3",
].join(",");

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(isFinite(audio.duration) ? audio.duration * 1000 : 0);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve(0);
    });
  });
}

export default function RecordPage() {
  const router = useRouter();
  const { state, elapsedMs, audioLevel, error, result, requestPermission, start, stop } =
    useRecorder();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const isRecording = state === "recording";
  const isReady = state === "ready";
  const isStopping = state === "stopping";

  const handlePrimary = async () => {
    if (state === "idle") await requestPermission();
    else if (state === "ready") start();
    else if (state === "recording") stop();
  };

  // Completed recording → processing
  React.useEffect(() => {
    if (!result) return;
    const id = crypto.randomUUID();
    storeRecording(id, { blob: result.blob, durationMs: result.durationMs });
    router.push(ROUTES.processing(id));
  }, [result, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!e.target) return;
    // Reset so same file can be re-selected
    (e.target as HTMLInputElement).value = "";
    if (!file) return;

    setUploadError(null);

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 25 MB.`);
      return;
    }

    setIsUploading(true);
    const durationMs = await getAudioDuration(file);
    const id = crypto.randomUUID();
    storeRecording(id, { blob: file, durationMs });
    router.push(ROUTES.processing(id));
  };

  const buttonLabel = (() => {
    if (state === "idle") return "Enable microphone";
    if (state === "requesting-permission") return "Requesting...";
    if (state === "ready") return "Start recording";
    if (state === "recording") return "Stop recording";
    if (state === "stopping") return "Finishing...";
    return "Try again";
  })();

  const displayError = error?.message ?? uploadError;

  return (
    <>
      <AuroraBackground />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_AUDIO}
        className="sr-only"
        onChange={handleFileChange}
      />

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
        <Orb
          audioLevel={audioLevel}
          isActive={isRecording}
          size="xl"
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
              ? "Recording — speak naturally"
              : isReady
              ? "Microphone ready"
              : isStopping
              ? "Finishing up..."
              : state === "error"
              ? "Microphone access denied"
              : isUploading
              ? "Reading file..."
              : "Tap to begin"}
          </motion.p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4">
          <MagneticButton
            onClick={handlePrimary}
            disabled={isStopping || state === "requesting-permission" || isUploading}
            className={`
              group relative px-10 py-5 rounded-full font-medium text-base
              transition-all duration-500
              ${isRecording ? "bg-destructive text-white" : "bg-gradient-hero text-white glow-accent"}
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

          {!isRecording && !isStopping && !isUploading && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <Upload className="size-3.5" />
              Or upload an audio file
            </motion.button>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-start gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm max-w-md text-center"
            >
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              {displayError}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
