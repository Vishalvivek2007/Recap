"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ParticleFieldProps {
  count?: number;
  radius?: number;
  audioLevel: number;
}

export function ParticleField({
  count = 200,
  radius = 4,
  audioLevel,
}: ParticleFieldProps) {
  const pointsRef = React.useRef<THREE.Points>(null);

  // Generate positions once
  const { positions, originals } = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originals = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random points in a sphere shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.8 + Math.random() * 0.4);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originals[i * 3] = x;
      originals[i * 3 + 1] = y;
      originals[i * 3 + 2] = z;
    }
    return { positions, originals };
  }, [count, radius]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ox = originals[i3];
      const oy = originals[i3 + 1];
      const oz = originals[i3 + 2];

      // Pull factor: when audio is loud, particles drift inward
      const pullFactor = audioLevel * 0.4;
      // Gentle drift in original orbit + audio pull
      const wobbleX = Math.sin(time * 0.5 + i * 0.1) * 0.1;
      const wobbleY = Math.cos(time * 0.4 + i * 0.13) * 0.1;

      arr[i3] = ox * (1 - pullFactor) + wobbleX;
      arr[i3 + 1] = oy * (1 - pullFactor) + wobbleY;
      arr[i3 + 2] = oz * (1 - pullFactor);
    }
    posAttr.needsUpdate = true;

    // Slow rotation
    pointsRef.current.rotation.y = time * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#9d7fff"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}