# Homesphere

Your one-stop solution for real estate — property listings, tenancy management,
inspections, wallets, and messaging, built on Next.js.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui (Radix primitives)
- **Fonts:** [Manrope](https://fonts.google.com/specimen/Manrope) (primary) and
  [Figtree](https://fonts.google.com/specimen/Figtree) (secondary), loaded via
  `next/font/google`
- **Data:** Supabase (Postgres, Auth, Storage)
- **State/data-fetching:** TanStack Query, Zustand
- **Forms:** React Hook Form + Zod
- **Package manager:** [Bun](https://bun.sh)
- **Linting/formatting:** [Biome](https://biomejs.dev) (formatting + most linting)
  and ESLint (`eslint-config-next`, for Next.js/React-Compiler-specific rules)
- **Git hooks:** Husky + lint-staged

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app. The page
auto-updates as you edit files under `src/app`.

Copy `.env.example` to `.env.local` (if present) and fill in your Supabase,
Mapbox, and payment provider credentials before running the app.

## Scripts

| Script              | What it does                                                  |
| -------------------- | -------------------------------------------------------------- |
| `bun dev`             | Start the dev server                                            |
| `bun run build`       | Production build                                                |
| `bun run start`       | Start the production server                                     |
| `bun run lint`        | Check formatting/lint issues with Biome, then run ESLint        |
| `bun run lint:fix`    | Auto-fix what Biome and ESLint can fix                          |
| `bun run format`      | Format all files with Biome                                     |
| `bun run typecheck`   | Run `tsc --noEmit`                                               |
| `bun run validate`    | Run lint, typecheck, and build — use this before pushing/in CI  |
| `bun run test`        | Run the Jest test suite                                         |

## Linting & formatting

This project uses **Biome** for formatting and the bulk of linting (including
Tailwind class sorting), and **ESLint** on top for the Next.js/React-Compiler
rules Biome doesn't know about (`eslint-config-next`). This split is why
`lint`/`lint:fix` run both tools.

A few accessibility and legacy-code rules are currently set to `warn` rather
than `error` in `biome.json` so the existing codebase can be cleaned up
incrementally without blocking `bun run validate`. New code should aim to
avoid triggering them (proper `<label htmlFor>` associations, explicit
`type="button"` on non-submit buttons, stable React keys instead of array
indices, etc.).

## Git hooks

Husky runs `lint-staged` on `pre-commit`, which formats and lints only the
files you've staged (via Biome and ESLint) so commits stay clean without
paying the cost of a full-repo check every time.

## Brand

- **Brand color:** `#1b5e40` (`--color-brand` in `src/app/globals.css`, with
  `--color-brand-light` / `--color-brand-dark` variants for hover/accent states)
- **Fonts:** Manrope (`font-primary`) for headings/UI, Figtree (`font-secondary`)
  for body copy — both available as Tailwind utility classes

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Biome Documentation](https://biomejs.dev/guides/getting-started/)
- [Supabase Documentation](https://supabase.com/docs)
