# Contributing

This is a personal portfolio, but issues and PRs (typo fixes, accessibility
improvements, bug reports) are welcome.

## Getting set up

```bash
npm install
npm run dev        # http://localhost:3000
```

Requires Node `>=20` (see `.nvmrc` — run `nvm use` if you use nvm).

## Before you open a PR

Run the same checks CI runs:

```bash
npm run lint
npm run typecheck
npm run build
```

All three must pass. If you've adopted Prettier locally, also run
`npm run format`.

## Conventions

- **Content lives in `src/content.ts`.** Copy, projects, links, and numbers are
  edited there, not hard-coded in components.
- **Themes** live in `src/themes/<id>/` and render the same `src/content.ts`
  in their own way. Each is a static route under `src/app/<id>/`, and every
  theme must render the seven section ids listed in `src/themes/contract.ts`;
  a dev-only assertion reports any that are missing.
- **Generated imagery** uses Cloudflare Workers AI via `npm run gen:image`.
  Run `npm run gen:image -- --list` for models and presets. It needs
  `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in `.env.local`, with the
  token scoped to `Account | Workers AI | Read` and nothing else. Pass a
  `--seed` for anything committed, so the asset can be regenerated exactly.
- **The ASCII portrait** is generated from `public/portrait.jpg`. After
  replacing that photo, run `npm run ascii` and commit the regenerated
  `src/data/ascii-portrait.json`. `npm run ascii -- --preview` prints it to
  the terminal for tuning, and the crop and tone constants can be overridden
  with environment variables (see the top of the script).
- **Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`) — this keeps history and the
  changelog readable.
- **The 3D engine** (`src/three/`) has its own rules and design notes in
  `src/three/README.md`; read it before touching shaders or the render loop.
- **Motion & accessibility:** anything animated must degrade gracefully under
  `prefers-reduced-motion`, and text must stay legible.

## Scope of changes

Keep PRs focused and small. For anything that changes the visual design
substantially, open an issue first so we can align before you build.
