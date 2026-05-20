"use client";

import * as React from "react";
import type { TranscriptWord, SpeakerSegment } from "@/types/meeting";

// ─── Speaker color palette (cycles for 3+ speakers) ─────────────────────────

const SPEAKER_STYLES = [
  { label: "text-accent",       border: "border-l-[hsl(var(--accent))]"       },
  { label: "text-accent-pink",  border: "border-l-[hsl(var(--accent-pink))]"  },
  { label: "text-accent-amber", border: "border-l-[hsl(var(--accent-amber))]" },
];

function getSpeakerStyle(speaker: string) {
  const n = parseInt(speaker.replace(/\D/g, ""), 10);
  return SPEAKER_STYLES[isNaN(n) ? 0 : (n - 1) % SPEAKER_STYLES.length];
}

// ─── Build word groups from speaker segments ──────────────────────────────────

interface WordGroup {
  speaker: string;
  // indices into the global `words` array
  startIdx: number;
  endIdx: number;
}

function buildGroups(words: TranscriptWord[], speakers: SpeakerSegment[]): WordGroup[] {
  if (!speakers.length || !words.length) return [];

  // Find which speaker segment owns each word, then group consecutive same-speaker runs
  const groups: WordGroup[] = [];
  let currentSpeaker = "";
  let groupStart = 0;

  for (let i = 0; i < words.length; i++) {
    const ws = words[i].start;
    // Find the speaker whose time range contains this word
    let speaker = speakers[speakers.length - 1].speaker; // fallback: last speaker
    for (const seg of speakers) {
      if (ws >= seg.start - 0.05 && ws < seg.end + 0.1) {
        speaker = seg.speaker;
        break;
      }
    }

    if (speaker !== currentSpeaker) {
      if (currentSpeaker !== "") {
        groups.push({ speaker: currentSpeaker, startIdx: groupStart, endIdx: i - 1 });
      }
      currentSpeaker = speaker;
      groupStart = i;
    }
  }
  if (currentSpeaker !== "") {
    groups.push({ speaker: currentSpeaker, startIdx: groupStart, endIdx: words.length - 1 });
  }

  return groups;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SpeakerTranscriptProps {
  words: TranscriptWord[];
  speakers: SpeakerSegment[];
  activeWordIdx: number;
  onWordClick: (start: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpeakerTranscript({
  words,
  speakers,
  activeWordIdx,
  onWordClick,
}: SpeakerTranscriptProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const groups = React.useMemo(
    () => buildGroups(words, speakers),
    [words, speakers]
  );

  // Keep latest refs so the stable handler never captures stale closures
  const wordsRef = React.useRef(words);
  const onWordClickRef = React.useRef(onWordClick);
  React.useEffect(() => {
    wordsRef.current = words;
    onWordClickRef.current = onWordClick;
  });

  const handleWordClick = React.useCallback((idx: number) => {
    const word = wordsRef.current[idx];
    console.log("[SpeakerTranscript] handleWordClick", { idx, word, wordsLen: wordsRef.current.length });
    if (word) onWordClickRef.current(word.start);
    else console.warn("[SpeakerTranscript] handleWordClick: word at idx", idx, "is undefined");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll active word into view
  React.useEffect(() => {
    if (activeWordIdx < 0 || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeWordIdx]);

  if (!groups.length) return null;

  return (
    <div ref={containerRef} className="flex flex-col gap-5 text-sm leading-[1.9]">
      {groups.map((group, gi) => {
        const style = getSpeakerStyle(group.speaker);
        return (
          <div key={gi} className={`pl-3 border-l-2 ${style.border}`}>
            {/* Speaker label */}
            <span className={`block text-xs font-semibold mb-1 ${style.label}`}>
              {group.speaker}
            </span>

            {/* Words — clickable, same global-index contract as WordTranscript */}
            <div>
              {words.slice(group.startIdx, group.endIdx + 1).map((w, j) => {
                const globalIdx = group.startIdx + j;
                const isActive = globalIdx === activeWordIdx;
                return (
                  <React.Fragment key={globalIdx}>
                    <span
                      role="button"
                      tabIndex={-1}
                      data-active={isActive ? "true" : undefined}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        console.log("[SpeakerTranscript] onMouseDown fired, globalIdx=", globalIdx, "text=", w.word);
                        handleWordClick(globalIdx);
                      }}
                      className={[
                        "inline rounded-sm px-[2px] py-[1px]",
                        "cursor-pointer select-none",
                        "transition-colors duration-200",
                        isActive
                          ? "bg-[hsl(var(--accent)/0.15)] text-accent"
                          : "text-text-primary hover:text-accent",
                      ].join(" ")}
                    >
                      {w.word}
                    </span>
                    {" "}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Honesty note — set expectations that this is heuristic */}
      <p className="text-xs text-text-muted pt-1">
        Speaker labels are AI-inferred from conversational patterns, not acoustic voice fingerprinting.
        Accuracy varies.
      </p>
    </div>
  );
}
