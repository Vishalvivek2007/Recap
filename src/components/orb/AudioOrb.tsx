"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

import { OrbMaterialImpl } from "./OrbMaterial";
import "./OrbMaterial"; // registers the material

interface AudioOrbProps {
  audioLevel?: number; // 0..1
  isActive?: boolean; // recording state
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  interactive?: boolean; // follow cursor
}

/**
 * The actual mesh — runs inside the Canvas.
 */
function OrbMesh({
  audioLevel,
  isActive,
  interactive,
  isMobile,
}: {
  audioLevel: number;
  isActive: boolean;
  interactive: boolean;
  isMobile: boolean;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<OrbMaterialImpl>(null);
  const { viewport, mouse } = useThree();

  // Aggressively smoothed audio — gentle response, no jumping
  const smoothedLevel = React.useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    smoothedLevel.current += (audioLevel - smoothedLevel.current) * 0.06;

    if (materialRef.current) {
      materialRef.current.uTime = t;
      materialRef.current.uAudioLevel = smoothedLevel.current;
      materialRef.current.uDistortion = isActive
        ? 0.32 + smoothedLevel.current * 0.18
        : 0.22;
    }

    if (meshRef.current) {
      // Cursor parallax (subtle) — disabled while recording
      if (interactive && !isActive) {
        const targetX = (mouse.x * viewport.width) / 18;
        const targetY = (mouse.y * viewport.height) / 18;
        meshRef.current.rotation.y +=
          (targetX - meshRef.current.rotation.y) * 0.04;
        meshRef.current.rotation.x +=
          (-targetY - meshRef.current.rotation.x) * 0.04;
      } else {
        // Halved rotation speed — slow, hypnotic
        meshRef.current.rotation.y = t * 0.075;
        meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.08;
      }

      // Calmer breathing — halved frequency and amplitude
      const breath = 1 + Math.sin(t * 0.4) * 0.012;
      meshRef.current.scale.setScalar(breath);
    }
  });

  // Lower poly on mobile — displacement hides the lower count
  const detail = isMobile ? 14 : 28;

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, detail]} />
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
  interactive = true,
}: AudioOrbProps) {
  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  return (
    <div
      className={`relative ${SIZE_MAP[size]} ${className}`}
    >
      {/*
        Canvas is absolutely positioned 20% outside on top/left/right so Bloom
        and glow have space to bleed without hard-clipping at the sphere edge.
        Bottom aligns with the container bottom (top:-20% + height:120% = 0 overflow
        downward) so the canvas never covers content below the orb.
      */}
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 50 }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        }}
        style={{
          position: "absolute",
          top: "-20%",
          left: "-20%",
          width: "140%",
          height: "120%",
          background: "transparent",
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#ff6b9d" />
        <pointLight position={[-5, -5, 5]} intensity={0.6} color="#7c5cff" />

        <OrbMesh
          audioLevel={audioLevel}
          isActive={isActive}
          interactive={interactive}
          isMobile={isMobile}
        />

        {/* multisampling=0: MSAA render targets don't support alpha channels,
            causing an opaque rectangle in transparent canvases.
            frameBufferType=HalfFloat: ensures FBOs preserve alpha properly. */}
        {isMobile ? (
          <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.65}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        ) : (
          <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
            {/* High threshold so only the brightest rim sheen blooms, not the whole orb */}
            <Bloom
              intensity={0.45}
              luminanceThreshold={0.65}
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
        )}
      </Canvas>

      {/* Soft halo behind the canvas — dimmed to match darker orb */}
      <div
        className="absolute inset-0 -z-10 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--accent) / ${
            0.10 + audioLevel * 0.15
          }) 0%, transparent 60%)`,
          filter: "blur(40px)",
          transform: `scale(${1 + audioLevel * 0.15})`,
          transition: "transform 0.1s linear",
        }}
      />
    </div>
  );
}
