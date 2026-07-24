import { snoise } from "./noise.glsl";

/**
 * Orb fragment shader.
 *
 * A holographic energy core that now reads as liquid glass without giving up
 * its identity. The body stays opaque (dark graphite), but we fake translucency
 * by refracting a procedural studio "HDRI" through it and reflecting that same
 * environment off the edges — both split into R/G/B by a chromatic-dispersion
 * offset, so the rim fringes like a prism and the interior glows with a tinted,
 * bent view of its surroundings. Layered on top: flowing internal energy veins
 * (domain-warped ridged noise), subtle thin-film iridescence biased to the
 * brand palette, a subsurface back-glow, a fresnel rim, and the click pulse.
 *
 * The environment lights slowly orbit, so reflections keep moving even when the
 * orb and camera are still. Bloom (postprocessing) makes the rim, veins and
 * highlights bleed, selling the "living light" look.
 */
export const orbFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3  uColorDeep;   // graphite body
uniform vec3  uColorBlue;
uniform vec3  uColorCyan;
uniform vec3  uColorViolet;
uniform float uFresnelPower;
uniform float uGlow;
uniform vec3  uPointer;        // pointer direction on the unit sphere (object space)
uniform float uPointerStrength;
uniform float uPointerVel;     // 0..1 smoothed cursor speed
uniform float uPulse;
uniform float uIor;         // index of refraction for the liquid-glass body
uniform float uDispersion;  // chromatic split between R/G/B samples
uniform float uEnvIntensity;

varying vec3  vWorldNormal;
varying vec3  vObjectNormal;
varying float vDisplacement;
varying vec3  vWorldPosition;

${snoise}

vec3 rotateY(vec3 v, float a){
  float c = cos(a), s = sin(a);
  return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
}

// The three orbiting studio lights, resolved once per fragment (they depend
// only on time, not on the sampled direction) and threaded through envColor.
struct StudioLights { vec3 key; vec3 rim; vec3 fill; };

StudioLights studioLights(){
  float a = uTime * 0.05;
  StudioLights L;
  L.key  = rotateY(normalize(vec3( 0.55, 0.72, 0.42)),  a);
  L.rim  = rotateY(normalize(vec3(-0.68, 0.28, -0.55)), a * 0.7);
  L.fill = rotateY(normalize(vec3( 0.15, -0.35, 0.85)), -a * 0.5);
  return L;
}

// Procedural studio environment: a cool vertical gradient plus three soft area
// lights (warm key, cyan rim, blue fill) that slowly orbit. Sampled by the
// reflection/refraction directions to light the orb — no HDRI asset needed.
vec3 envColor(vec3 dir, StudioLights L){
  float y = clamp(dir.y, -1.0, 1.0);

  vec3 zenith  = vec3(0.10, 0.16, 0.30);
  vec3 horizon = vec3(0.02, 0.03, 0.06);
  vec3 floorC  = vec3(0.004, 0.006, 0.012);
  vec3 sky = mix(horizon, zenith, smoothstep(-0.15, 0.85, y));
  sky = mix(floorC, sky, smoothstep(-0.55, -0.05, y));

  float key  = smoothstep(0.72, 1.0, dot(dir, L.key));
  float rim  = smoothstep(0.85, 1.0, dot(dir, L.rim));
  float fill = smoothstep(0.80, 1.0, dot(dir, L.fill));

  vec3 lights = vec3(1.0, 0.97, 0.92) * key * 1.7
              + uColorCyan             * rim  * 1.2
              + uColorBlue             * fill * 0.5;

  return (sky + lights) * uEnvIntensity;
}

// Reflection off the surface, split into R/G/B for a prismatic edge fringe.
vec3 sampleReflection(vec3 V, vec3 N, StudioLights L){
  vec3 r = reflect(-V, N);
  float d = uDispersion;
  return vec3(
    envColor(normalize(r + N * d), L).r,
    envColor(r, L).g,
    envColor(normalize(r - N * d), L).b
  );
}

