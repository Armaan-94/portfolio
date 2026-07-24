import { snoise } from "./noise.glsl";

/**
 * Orb vertex shader.
 *
 * Displaces a high-density icosahedron along its normal so the surface morphs
 * forever ("living object"). The displacement is built from:
 *   - a domain-warped fbm base (slow, folding, liquid undulation),
 *   - a fine high-frequency detail layer (so the surface never visibly repeats),
 *   - a slow breathing pulse,
 *   - a directional swell toward the pointer (liquid disturbance),
 *   - an outward ripple on click (uPulse).
 *
 * Normals are recomputed by finite differences (sampling two tangent
 * neighbours) so lighting, fresnel and reflections track the deformed surface,
 * not the original sphere. A world-space normal (for environment reflection and
 * refraction sampling) and world position are passed on, along with the
 * displacement magnitude and the object-space normal for internal energy.
 */
export const orbVertexShader = /* glsl */ `
uniform float uTime;
uniform vec3  uPointer;        // pointer direction on the unit sphere (object space)
uniform float uPointerStrength;// 0..1 hover influence
uniform float uPointerVel;     // 0..1 smoothed cursor speed
uniform float uPulse;          // 0..1 click ripple, decays over time
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uSpeed;
uniform float uDetail;         // amplitude of the fine surface-shimmer layer

varying vec3  vWorldNormal;
varying vec3  vObjectNormal;
varying float vDisplacement;
varying vec3  vWorldPosition;

${snoise}

// Total radial displacement for a given point on the unit sphere.
float computeDisplacement(vec3 p){
  float t = uTime * uSpeed;
  vec3 n = normalize(p);

  // Domain warp: nudge the sample position by a cheap 2-octave field so the
  // main undulation folds and drifts instead of pulsing in place.
  vec3 warp = vec3(
    fbm2(p * 0.9 + vec3(0.0, 0.0, t)),
    fbm2(p * 0.9 + vec3(3.1, 1.7, t)),
    fbm2(p * 0.9 + vec3(7.4, 2.3, t))
  );
  float base = fbm(p * uNoiseFreq + 0.45 * warp + vec3(0.0, 0.0, t));

  // Fine shimmer: high-frequency, low-amplitude ripples that keep the surface
  // alive up close and stop the silhouette from ever looking static.
  float fine = snoise(p * (uNoiseFreq * 4.7) + vec3(0.0, t * 1.6, 0.0)) * uDetail;

  // Slow breathing.
  float breathe = sin(uTime * 0.5) * 0.06;

  // Liquid swell toward the pointer: strongest where p faces the pointer.
  // Cursor speed makes the swell push a little harder — like a hand through water.
  float towardPointer = max(dot(n, uPointer), 0.0);
  float swell = pow(towardPointer, 3.0) * uPointerStrength * 0.35 * (1.0 + uPointerVel * 0.6);

  // Angular distance from the pointer, shared by both ripple bands.
  float ang = acos(clamp(dot(n, uPointer), -1.0, 1.0));

  // Outward click ripple: a travelling band based on angular distance.
  float ripple = sin(ang * 6.0 - uTime * 6.0) * uPulse * 0.18 * smoothstep(1.0, 0.0, ang);

  // Wake ripple: faster, finer concentric waves that only appear while the
  // cursor is actually moving, radiating from the point under the pointer.
  float wake = sin(ang * 11.0 - uTime * 9.0) * uPointerVel * 0.05 * smoothstep(1.3, 0.0, ang);

  return base * uNoiseAmp + fine + breathe + swell + ripple + wake;
}

vec3 displacedPosition(vec3 p){
  return p + normalize(p) * computeDisplacement(p);
}

void main(){
  vObjectNormal = normalize(position);

  // Finite-difference normal: build a tangent basis and sample neighbours.
  vec3 tangent = normalize(cross(vObjectNormal, vec3(0.0, 1.0, 0.0) + vec3(0.001)));
  vec3 bitangent = normalize(cross(vObjectNormal, tangent));
  float eps = 0.01;

  vec3 displaced = displacedPosition(position);
  vec3 posA = displacedPosition(position + tangent * eps);
  vec3 posB = displacedPosition(position + bitangent * eps);

  vec3 newNormal = normalize(cross(posA - displaced, posB - displaced));
  // Keep normals pointing outward.
  if (dot(newNormal, vObjectNormal) < 0.0) newNormal = -newNormal;

  vDisplacement = computeDisplacement(position);

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = worldPos.xyz;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  // World-space normal for stable environment reflections (orb only rotates
  // and scales uniformly, so mat3(modelMatrix) + normalize is exact).
  vWorldNormal = normalize(mat3(modelMatrix) * newNormal);

  gl_Position = projectionMatrix * mvPosition;
}
`;
