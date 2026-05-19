"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

import { OrbMaterialImpl } from "./OrbMaterial";
import "./OrbMaterial"; // registers the material
import { ParticleField } from "./ParticleField";

interface AudioOrbProps {
  audioLevel?: number; // 0..1
  isActive?: boolean; // recording state
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showParticles?: boolean;
  interactive?: boolean; // follow cursor
}

/**
 * The actual mesh — runs inside the Canvas.
 */
function OrbMesh({
  audioLevel,
  isActive,
  interactive,
}: {
  audioLevel: number;
  isActive: boolean;
  interactive: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<OrbMaterialImpl>(null);
  const { viewport, mouse } = useThree();

  // Smoothed audio level (eases sudden spikes)
  const smoothedLevel = React.useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    smoothedLevel.current += (audioLevel - smoothedLevel.current) * 0.15;

    if (materialRef.current) {
      materialRef.current.uTime = t;
      materialRef.current.uAudioLevel = smoothedLevel.current;
      // More distortion when actively recording
      materialRef.current.uDistortion = isActive
        ? 0.45 + smoothedLevel.current * 0.3
        : 0.28;
    }

    if (meshRef.current) {
      // Cursor parallax (subtle) — disabled while recording (orb focuses inward)
      if (interactive && !isActive) {
        const targetX = (mouse.x * viewport.width) / 18;
        const targetY = (mouse.y * viewport.height) / 18;
        meshRef.current.rotation.y +=
          (targetX - meshRef.current.rotation.y) * 0.04;
        meshRef.current.rotation.x +=
          (-targetY - meshRef.current.rotation.x) * 0.04;
      } else {
        // Slow ambient rotation
        meshRef.current.rotation.y = t * 0.15;
        meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      }

      // Subtle breathing scale
      const breath = 1 + Math.sin(t * 0.8) * 0.015;
      meshRef.current.scale.setScalar(breath);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 64]} />
      <orbMaterial ref={materialRef} attach="material" />
    </mesh>
  );
}

const SIZE_MAP = {
  sm: "size-12",
  md: "size-48",
  lg: "size-80 md:size-96",
  xl: "size-[28rem] md:size-[34rem]",
};

export function AudioOrb({
  audioLevel = 0,
  isActive = false,
  size = "lg",
  className = "",
  showParticles = true,
  interactive = true,
}: AudioOrbProps) {
  return (
    <div
      className={`relative ${SIZE_MAP[size]} ${className}`}
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        }}
        style={{
          position: "absolute",
          top: "-15%",
          left: "-15%",
          width: "130%",
          height: "130%",
          background: "transparent",
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        {/* Subtle key + rim lighting (the shader is mostly emissive) */}
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#ff6b9d" />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#7c5cff" />

        <OrbMesh
          audioLevel={audioLevel}
          isActive={isActive}
          interactive={interactive}
        />

        {showParticles && (
          <ParticleField audioLevel={audioLevel} count={150} radius={2.2} />
        )}

        {/* multisampling=0: MSAA render targets don't support alpha channels,
            causing an opaque rectangle in transparent canvases.
            frameBufferType=HalfFloat: ensures FBOs preserve alpha properly. */}
        <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new Vector2(0.0008, 0.0008)}
            radialModulation={false}
            modulationOffset={0}
          />
        </EffectComposer>
      </Canvas>

      {/* Soft halo behind the canvas */}
      <div
        className="absolute inset-0 -z-10 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--accent) / ${
            0.25 + audioLevel * 0.4
          }) 0%, transparent 60%)`,
          filter: "blur(40px)",
          transform: `scale(${1 + audioLevel * 0.3})`,
          transition: "transform 0.1s linear",
        }}
      />
    </div>
  );
}