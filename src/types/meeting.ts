/**
 * Core data model for a recorded meeting / lecture.
 * Everything in the app ultimately reads or writes this shape.
 */

export interface TranscriptSegment {
  id: number;
  text: string;
  start: number; // seconds
  end: number;
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface SpeakerSegment {
  speaker: string; // "Speaker 1", "Speaker 2", …
  start: number;   // seconds
  end: number;
  text: string;
}

export interface Transcript {
  text: string;
  segments: TranscriptSegment[];
  words: TranscriptWord[];
  language?: string;
  /** AI-inferred speaker turns (optional; absent on single-speaker recordings) */
  speakers?: SpeakerSegment[];
}

export interface ActionItem {
  assignee: string;
  task: string;
  deadline: string | null;
}

export interface Decision {
  decision: string;
  context: string;
}

export interface KeyPointGroup {
  topic: string;
  points: string[];
}

export interface Summary {
  title: string;
  tldr: string;
  topics: string[];
  keyPoints: KeyPointGroup[];
  decisions: Decision[];
  actionItems: ActionItem[];
  questions: string[];
}

export interface Meeting {
  id: string;
  createdAt: number; // Date.now()
  title: string;
  duration: number; // seconds
  audioBlob: Blob;
  transcript: Transcript;
  summary: Summary;
}

/** Status enum for the processing pipeline */
export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "transcribing"
  | "summarizing"
  | "complete"
  | "error";