"use client";

import { useEffect, useState } from "react";
import { getGPUTier } from "detect-gpu";

/**
 * Returns null while detecting, then a tier 0..3.
 * tier 0 = potato (fall back to CSS orb)
 * tier 1-3 = use WebGL
 */
export function useGpuTier() {
  const [tier, setTier] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getGPUTier()
      .then((result) => {
        if (!cancelled) setTier(result.tier);
      })
      .catch(() => {
        if (!cancelled) setTier(0); // assume potato on error
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return tier;
}