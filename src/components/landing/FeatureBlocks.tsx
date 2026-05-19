"use client";

import { motion } from "framer-motion";
import { Mic, Brain, FileText } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Record anything",
    description:
      "Hit record. Speak. Or upload an audio file you already have. Works for lectures, stand-ups, interviews, customer calls.",
    accent: "var(--accent)",
  },
  {
    icon: Brain,
    title: "AI understands",
    description:
      "Whisper transcribes with word-level timestamps. Llama 3.3 extracts the structure: title, TLDR, decisions, action items, open questions.",
    accent: "var(--accent-pink)",
  },
  {
    icon: FileText,
    title: "Use it instantly",
    description:
      "Click any line of the transcript to jump audio to that moment. Copy as markdown. Search every meeting you've ever recorded.",
    accent: "var(--accent-amber)",
  },
];

export function FeatureBlocks() {
  return (
    <section id="features" className="relative px-6 py-32">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl md:text-5xl text-center mb-4"
        >
          Built for the way you actually work
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-text-secondary mb-20 max-w-2xl mx-auto"
        >
          No accounts. No subscriptions. No cloud uploads. Just a recorder that
          actually understands what you said.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative p-8 rounded-2xl bg-bg-elevated border border-border-subtle hover:border-border-strong transition-all duration-500 hover:-translate-y-1"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top, hsl(${feature.accent} / 0.08), transparent 70%)`,
                }}
              />

              <div
                className="relative size-12 rounded-xl flex items-center justify-center mb-6"
                style={{
                  background: `hsl(${feature.accent} / 0.1)`,
                  border: `1px solid hsl(${feature.accent} / 0.2)`,
                }}
              >
                <feature.icon
                  className="size-5"
                  style={{ color: `hsl(${feature.accent})` }}
                  strokeWidth={2}
                />
              </div>

              <h3 className="font-display text-2xl mb-3">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}