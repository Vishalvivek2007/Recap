import {
  MAX_RECORDING_DURATION_SECONDS,
  RECORDING_BITRATE,
  RECORDING_MIME_TYPE,
} from "@/lib/constants";

export type RecorderState =
  | "idle"
  | "requesting-permission"
  | "ready"
  | "recording"
  | "paused"
  | "stopping"
  | "error";

export interface RecorderEvents {
  onStateChange?: (state: RecorderState) => void;
  onTick?: (elapsedMs: number) => void;
  onAudioLevel?: (level: number) => void; // 0..1
  onError?: (error: Error) => void;
  onComplete?: (blob: Blob, durationMs: number) => void;
}

/**
 * Wraps MediaRecorder + Web Audio AnalyserNode.
 * Emits audio level (RMS) for the orb to consume.
 */
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private chunks: BlobPart[] = [];
  private startTime = 0;
  private rafId: number | null = null;
  private tickInterval: number | null = null;
  private _state: RecorderState = "idle";

  constructor(private events: RecorderEvents = {}) {}

  get state(): RecorderState {
    return this._state;
  }

  private setState(s: RecorderState) {
    this._state = s;
    this.events.onStateChange?.(s);
  }

  async requestPermission(): Promise<void> {
    this.setState("requesting-permission");
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      // Set up audio analyser for level metering
      this.audioCtx = new AudioContext();
      const source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.7;
      source.connect(this.analyser);

      this.setState("ready");
    } catch (err) {
      this.setState("error");
      this.events.onError?.(
        err instanceof Error ? err : new Error("Permission denied")
      );
    }
  }

  private pollAudioLevel = () => {
    if (!this.analyser) return;
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(buffer);
    // RMS calculation
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      const v = buffer[i] / 255;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / buffer.length);
    // Compress and clamp
    const level = Math.min(1, rms * 1.8);
    this.events.onAudioLevel?.(level);
    this.rafId = requestAnimationFrame(this.pollAudioLevel);
  };

  start(): void {
    if (!this.stream) {
      this.events.onError?.(new Error("No stream — call requestPermission first"));
      return;
    }

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: RECORDING_MIME_TYPE,
      audioBitsPerSecond: RECORDING_BITRATE,
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: RECORDING_MIME_TYPE });
      const durationMs = Date.now() - this.startTime;
      this.events.onComplete?.(blob, durationMs);
      this.cleanup();
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(250); // emit chunks every 250ms
    this.setState("recording");

    // Start audio level polling
    this.rafId = requestAnimationFrame(this.pollAudioLevel);

    // Tick for elapsed time + max duration check
    this.tickInterval = window.setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      this.events.onTick?.(elapsed);
      if (elapsed >= MAX_RECORDING_DURATION_SECONDS * 1000) {
        this.stop();
      }
    }, 100);
  }

  stop(): void {
    if (this._state !== "recording") return;
    this.setState("stopping");
    this.mediaRecorder?.stop();
  }

  private cleanup() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.audioCtx?.close();
    this.stream = null;
    this.audioCtx = null;
    this.analyser = null;
    this.rafId = null;
    this.tickInterval = null;
  }

  destroy(): void {
    if (this._state === "recording") this.stop();
    else this.cleanup();
    this.setState("idle");
  }
}