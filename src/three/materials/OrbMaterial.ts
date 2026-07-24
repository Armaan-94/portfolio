import * as THREE from "three";
import { orbVertexShader } from "../shaders/orb/vertex.glsl";
import { orbFragmentShader } from "../shaders/orb/fragment.glsl";

/**
 * Uniform names shared between the material factory and the Orb component.
 * Centralised so the render loop updates the exact keys the shader reads.
 */
export type OrbUniforms = {
  uTime: { value: number };
  uPointer: { value: THREE.Vector3 };
  uPointerStrength: { value: number };
  uPointerVel: { value: number };
  uPulse: { value: number };
  uNoiseFreq: { value: number };
  uNoiseAmp: { value: number };
  uSpeed: { value: number };
  uDetail: { value: number };
  uColorDeep: { value: THREE.Color };
  uColorBlue: { value: THREE.Color };
  uColorCyan: { value: THREE.Color };
  uColorViolet: { value: THREE.Color };
  uFresnelPower: { value: number };
  uGlow: { value: number };
  uIor: { value: number };
  uDispersion: { value: number };
  uEnvIntensity: { value: number };
};

/** Brand palette, tuned for the holographic core. Softened to a calmer, more
 *  unified cool scheme (gentle aqua + periwinkle rather than electric cyan and
 *  magenta) so the orb soothes and the name reads clearly over it. */
export const ORB_COLORS = {
  deep: "#0a0f1e",
  blue: "#6366f1",
  cyan: "#4bc7e6",
  violet: "#9aa6f5",
} as const;

export function createOrbUniforms(): OrbUniforms {
  return {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector3(0, 0, 1) },
    uPointerStrength: { value: 0 },
    uPointerVel: { value: 0 },
    uPulse: { value: 0 },
    uNoiseFreq: { value: 1.15 },
    uNoiseAmp: { value: 0.28 },
    uSpeed: { value: 0.3 },
    uDetail: { value: 0.02 },
    uColorDeep: { value: new THREE.Color(ORB_COLORS.deep) },
    uColorBlue: { value: new THREE.Color(ORB_COLORS.blue) },
    uColorCyan: { value: new THREE.Color(ORB_COLORS.cyan) },
    uColorViolet: { value: new THREE.Color(ORB_COLORS.violet) },
    uFresnelPower: { value: 2.6 },
    uGlow: { value: 0.5 },
    uIor: { value: 1.18 },
    uDispersion: { value: 0.015 },
    uEnvIntensity: { value: 0.95 },
  };
}

export function createOrbMaterial(uniforms: OrbUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: orbVertexShader,
    fragmentShader: orbFragmentShader,
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
  });
}
