/**
 * Particle shaders for the atmospheric layers.
 *
 * All three systems draw GL_POINTS as soft round sprites and share one
 * fragment program; only their vertex motion differs:
 *   - dust      : slow organic drift + screen-space cursor repel (fast cursor
 *                 movement shoves nearby motes away),
 *   - starfield : near-static distant shell that twinkles,
 *   - orbital   : particles circling the orb that pull inward and brighten
 *                 while the orb is hovered.
 *
 * Sizes attenuate with view depth; alpha fades with depth so far particles read
 * as atmosphere rather than confetti. Rendered additively on a transparent
 * canvas, so they only ever add light to the dark page.
 */

// Shared fragment: soft circular falloff, colour lerped per-particle by vTint.
export const particleFragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vAlpha;
varying float vTint;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  if (a <= 0.001) discard;
  vec3 col = mix(uColorA, uColorB, vTint);
  gl_FragColor = vec4(col, a * vAlpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// Drifting dust with screen-space cursor repel.
export const dustVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2  uPointer;      // cursor in NDC
uniform float uAspect;       // viewport width / height
uniform float uVelocity;     // 0..1 cursor speed
uniform float uSize;         // base point size in px
uniform float uPixelRatio;
uniform float uRepelRadius;  // NDC radius of influence
uniform float uRepelStrength;

attribute float aScale;
attribute float aSeed;
attribute float aSpeed;

varying float vAlpha;
varying float vTint;

void main(){
  // Slow organic drift around the seeded home position.
  float t = uTime * 0.05 * (0.6 + aSpeed);
  vec3 pos = position;
  pos.x += sin(t + aSeed * 6.2831) * 0.25;
  pos.y += cos(t * 0.9 + aSeed * 5.1) * 0.25;
  pos.z += sin(t * 1.1 + aSeed * 3.3) * 0.25;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  // Screen-space repel: push motes away from a fast-moving cursor.
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
  float dist = length(d);
  float push = smoothstep(uRepelRadius, 0.0, dist) * uVelocity * uRepelStrength;
  vec2 away = dist > 0.0001 ? normalize(d) : vec2(0.0);
  mv.xy += away * push;

  gl_Position = projectionMatrix * mv;

  float viewDist = max(-mv.z, 0.001);
  gl_PointSize = min(uSize * aScale * uPixelRatio / viewDist, 48.0);

  float depthFade = smoothstep(60.0, 4.0, viewDist);
  vAlpha = depthFade * (0.14 + 0.42 * aScale);
  vTint = fract(aSeed * 3.17);
}
`;

// Distant twinkling shell (the whole Points object slowly rotates in JS).
export const starVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uAssemble;     // 0 = scattered shell, 1 = wordmark
uniform vec3  uWordCenter;   // world-space centre of the wordmark
uniform vec2  uWordScale;    // world width / height to scale aWord into

attribute float aScale;
attribute float aSeed;
attribute vec2  aWord;       // normalised position within the wordmark

varying float vAlpha;
varying float vTint;

void main(){
  vec3 pos = position;

  // Load moment: pull each star toward its slot in the wordmark. Per-particle
  // easing (aSeed) staggers arrival so the shape resolves rather than snapping.
  // Zero cost once uAssemble is 0, which is every frame after the intro.
  if (uAssemble > 0.0) {
    float lead = clamp(uAssemble * (1.25 + aSeed * 0.5), 0.0, 1.0);
    float k = lead * lead * (3.0 - 2.0 * lead);
    vec3 target = uWordCenter + vec3(aWord.x * uWordScale.x,
                                     aWord.y * uWordScale.y, 0.0);
    pos = mix(pos, target, k);
  }

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float viewDist = max(-mv.z, 0.001);
  // Cap tightens as they assemble: up close the shell's cap would blow each
  // star into a blob and the lettering would be unreadable.
  float cap = mix(24.0, 5.5, uAssemble);
  gl_PointSize = min(uSize * aScale * uPixelRatio / viewDist, cap);

  float twinkle = 0.5 + 0.5 * sin(uTime * (0.4 + aSeed) + aSeed * 6.2831);
  vAlpha = mix((0.22 + 0.5 * twinkle) * aScale, 0.95, uAssemble);
  vTint = fract(aSeed * 2.13);
}
`;

// Orbital particles: each rides a great-circle around the orb defined by an
// orthonormal (aU, aV) basis, pulling inward and brightening on hover.
export const orbitalVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uAttract;   // 0..1 hover pull
uniform float uPulse;     // 0..1 click energy

attribute vec3  aU;
attribute vec3  aV;
attribute float aRadius;
attribute float aSpeed;
attribute float aPhase;
attribute float aScale;
attribute float aSeed;

varying float vAlpha;
varying float vTint;

void main(){
  float ang = uTime * aSpeed + aPhase;
  float r = aRadius * (1.0 - 0.12 * uAttract + 0.05 * uPulse);
  vec3 pos = (cos(ang) * aU + sin(ang) * aV) * r;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float viewDist = max(-mv.z, 0.001);
  gl_PointSize = min(uSize * aScale * uPixelRatio / viewDist * (1.0 + 0.6 * uAttract), 40.0);

  vAlpha = (0.35 + 0.65 * uAttract) * aScale + 0.4 * uPulse;
  vTint = fract(aSeed * 1.71);
}
`;
