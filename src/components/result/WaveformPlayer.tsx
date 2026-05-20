"use client";

import * as React from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";

// ─── Public handle exposed via forwardRef ────────────────────────────────────

export interface WaveformPlayerHandle {
  seekTo: (seconds: number) => void;
  play: () => void;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface WaveformPlayerProps {
  audioBlob: Blob;
  /** Called on every audio frame — keep this stable (use useCallback or a ref) */
  onTimeUpdate?: (currentTime: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Build a horizontal linear gradient for WaveSurfer.
 * width should match the container width so the purple→pink spread fills the bar.
 */
function buildGradients(width: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;

  // Unplayed — semi-transparent brand gradient
  const wave = ctx.createLinearGradient(0, 0, width, 0);
  wave.addColorStop(0, "rgba(124, 92, 255, 0.45)");
  wave.addColorStop(1, "rgba(255, 107, 157, 0.45)");

  // Played — solid brand gradient
  const progress = ctx.createLinearGradient(0, 0, width, 0);
  progress.addColorStop(0, "#7c5cff");
  progress.addColorStop(1, "#ff6b9d");

  return { wave, progress };
}

// ─── Component ───────────────────────────────────────────────────────────────

export const WaveformPlayer = React.forwardRef<
  WaveformPlayerHandle,
  WaveformPlayerProps
>(function WaveformPlayer({ audioBlob, onTimeUpdate }, ref) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const wsRef = React.useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  // Keep the callback ref fresh so it never goes stale inside the WaveSurfer
  // event closure without needing to tear down and recreate the instance.
  const onTimeUpdateRef = React.useRef(onTimeUpdate);
  React.useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  });

  // Expose seekTo / play imperatively
  React.useImperativeHandle(ref, () => ({
    seekTo(seconds: number) {
      wsRef.current?.setTime(seconds);
    },
    play() {
      wsRef.current?.play().catch(() => {});
    },
  }));

  // Init WaveSurfer — runs once per audioBlob
  React.useEffect(() => {
    if (!containerRef.current || !audioBlob || audioBlob.size === 0) {
      if (audioBlob?.size === 0) setHasError(true);
      return;
    }

    const containerWidth = containerRef.current.offsetWidth || 800;
    const { wave, progress } = buildGradients(containerWidth);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: wave,
      progressColor: progress,
      cursorColor: "transparent",
      cursorWidth: 0,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 56,
      normalize: true,
      interact: true,
      dragToSeek: { debounceTime: 80 },
      hideScrollbar: true,
    });

    wsRef.current = ws;
    let destroyed = false;

    ws.on("ready", (dur) => {
      setDuration(dur);
      setIsReady(true);
    });
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onTimeUpdateRef.current?.(0);
    });
    ws.on("timeupdate", (t) => {
      setCurrentTime(t);
      onTimeUpdateRef.current?.(t);
    });
    ws.on("error", (err) => {
      if (destroyed) return;
      console.error("[WaveformPlayer]", err);
      setHasError(true);
    });

    // We manage the URL ourselves so we can guarantee revocation on unmount.
    const url = URL.createObjectURL(audioBlob);
    ws.load(url).catch((err) => {
      if (destroyed) return; // AbortError from cleanup; not a real error
      console.error("[WaveformPlayer] load error:", err);
      setHasError(true);
    });

    return () => {
      destroyed = true;
      try { ws.destroy(); } catch {} // destroy() aborts in-flight fetch → AbortError; safe to swallow
      wsRef.current = null;
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  const handlePlayPause = () => {
    if (!wsRef.current || !isReady) return;
    wsRef.current.playPause();
  };

  return (
    <div className="relative rounded-2xl bg-bg-elevated border border-border-subtle overflow-hidden">
      {hasError ? (
        <p className="text-sm text-text-muted text-center py-5">
          Audio playback is unavailable for this recording.
        </p>
      ) : (
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="
              shrink-0 size-10 rounded-full bg-gradient-hero
              text-white flex items-center justify-center
              transition-transform
              enabled:hover:scale-105 enabled:active:scale-95
              disabled:opacity-40
            "
          >
            {isPlaying ? (
              <Pause className="size-4 text-white" />
            ) : (
              <Play className="size-4 text-white ml-0.5" />
            )}
          </button>

          {/* Waveform + timestamps */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div ref={containerRef} className="w-full" />
            <div className="flex items-center justify-between text-[11px] text-text-muted font-mono select-none">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay — fades out once ready */}
      {!isReady && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated">
          <span className="flex items-center gap-2 text-xs text-text-muted">
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            Loading audio…
          </span>
        </div>
      )}
    </div>
  );
});
