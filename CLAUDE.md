# COMP4020 prototype

## Ripple Garden contracts

- Sound is synthesised live with one lazily-created `AudioContext`; never add a
  backing track or start audio before a player gesture.
- Pointer, touch and keyboard are equal input paths into the same music
  mapping. A change for one path must not leave the others behind.
- Keep every output gain bounded, cap simultaneous voices, and release every
  oscillator. Fast or multi-touch play must stay safe.
- Keep music mappings as pure functions in `src/music-mapping.ts` so their
  ranges and boundaries remain mechanically checkable.
- TypeScript named callbacks do not retain an outer `querySelector` narrowing.
  After a shared DOM guard, rebind the nodes to non-null constants; do not use
  non-null assertions to silence the compiler.
- Sound quality, latency and expressive feel require a human listening pass.
  Green checks cannot settle those claims.

Your starter repo for a COMP4020 prototype: a static site in HTML/CSS/TypeScript
that builds to plain HTML/CSS/JS and deploys to GitHub Pages. The deployed site
is what gets marked, not this repo.

The
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name tells you
which deliverable applies. Read both before you plan or build.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Run `pnpm check` before you push.
- Open the page in a browser and look at it. The rendered page is the truth;
  your mental model of it isn't.
- When a check fails, read its output before you change anything.
- Never commit a red state.

## The link-preview card

`public/card.png` (1200x630) is the image a shared link shows; `index.html`'s
head points at it. Replace it and the `description` meta, and copy the head
block into any new page. The card URL resolves against the page that names it,
like any link --- `./card.png` is wrong one directory down, and nothing in CI
checks it, so look at the deployed head when you add pages.

## The checks

`pnpm check` runs them (`pnpm check:evidence` is the extra gate before you
ship); CI runs the same plus links, secrets and the deploy. Read the failure.

`spec/README.md`, `PROCESS.md` and `reflections/README.md` are in this repo and
say what they are for.

## This file is yours

A starting point, not a rulebook. As you learn what your prototype needs --- a
convention the work has to hold to, a sensor that keeps catching you out (a
linter, say), a fact about the stack that is easy to get wrong --- write it down
here and wire it into `check`. Growing this file is the work.
