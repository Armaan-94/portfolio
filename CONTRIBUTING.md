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
