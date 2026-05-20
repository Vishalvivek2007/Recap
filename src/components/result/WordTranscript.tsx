"use client";

import * as React from "react";
import type { TranscriptWord } from "@/types/meeting";

// ─── Memoised word span ───────────────────────────────────────────────────────
// Only the two spans that change (old active → new active) re-render on each
// timeupdate tick. Everything else bails out of the reconciler cheaply.

const Word = React.memo(
  function Word({
    text,
    index,
    isActive,
  }: {
    text: string;
    index: number;
    isActive: boolean;
  }) {
    return (
      <span
        data-word-idx={String(index)}
        data-active={isActive ? "true" : undefined}
        className={[
          "inline rounded-sm px-[2px] py-[1px] cursor-pointer",
          "transition-colors duration-200",
          "hover:text-accent",
          isActive
            ? "bg-[hsl(var(--accent)/0.15)] text-accent"
            : "text-text-primary",
        ].join(" ")}
      >
        {text}
      </span>
    );
  },
  // Custom comparator — only re-render when the active state or text changes
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

  // ── Click via event delegation (single handler, not one per word) ──────────
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-word-idx]"
      );
      if (!target) return;
      const idx = Number(target.dataset.wordIdx);
      if (!Number.isNaN(idx) && words[idx]) {
        onWordClick(words[idx].start);
      }
    },
    [words, onWordClick]
  );

  // ── Auto-scroll active word into view (gentle — only if off-screen) ────────
  React.useEffect(() => {
    if (activeWordIdx < 0 || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(
      '[data-active="true"]'
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeWordIdx]);

  if (words.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="text-sm leading-[1.9] select-text"
    >
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <Word text={w.word} index={i} isActive={i === activeWordIdx} />
          {" "}
        </React.Fragment>
      ))}
    </div>
  );
}
