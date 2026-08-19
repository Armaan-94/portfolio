# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims
to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Traveling orb: the WebGL layer becomes a fixed viewport-height layer so the
  orb persists past the hero, shrinking and drifting to the margin as you
  scroll, with its palette drifting per section. Gated to mid/high tier with
  full motion; reduced motion and every touch device keep the previous
  hero-only behavior.
- Runtime FPS governor that ratchets quality down (dpr, particle draw range,
  bloom) when frames get expensive, on top of the existing device-tier
  heuristic.
- Scroll-driven CSS behind `@supports`: a reading-progress hairline on the nav
  and section rules that draw themselves in.
- Staggered cascade on the LeetCode heatmap.
- Cursor spotlights on the Skills and Experience cards, and hover lift on chips.
- CSS fallback for the canvas: shown while the Three.js chunk loads, when WebGL
  is unavailable, and if the GL context is lost.
- Optional `blur`, `scale`, `variant` and `duration` props on `Reveal`.
- Repository engineering: CI (lint / type-check / build), CodeQL, Dependabot,
  community health files, `.editorconfig`, `.gitattributes`, formatting config,
  and this changelog.

### Changed

- Résumé PDF and site content updated to the latest résumé: CGPA 8.77,
  Biocipher tenure through Aug 2026, expanded Biocipher bullets, and an AI
  Tools skill group.

### Fixed

- `SpotlightCard` no longer calls `getBoundingClientRect` on every pointer
  move; the box is cached and invalidated on scroll and resize.
- The orb releases hover and restores the cursor when it travels out of the
  hero. Previously, if it moved out from under a stationary cursor no
  `pointerout` fired, so the pointer cursor stuck for the rest of the session.

## [0.1.0] - 2026-07-24

### Added

- Immersive WebGL hero (React Three Fiber): liquid-glass shader orb with
  procedural refraction/reflection and chromatic dispersion, cursor-reactive
  camera and interaction, layered particle atmosphere (starfield, dust,
  orbital), cinematic scroll, and device-tier quality scaling.
- Premium glass and magnetic buttons, cursor-spotlight project cards, hero
  parallax; full `prefers-reduced-motion` support.
- Working contact form backed by a `/api/contact` route (Resend) with
  server-side validation and a honeypot.
- About-section portrait and downloadable resume.

[Unreleased]: https://github.com/Armaan-94/portfolio/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Armaan-94/portfolio/releases/tag/v0.1.0
