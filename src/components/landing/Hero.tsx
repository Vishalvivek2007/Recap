"use client";

import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { GradientText } from "@/components/shared/GradientText";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { ScrambleText } from "@/components/shared/ScrambleText";
import { Orb } from "@/components/orb/Orb";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-10"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-text-secondary">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          Groq Whisper + Llama 3.3 · Notes stay in your browser
        </span>
      </motion.div>

      {/* The big orb — front and center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        <Orb size="lg" showParticles interactive />
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-5xl md:text-7xl lg:text-8xl text-center max-w-5xl leading-[0.95] tracking-tight"
      >
        Every meeting,{" "}
        <GradientText as="span" className="italic">
          <ScrambleText text="distilled" duration={1400} delay={1200} />
        </GradientText>
        <br />
        in seconds.
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 text-base md:text-lg text-text-secondary text-center max-w-xl leading-relaxed"
      >
        Record any lecture or meeting. Notely transcribes it, pulls out decisions
        and action items, and writes the summary you would&apos;ve skipped.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link href="/record" className="block" data-cursor="hover">
          <MagneticButton className="group relative px-8 py-4 rounded-full bg-gradient-hero text-white font-medium text-base glow-accent overflow-hidden">
            <Mic className="size-4 mr-2" strokeWidth={2.5} />
            Start recording
            <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
          </MagneticButton>
        </Link>

        <Link
          href="#features"
          className="px-6 py-4 rounded-full text-text-secondary hover:text-text-primary text-sm transition-colors"
          data-cursor="hover"
        >
          See it in action →
        </Link>
      </motion.div>

      {/* Footnote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="mt-12 text-xs text-text-muted font-mono"
      >
        100% client-side · No accounts · Your audio stays in your browser
      </motion.p>
    </section>
  );
}