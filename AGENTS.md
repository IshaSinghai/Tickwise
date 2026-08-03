# Tickwise frontend

Next.js 15, App Router. Routes live in `src/app`; the shared design system
(Tailwind v4 tokens + shadcn/Radix components) lives in `src/components` and
`src/app/globals.css`.

- `npm run dev` — dev server
- `npm run build` / `npm start` — production
- `npm run build:check` — compile check that writes to `.next-verify`
- `npm run typecheck` — `tsc --noEmit`
- `npm run e2e` — Playwright suite (builds into `.next-e2e`)

> [!IMPORTANT]
> **Never run `npm run build` while a dev server is running.** `next build` and
> `next dev` write the same `.next` directory and put incompatible things in it.
> The dev server then holds references to manifests and chunks the build replaced,
> and fails with `Cannot read properties of undefined (reading 'call')`,
> `Cannot find module './NNNN.js'`, or
> `Expected clientReferenceManifest to be defined` — or serves pages with no CSS.
> None of these are app bugs, and the fix is always: stop the servers,
> `rm -rf .next`, restart.
>
> Use `npm run build:check` to verify a build instead; it and the Playwright
> harness write to their own directories (`.next-verify`, `.next-e2e`) via the
> `NEXT_DIST_DIR` override in `next.config.ts`, so both are safe to run alongside
> `npm run dev`.
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

## Branches

| Branch | Stack | Role |
| --- | --- | --- |
| `main` | Vite + TanStack Start | **Lovable's connected branch.** Design source of truth. Never hand-edit; never merge Next.js into it. |
| `develop` | Next.js | Where development happens, and where Lovable design changes are merged in. |
| `qa` | Next.js | QA validates here and deploys from here. Keep it holding still while QA reviews. |

Releases are marked with tags rather than a `production` branch — a branch that
only ever fast-forwards from `qa` stores nothing a tag doesn't, and a tag names
the exact deployed commit for rollback.

```sh
git tag -a v0.1.0 -m "QA approved 2026-07-31"
git push origin v0.1.0
```

> [!NOTE]
> `qa` is both the QA and the production state. That is fine pre-launch. Once
> customers are live you will want QA on cycle N+1 while production stays on
> cycle N — at that point add a `production` branch, because one branch can
> only ever represent one deployed state.

## Development cycle

```
Lovable edits main ──┐
                     ├──> develop ──> qa ──> deploy + tag
your work ───────────┘
```

1. Merge any new Lovable design forward (see below).
2. Do your work on `develop`.
3. When the cycle is done: `git checkout qa && git merge develop`.
4. QA validates `qa`; on approval, deploy and tag.

## Merging Lovable design changes into `develop`

The design layer is deliberately near-identical between the two stacks — only
~200 lines differ across the 60 shared files in `src/components`, and 50 of
those differ by just the `"use client"` line. Every route file was moved with
`git mv`, so git's rename detection carries page-level design edits from
`src/routes/*.tsx` across into `src/app/**` automatically.

```sh
git fetch origin
git checkout develop
git merge origin/main
```

Rules that keep this cheap:

- **Never hand-edit design files on `develop`.** All UI changes go through
  Lovable on `main`, then merge forward. Editing both sides erodes the file
  similarity that rename detection depends on, and it fails *silently* — page
  edits simply stop arriving.
- **Merge after every Lovable session, not in big batches.** Frequent small
  merges keep rename detection healthy.

Conflicts, when they happen, are almost always the import block — keep the
`"use client"` line and `next/link`, take Lovable's other imports. Two other
shapes to expect:

- *modify/delete* — Lovable removed a component you only touched to add
  `"use client"`. Accept the deletion (`git rm`).
- A **new route** on `main` lands in `src/routes/` and Next ignores it; add the
  matching `src/app/<path>/page.tsx` by hand.

After any merge from `main`, always run:

```sh
npx tsc --noEmit && npm run build
```

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
