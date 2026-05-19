"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

import { useGpuTier } from "@/hooks/useGpuTier";
import { PlaceholderOrb } from "./PlaceholderOrb";

// Dynamic import — Three.js never enters the main bundle
const AudioOrb = dynamic(
  () => import("./AudioOrb").then((m) => m.AudioOrb),
  { ssr: false, loading: () => null }
);

interface OrbProps {
  audioLevel?: number;
  isActive?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  interactive?: boolean;
  forceFallback?: boolean;
}

const SIZE_MAP = {
  sm: "size-12",
  md: "size-48",
  lg: "size-80 md:size-96",
  xl: "size-[28rem] md:size-[34rem]",
};

/**
 * Smart wrapper: serves the 3D orb if the device can handle it,
 * falls back to the CSS PlaceholderOrb on low-end devices.
 *
 * Reserves space during GPU detection to prevent layout shift,
 * and fades the orb in only when the right version is ready.
 */
export function Orb({ forceFallback, size = "lg", className = "", ...props }: OrbProps) {
  const tier = useGpuTier();

  // Still detecting — render an invisible placeholder of the correct size
  // so layout doesn't shift, but nothing is visible
  if (tier === null) {
    return <div className={`${SIZE_MAP[size]} ${className}`} aria-hidden />;
  }

  // Low-tier or forced fallback → CSS orb (still gorgeous)
  if (forceFallback || tier === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <PlaceholderOrb
          audioLevel={props.audioLevel}
          isRecording={props.isActive}
        />
      </motion.div>
    );
  }

  // Real 3D orb — fade in smoothly
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <AudioOrb size={size} className={className} {...props} />
    </motion.div>
  );
}