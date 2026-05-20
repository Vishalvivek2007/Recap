"use client";

import { motion } from "framer-motion";
import { Brain, Globe, Lock, Sparkles, Zap, Search } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Structured intelligence",
    description: "Beyond transcription — Notely extracts title, TLDR, decisions, action items, open questions, and key topics as structured data.",
    span: "md:col-span-2",
    accent: "var(--accent)",
  },
  {
    icon: Zap,
    title: "Sub-second AI",
    description: "Groq's inference is so fast, summaries appear before you blink.",
    span: "md:col-span-1",
    accent: "var(--accent-pink)",
  },
  {
    icon: Lock,
    title: "Zero servers",
    description: "Your recordings live in your browser, encrypted by IndexedDB. We literally cannot read them.",
    span: "md:col-span-1",
    accent: "var(--accent-amber)",
  },
  {
    icon: Search,
    title: "Search every word",
    description: "Find any moment from any meeting. Full-text search across your entire library.",
    span: "md:col-span-1",
    accent: "var(--accent)",
  },
  {
    icon: Globe,
    title: "Multilingual",
    description: "Whisper handles 99 languages. Lectures in Hindi? Meetings in French? Notely doesn't care.",
    span: "md:col-span-1",
    accent: "var(--accent-pink)",
  },
  {
    icon: Sparkles,
    title: "Synced playback",
    description: "Click any word in the transcript to jump audio to that exact moment. Hover, and the active word highlights as it plays.",
    span: "md:col-span-2",
    accent: "var(--accent-amber)",
  },
];

// Container triggers once when it enters view; children stagger automatically
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

export function FeatureBlocks() {
  return (
    <section id="features" className="relative px-6 py-32">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl md:text-5xl text-center mb-4"
        >
          Built for the way you actually work.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-text-secondary mb-20 max-w-2xl mx-auto"
        >
          A recorder that actually understands what you said.
        </motion.p>

        {/* Single viewport observer on the grid — children stagger via variants */}
        <motion.div
          className="grid md:grid-cols-3 gap-4 auto-rows-fr"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              data-cursor="hover"
              className={`
                group relative p-8 rounded-3xl
                bg-bg-elevated border border-border-subtle
                hover:border-border-strong transition-colors duration-500
                hover:-translate-y-1 overflow-hidden
                ${feature.span}
              `}
              style={{ willChange: "transform" }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top right, hsl(${feature.accent} / 0.08), transparent 60%)`,
                }}
              />

              <div className="relative">
                <div
                  className="size-12 rounded-xl flex items-center justify-center mb-6"
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
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
