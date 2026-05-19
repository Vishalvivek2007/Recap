"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Is my audio uploaded anywhere?",
    a: "Audio is sent to Groq's API for transcription and to their Llama endpoint for summarization, then discarded server-side. The final transcript, summary, and original audio file all live entirely in your browser's IndexedDB. Nothing is stored on our servers because there are no servers.",
  },
  {
    q: "Is it really free?",
    a: "Yes. Notely runs on Groq's free tier, which generously covers normal personal use. No accounts, no subscriptions, no credit cards.",
  },
  {
    q: "What if my meeting is two hours long?",
    a: "For best results, record meetings under 30 minutes. Longer recordings work but may hit free-tier rate limits. We'll add automatic chunking soon.",
  },
  {
    q: "Can I use this on mobile?",
    a: "Yes — Notely works in any modern browser including Chrome and Safari on iOS/Android. The recorder taps directly into your phone's microphone.",
  },
  {
    q: "Does it work offline?",
    a: "Recording works offline. Transcription and summarization require an internet connection to reach Groq's API. Your past recordings remain accessible offline.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-border-subtle"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-6 flex items-center justify-between text-left gap-6 group"
      >
        <span className="font-display text-xl group-hover:text-gradient transition-colors">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 text-text-muted"
        >
          <Plus className="size-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-text-secondary leading-relaxed max-w-3xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="relative px-6 py-32">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl md:text-5xl text-center mb-16"
        >
          Frequently asked.
        </motion.h2>

        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} {...faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}