// Refraction through the body, dispersed by a per-channel IOR — this is what
// makes the interior read as bent, tinted liquid glass.
vec3 sampleRefraction(vec3 V, vec3 N, StudioLights L){
  float d = uDispersion;
  return vec3(
    envColor(refract(-V, N, 1.0 / (uIor - d)), L).r,
    envColor(refract(-V, N, 1.0 /  uIor     ), L).g,
    envColor(refract(-V, N, 1.0 / (uIor + d)), L).b
  );
}

void main(){
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  StudioLights L = studioLights();

  float ndv   = clamp(dot(N, V), 0.0, 1.0);
  float fres  = pow(1.0 - ndv, uFresnelPower);
  float core  = pow(ndv, 1.4);

  // Flowing internal energy: domain-warped ridged noise in object space, so the
  // veins travel with the orb and never repeat. The sample domain is nudged
  // toward the pointer, so the internal energy visibly drifts to follow the
  // cursor while it hovers.
  vec3 flowP = vObjectNormal * 2.6 + uPointer * (0.4 * uPointerStrength);
  float flow  = flowNoise(flowP + vec3(0.0, 0.0, uTime * 0.18));
  float veins = ridged(flow);
  veins = smoothstep(0.25, 1.0, veins);

  // Environment reflection (edges) and refraction (interior).
  vec3 reflCol = sampleReflection(V, N, L);
  vec3 refrCol = sampleRefraction(V, N, L);

  // Liquid-glass body: graphite tinted by the bent environment, lit from within
  // by the energy veins, with a faint central depth glow.
  vec3 veinCol = mix(uColorCyan, uColorViolet, 0.5 + 0.5 * flow);
  vec3 body = mix(uColorDeep, refrCol, 0.46);
  body += veinCol * veins * (0.16 + core * 0.42) * (0.7 + 0.45 * uPointerStrength);
  body += uColorBlue * core * 0.10;

  // Holographic rim colour with a whisper of thin-film iridescence — kept
  // restrained so the rim stays brand-coloured rather than rainbow.
  float hue = fres * 1.3 + flow * 0.3 + vDisplacement * 1.0;
  vec3 holo = mix(uColorBlue, uColorCyan, smoothstep(0.0, 1.0, hue));
  holo = mix(holo, uColorViolet, smoothstep(0.6, 1.4, hue));
  vec3 iri = 0.5 + 0.5 * cos(6.2831853 * (hue * 0.5 + vec3(0.0, 0.33, 0.67)));
  holo = mix(holo, holo * (0.6 + iri), 0.16);

  // Edges reflect the studio environment and glow with the holographic rim;
  // the interior stays liquid body. Fresnel blends between them.
  vec3 color = mix(body, reflCol + holo * (0.4 + uGlow), fres);

  // Subsurface back-glow: a soft violet bleed where the body is thin.
  vec3 keyW = normalize(vec3(0.55, 0.72, 0.42));
  float sss = pow(clamp(dot(-V, keyW), 0.0, 1.0), 2.0) * (1.0 - fres);
  color += uColorViolet * sss * 0.12;

  // Rim glow, intensified on hover.
  color += holo * fres * uGlow * (1.0 + uPointerStrength * 0.6);

  // Light follows the cursor: a soft cyan bloom on the patch of surface facing
  // the pointer, brightening further with cursor speed.
  float faceP = max(dot(vObjectNormal, uPointer), 0.0);
  float cursorGlow = pow(faceP, 3.0) * uPointerStrength;
  color += uColorCyan * cursorGlow * 0.14 * (0.6 + uPointerVel);

  // Click pulse: a bright ring following the displacement crest.
  float pulseBand = smoothstep(0.05, 0.12, vDisplacement) * uPulse;
  color += uColorCyan * pulseBand * 1.2;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
