"use client";

import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/shared/GradientText";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-8"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-text-secondary">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          Powered by Whisper + Llama 3.3
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-6xl md:text-8xl lg:text-9xl text-center max-w-5xl leading-[0.95] tracking-tight"
      >
        Every meeting,
        <br />
        <GradientText as="span" className="italic">
          distilled
        </GradientText>{" "}
        in seconds.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 text-lg md:text-xl text-text-secondary text-center max-w-2xl leading-relaxed"
      >
        Record any lecture, meeting, or conversation. Notely transcribes it,
        pulls out decisions and action items, and writes the summary you would've
        skipped writing.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link href="/record" className="block">
          <MagneticButton className="group relative px-8 py-4 rounded-full bg-gradient-hero text-white font-medium text-base glow-accent overflow-hidden">
            <Mic className="size-4 mr-2" strokeWidth={2.5} />
            Start recording
            <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
          </MagneticButton>
        </Link>

        <Link
          href="#how"
          className="px-6 py-4 rounded-full text-text-secondary hover:text-text-primary text-sm transition-colors"
        >
          See how it works →
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-12 text-xs text-text-muted font-mono"
      >
        100% client-side · Your audio never leaves your browser
      </motion.p>
    </section>
  );
}