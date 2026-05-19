"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Mic, FileText, ListChecks } from "lucide-react";

const TRANSCRIPT_LINES = [
  { speaker: "Sarah", text: "So for Q2 we're launching in three markets — Germany, France, and Spain.", delay: 0 },
  { speaker: "Marcus", text: "What's the timeline looking like for the EU rollout?", delay: 1800 },
  { speaker: "Sarah", text: "I'll own that. Targeting June 15 for the soft launch.", delay: 3400 },
  { speaker: "Marcus", text: "Cool. And pricing for India? Still working that out?", delay: 5000 },
];

const ACTION_ITEMS = [
  "Sarah owns EU rollout — June 15",
  "Decide India pricing tier",
];

function TypingLine({
  speaker,
  text,
  delay,
  active,
}: {
  speaker: string;
  text: string;
  delay: number;
  active: boolean;
}) {
  const [typed, setTyped] = React.useState("");

  React.useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i <= text.length) {
          setTyped(text.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 22);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay, active]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: typed ? 1 : 0, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-3 text-sm"
    >
      <span className="font-mono text-text-muted shrink-0 w-16">{speaker}</span>
      <span className="text-text-primary leading-relaxed">{typed}</span>
    </motion.div>
  );
}

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {Array.from({ length: 32 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-accent to-accent-pink"
          animate={active ? {
            height: [`${20 + Math.random() * 60}%`, `${30 + Math.random() * 70}%`, `${20 + Math.random() * 50}%`],
          } : { height: "20%" }}
          transition={{
            duration: 0.5 + Math.random() * 0.4,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.02,
          }}
        />
      ))}
    </div>
  );
}

export function LiveDemoPanel() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative px-6 py-32">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl mb-4">
            Watch it think.
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            From raw audio to structured summary in real time. Here&apos;s a 5-second
            preview of what Notely does to every recording.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-3 gap-4 p-6 rounded-3xl bg-bg-elevated border border-border-subtle"
        >
          {/* Recording */}
          <div className="p-5 rounded-2xl bg-bg-subtle border border-border-subtle">
            <div className="flex items-center gap-2 mb-4 text-xs text-text-muted font-mono uppercase tracking-wider">
              <Mic className="size-3" />
              Recording
            </div>
            <WaveformBars active={inView} />
            <div className="mt-4 flex items-center gap-2">
              <motion.span
                animate={inView ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="size-2 rounded-full bg-destructive"
              />
              <span className="text-xs font-mono text-text-secondary">00:08</span>
            </div>
          </div>

          {/* Transcribing */}
          <div className="p-5 rounded-2xl bg-bg-subtle border border-border-subtle">
            <div className="flex items-center gap-2 mb-4 text-xs text-text-muted font-mono uppercase tracking-wider">
              <FileText className="size-3" />
              Transcribing
            </div>
            <div className="space-y-3 min-h-[140px]">
              {TRANSCRIPT_LINES.map((line, i) => (
                <TypingLine key={i} {...line} active={inView} />
              ))}
            </div>
          </div>

          {/* Action items */}
          <div className="p-5 rounded-2xl bg-bg-subtle border border-border-subtle">
            <div className="flex items-center gap-2 mb-4 text-xs text-text-muted font-mono uppercase tracking-wider">
              <ListChecks className="size-3" />
              Action items
            </div>
            <div className="space-y-3">
              {ACTION_ITEMS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 5.5 + i * 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <div className="size-4 rounded-md border border-accent/40 bg-accent/10 shrink-0 mt-0.5 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 5.7 + i * 0.4 }}
                      className="size-1.5 rounded-sm bg-accent"
                    />
                  </div>
                  <span className="text-text-primary leading-snug">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}