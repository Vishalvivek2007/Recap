"use client";

import * as React from "react";
import * as THREE from "three";
import { extend, type ThreeElement } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "./shaders";

/**
 * Custom shader material that we can use declaratively in JSX as <orbMaterial />.
 */
export class OrbMaterialImpl extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAudioLevel: { value: 0 },
        uDistortion: { value: 0.22 },
      },
    });
  }

  get uTime() {
    return this.uniforms.uTime.value as number;
  }
  set uTime(v: number) {
    this.uniforms.uTime.value = v;
  }

  get uAudioLevel() {
    return this.uniforms.uAudioLevel.value as number;
  }
  set uAudioLevel(v: number) {
    this.uniforms.uAudioLevel.value = v;
  }

  get uDistortion() {
    return this.uniforms.uDistortion.value as number;
  }
  set uDistortion(v: number) {
    this.uniforms.uDistortion.value = v;
  }
}

extend({ OrbMaterial: OrbMaterialImpl });

declare module "@react-three/fiber" {
  interface ThreeElements {
    orbMaterial: ThreeElement<typeof OrbMaterialImpl>;
  }
}
