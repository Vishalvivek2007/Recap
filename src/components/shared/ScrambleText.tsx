"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

const CHARS = "!<>-_\\/[]{}—=+*^?#$%&";

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  triggerOnHover?: boolean;
  /** If true, scrambles immediately after mount without waiting for inView */
  autoStart?: boolean;
}

function makeScrambled(text: string): string {
  return text
    .split("")
    .map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
    .join("");
}

export function ScrambleText({
  text,
  className = "",
  duration = 1200,
  delay = 0,
  triggerOnHover = true,
  autoStart = true,
}: ScrambleTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const [mounted, setMounted] = React.useState(false);
  const [display, setDisplay] = React.useState(text);
  const [hasRun, setHasRun] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Mount: swap to scrambled placeholder on the client
  React.useEffect(() => {
    setMounted(true);
    setDisplay(makeScrambled(text));
  }, [text]);

  const scramble = React.useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * text.length);

      const scrambled = text
        .split("")
        .map((char, i) => {
          if (i < revealedCount) return char;
          if (char === " ") return " ";
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplay(scrambled);

      if (progress >= 1) {
        setDisplay(text);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 40);
  }, [text, duration]);

  // Trigger via autoStart (mount + delay) OR inView, whichever is appropriate
  React.useEffect(() => {
    if (!mounted || hasRun) return;
    if (autoStart || inView) {
      setHasRun(true);
      const timer = setTimeout(scramble, delay);
      return () => clearTimeout(timer);
    }
  }, [mounted, inView, hasRun, autoStart, scramble, delay]);

  React.useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page restored from bfcache — call scramble directly instead of relying
        // on the state-cascade path, which React may not process synchronously
        // after a frozen page resumes.
        scramble();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [scramble]);

  return (
    <motion.span
      ref={ref}
      onMouseEnter={triggerOnHover ? scramble : undefined}
      className={className}
      style={{ display: "inline-block" }}
      suppressHydrationWarning
    >
      {display}
    </motion.span>
  );
}