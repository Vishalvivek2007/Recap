"use client";

import { motion } from "framer-motion";

interface PlaceholderOrbProps {
  audioLevel?: number; // 0..1
  isRecording?: boolean;
}

export function PlaceholderOrb({
  audioLevel = 0,
  isRecording = false,
}: PlaceholderOrbProps) {
  // Scale the orb subtly with audio level
  const scale = 1 + audioLevel * 0.15;
  const glowIntensity = 0.4 + audioLevel * 0.6;

  return (
    <div className="relative size-80 md:size-96 flex items-center justify-center">
      {/* Outer rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-border-subtle"
          animate={{
            scale: isRecording ? [1, 1.15 + i * 0.1, 1] : 1,
            opacity: isRecording ? [0.3, 0.05, 0.3] : 0.15,
          }}
          transition={{
            duration: 2.5 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Main orb */}
      <motion.div
        animate={{ scale }}
        transition={{ duration: 0.1, ease: "linear" }}
        className="relative size-56 md:size-64 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, #0a0612 0%, #0a0612 35%, transparent 70%),
            radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.7) 0%, transparent 55%),
            radial-gradient(circle at 70% 70%, hsl(var(--accent-pink) / 0.6) 0%, transparent 55%),
            radial-gradient(circle at 50% 80%, hsl(var(--accent-amber) / 0.5) 0%, transparent 50%)
          `,
          boxShadow: `
            0 0 ${50 + audioLevel * 60}px ${glowIntensity * 20}px hsl(var(--accent) / ${glowIntensity * 0.4}),
            inset 0 0 40px rgba(0, 0, 0, 0.6)
          `,
          filter: `blur(${isRecording ? 0 : 0.5}px)`,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute top-[15%] left-[20%] size-[30%] rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Soft outer glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--accent) / ${glowIntensity * 0.3}) 0%, transparent 60%)`,
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}