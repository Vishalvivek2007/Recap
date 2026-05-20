"use client";

import * as React from "react";
import type { TranscriptWord } from "@/types/meeting";

// ─── Memoised word span ───────────────────────────────────────────────────────
// Direct onClick instead of event delegation — unambiguous and no closest() edge
// cases. The `onClick` prop is the same stable reference for every word (via the
// ref-callback pattern below), so the custom comparator still bails out on all
// words except the two that change isActive each tick.

const Word = React.memo(
  function Word({
    text,
    index,
    isActive,
    onClick,
  }: {
    text: string;
    index: number;
    isActive: boolean;
    onClick: (idx: number) => void;
  }) {
    return (
      <span
        role="button"
        tabIndex={-1}
        data-active={isActive ? "true" : undefined}
        onMouseDown={(e) => {
          // Prevent the default text-selection start so a fast click doesn't
          // accidentally select the word instead of seeking the audio.
          e.preventDefault();
          onClick(index);
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
        {text}
      </span>
    );
  },
  // Only re-render when active state or text changes; onClick is always the same ref
  (prev, next) => prev.isActive === next.isActive && prev.text === next.text
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface WordTranscriptProps {
  words: TranscriptWord[];
  /** Index of the word currently being spoken; -1 if none */
  activeWordIdx: number;
  /** Called with word.start (seconds) when the user clicks a word */
  onWordClick: (start: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WordTranscript({
  words,
  activeWordIdx,
  onWordClick,
}: WordTranscriptProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Keep a ref to the latest words + callback so the stable handler below
  // never captures a stale closure.
  const wordsRef = React.useRef(words);
  const onWordClickRef = React.useRef(onWordClick);
  React.useEffect(() => {
    wordsRef.current = words;
    onWordClickRef.current = onWordClick;
  });

  // One stable function shared by every Word — no per-word closure churn.
  const handleWordClick = React.useCallback((idx: number) => {
    const word = wordsRef.current[idx];
    if (word) onWordClickRef.current(word.start);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll active word into view (only if off-screen)
  React.useEffect(() => {
    if (activeWordIdx < 0 || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(
      '[data-active="true"]'
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeWordIdx]);

  if (words.length === 0) return null;

  return (
    <div ref={containerRef} className="text-sm leading-[1.9]">
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <Word
            text={w.word}
            index={i}
            isActive={i === activeWordIdx}
            onClick={handleWordClick}
          />
          {" "}
        </React.Fragment>
      ))}
    </div>
  );
}
