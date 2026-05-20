"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// GPU-driven particle motion — no per-frame CPU position writes
const particleVertexShader = /* glsl */ `
  attribute float aIndex;
  uniform float uTime;
  uniform float uAudioLevel;

  void main() {
    // Particles drift toward origin when audio is active
    float pull = uAudioLevel * 0.4;
    float wobbleX = sin(uTime * 0.5 + aIndex * 0.1) * 0.1;
    float wobbleY = cos(uTime * 0.4 + aIndex * 0.13) * 0.1;

    vec3 pos = position * (1.0 - pull);
    pos.x += wobbleX;
    pos.y += wobbleY;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 2.0;
  }
`;

const particleFragmentShader = /* glsl */ `
  void main() {
    // Soft circular point
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    if (d > 0.25) discard;
    float alpha = 0.55 * (1.0 - d * 4.0);
    gl_FragColor = vec4(0.62, 0.50, 1.0, alpha);
  }
`;

interface ParticleFieldProps {
  count?: number;
  radius?: number;
  audioLevel: number;
}

export function ParticleField({
  count = 70,
  radius = 4,
  audioLevel,
}: ParticleFieldProps) {
  const pointsRef = React.useRef<THREE.Points>(null);
  const matRef = React.useRef<THREE.ShaderMaterial>(null);

  // Positions and per-particle indices — generated once, never mutated CPU-side
  const { positions, indices } = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    const indices = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.8 + Math.random() * 0.4);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      indices[i] = i;
    }
    return { positions, indices };
  }, [count, radius]);

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uAudioLevel: { value: 0 },
    }),
    []
  );

  // Only uniform updates per frame — no geometry writes
  useFrame((state) => {
    if (!matRef.current || !pointsRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uAudioLevel.value = audioLevel;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-aIndex"
          args={[indices, 1]}
          count={count}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
