"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { usePathname } from "next/navigation";

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

  // bfcache restore (browser back from a hard navigation): page is thawed frozen,
  // React doesn't remount, so we reset and re-trigger manually.
  React.useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      console.log("[ScrambleText] pageshow", { persisted: e.persisted });
      if (e.persisted) {
        setDisplay(makeScrambled(text));
        setHasRun(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [text]);

  // Soft-nav fallback: if this component lives in a persistent layout and survives
  // a route change, re-trigger when the user navigates back to this page.
  const pathname = usePathname();
  const prevPathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setDisplay(makeScrambled(text));
      setHasRun(false);
    }
  }, [pathname, text]);

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
