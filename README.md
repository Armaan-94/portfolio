# Armaan Punia — Portfolio

A dark-first, editorial single-page portfolio built with Next.js (App Router),
TypeScript, Tailwind CSS v4, and Framer Motion (`motion`). Deploy-ready for Vercel.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-based theme tokens in `src/app/globals.css`)
- **motion** (Framer Motion) for scroll reveals and micro-interactions
- **next/font** for self-hosted Sora + JetBrains Mono (no font CDN)
- Generated favicon and Open Graph image via `next/og` (no external assets)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

```bash
npm run build   # production build + typecheck
npm run start   # serve the production build
npm run lint    # eslint
```

## Editing content

All copy lives in one file: **`src/content.ts`**.
Edit your profile text, experience, projects, skills, LeetCode numbers, and links
there. Nothing is hard-coded inside components. House style: no em-dashes in copy.

## Project structure

```
src/
  app/
    layout.tsx            # fonts, metadata, OG/SEO, viewport
    page.tsx              # section assembly
    globals.css           # brand tokens + base styles
    icon.tsx              # generated "AP" favicon
    opengraph-image.tsx   # generated 1200x630 social image
  components/              # Nav, Hero, About, Experience, Projects,
                           # Skills, CodingActivity, Contact, Footer, + primitives
  content.ts               # ALL editable content
```

## What you need to supply

1. **Resume PDF** — drop your file at `public/Armaan-Punia-Resume.pdf`.
   The "Resume" button in the nav links to `/Armaan-Punia-Resume.pdf`
   (path set in `src/content.ts` → `profile.resume`). Until you add it, that
   button 404s.
2. **Portrait image (optional)** — the About section shows a styled "AP"
   placeholder. To use a real photo, drop it in `public/` (e.g.
   `public/portrait.jpg`) and swap the placeholder block in
   `src/components/About.tsx` for a `next/image` `<Image>`.
3. **Site URL** — update `siteUrl` in `src/app/layout.tsx` once you know your
   Vercel domain (used for canonical + OG tags).

## Contact form

The contact form composes a `mailto:` to your address and opens the visitor's
mail client. No backend, nothing stored. To capture messages to an inbox instead,
wire a service such as Formspree, Resend, or a Next.js Route Handler / Server
Action, then replace the `onSubmit` handler in `src/components/Contact.tsx`.

## LeetCode heatmap

The green heatmap is **illustrative**, generated deterministically to land near
the real ~173 active days (see `src/components/CodingActivity.tsx`). The headline
numbers (197 solved, 167 easy, 30 medium, 173 active days) are your real figures
from `src/content.ts`. To render exact per-day data, feed the LeetCode API/export
into the `cells` array.

## Accessibility & performance

- Semantic landmarks, ordered headings, labeled form controls, visible focus rings
- `prefers-reduced-motion` disables non-essential animation
- Self-hosted fonts, generated (not remote) images, minimal client JS

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to https://vercel.com/new and import the repo.
3. Framework preset auto-detects **Next.js**. No env vars required.
4. Deploy. Then set `siteUrl` in `src/app/layout.tsx` to the assigned domain and
   redeploy so OG/canonical tags are correct.

Alternatively, from the CLI:

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```
