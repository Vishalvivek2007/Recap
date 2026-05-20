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

  // SSR-safe: initial value matches the server render to avoid hydration mismatch
  const [display, setDisplay] = React.useState(text);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const scramble = React.useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * text.length);

      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (i < revealedCount) return char;
            if (char === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (progress >= 1) {
        setDisplay(text);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      }
    }, 40);
  }, [text, duration]);

  // Always-current scramble ref: lets empty-dep effects call the latest version
  // without going stale, and without adding scramble to their dep arrays.
  const scrambleRef = React.useRef(scramble);
  React.useEffect(() => {
    scrambleRef.current = scramble;
  });

  // Auto-start: empty deps = fires once on mount.
  //
  // Why empty deps instead of [autoStart, delay, scramble]?
  // React StrictMode (dev) double-invokes effects: run → cleanup → run.
  // If we guard with useState(hasRun), the first run sets hasRun=true, cleanup
  // clears the timer, and the second run bails out — timer never fires.
  // With empty deps and no state guard: cleanup just clears the timer,
  // the second run recreates it. The real timer fires after the double-invoke.
  React.useEffect(() => {
    if (!autoStart) return;
    setDisplay(makeScrambled(text));
    const t = setTimeout(() => scrambleRef.current(), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // inView trigger: only for components with autoStart=false (e.g. scroll reveals)
  const inViewFiredRef = React.useRef(false);
  React.useEffect(() => {
    if (autoStart || !inView || inViewFiredRef.current) return;
    inViewFiredRef.current = true;
    scramble();
  }, [autoStart, inView, scramble]);

  // bfcache restore (browser back from a hard navigation, page thawed frozen)
  React.useEffect(() => {
    const handle = (e: PageTransitionEvent) => {
      console.log("[ScrambleText] pageshow", { persisted: e.persisted });
      if (!e.persisted) return;
      setDisplay(makeScrambled(text));
      setTimeout(() => scrambleRef.current(), delay);
    };
    window.addEventListener("pageshow", handle);
    return () => window.removeEventListener("pageshow", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Soft-nav fallback: re-trigger if component survives a route change in a shared layout
  const pathname = usePathname();
  const prevPathnameRef = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;
    setDisplay(makeScrambled(text));
    setTimeout(() => scrambleRef.current(), delay);
  }, [pathname, text, delay]);

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
