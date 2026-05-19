"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioRecorder, type RecorderState } from "@/lib/audio/recorder";

export function useRecorder() {
  const recorderRef = useRef<AudioRecorder | null>(null);

  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<{ blob: Blob; durationMs: number } | null>(null);

  // Init recorder once
  useEffect(() => {
    recorderRef.current = new AudioRecorder({
      onStateChange: setState,
      onTick: setElapsedMs,
      onAudioLevel: setAudioLevel,
      onError: setError,
      onComplete: (blob, durationMs) => setResult({ blob, durationMs }),
    });
    return () => recorderRef.current?.destroy();
  }, []);

  const requestPermission = useCallback(async () => {
    setError(null);
    await recorderRef.current?.requestPermission();
  }, []);

  const start = useCallback(() => {
    setError(null);
    setElapsedMs(0);
    setResult(null);
    recorderRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setElapsedMs(0);
    setAudioLevel(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    state,
    elapsedMs,
    audioLevel,
    error,
    result,
    requestPermission,
    start,
    stop,
    reset,
  };
}