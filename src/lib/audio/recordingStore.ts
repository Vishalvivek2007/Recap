/**
 * In-memory store for passing recording blobs between client pages.
 * Lives in module scope so it survives client-side navigation (no page reload).
 *
 * Design: peek (non-destructive) + explicit clear.
 * The processing page peeks on mount and clears after the pipeline completes.
 */

interface RecordingData {
  blob: Blob;
  durationMs: number;
}

const store = new Map<string, RecordingData>();

export function storeRecording(id: string, data: RecordingData): void {
  store.set(id, data);
}

export function peekRecording(id: string): RecordingData | undefined {
  return store.get(id);
}

export function clearRecording(id: string): void {
  store.delete(id);
}
