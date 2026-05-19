"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Speak or upload",
    description: "Browser captures audio at high quality. No installs, nothing to set up.",
  },
  {
    n: "02",
    title: "Whisper transcribes",
    description: "Groq's Whisper Large v3 returns a full transcript with word-level timestamps in seconds.",
  },
  {
    n: "03",
    title: "Llama summarizes",
    description: "Llama 3.3 70B parses the transcript into structured fields — title, TLDR, decisions, action items, open questions.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative px-6 py-32">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl md:text-5xl text-center mb-20"
        >
          Three steps, fully automatic.
        </motion.h2>

        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-accent via-accent-pink to-accent-amber opacity-30"
            aria-hidden
          />

          <div className="flex flex-col gap-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex gap-6 items-start"
              >
                <div className="size-14 shrink-0 rounded-full glass flex items-center justify-center font-mono text-sm text-text-secondary z-10 bg-bg-primary">
                  {step.n}
                </div>
                <div className="pt-2">
                  <h3 className="font-display text-2xl mb-2">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}