# Tickwise frontend

Next.js 15, App Router. Routes live in `src/app`; the shared design system
(Tailwind v4 tokens + shadcn/Radix components) lives in `src/components` and
`src/app/globals.css`.

- `npm run dev` — dev server
- `npm run build` / `npm start` — production
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint. Note: the repo carries pre-existing
  `prettier/prettier` formatting violations that predate the Next.js
  migration, so lint is deliberately **not** wired into `next build`.

Pages that need `useState`/`useEffect`/`motion` are split into a server
`page.tsx` (which owns the `metadata` export) plus a `"use client"` view
component beside it, so every route keeps real server-rendered metadata.

> [!IMPORTANT]
> This branch is a **Next.js** app and can no longer be edited in the Lovable
> editor, which expects the original Vite + TanStack Start project. The
> pre-migration Vite app remains on `main`.

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
