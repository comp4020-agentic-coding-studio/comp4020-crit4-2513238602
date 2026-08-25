# Ripple Garden

[![Checks and deploy](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-2513238602/actions/workflows/checks.yml/badge.svg)](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-2513238602/actions/workflows/checks.yml)

Ripple Garden is a browser instrument for COMP4020 C4. A player touches a dark
pool and shapes live synthesised sound through position, movement and duration.
There is no tune to reproduce, score to chase or wrong place to begin.

- [Play Ripple Garden](https://comp4020-agentic-coding-studio.github.io/comp4020-crit4-2513238602/)
- [Read the process evidence](PROCESS.md)
- [Read the C4 reflection](reflections/crit-4.md)

## Play

- **Touch or click** anywhere to begin a voice.
- **Hold and wander** to move through the pentatonic pool; across chooses pitch,
  depth changes colour, and faster movement brightens the sound.
- **Use A–K** to play the same range from a keyboard.
- **Use ↑ and ↓** to shift the keyboard voice between bright and deep.
- **Use several fingers or keys** to make chords.

The first player gesture creates and resumes the `AudioContext`, so the page is
silent until somebody plays. Voices share one bounded master chain, and every
oscillator is released even when a first tap ends while the context is waking.

## Design and implementation

The interface makes one promise on arrival — “Touch the water” — and places a
pulsing drop in the playable surface. The visual and sound mappings agree:
ripples appear where a voice begins and follow a moving gesture. A single input
model serves mouse, touch and keyboard, so each path produces the same musical
logic instead of becoming a separate mode.

The instrument uses plain HTML, CSS and strict TypeScript on Vite. Web Audio
oscillators feed a filtered voice envelope, stereo position, a restrained echo
and a compressed master output. Pure functions keep the pentatonic, colour,
gain and movement mappings testable without pretending that a test suite can
judge whether the result sounds good.

Accessibility and resilience include a labelled keyboard-focusable instrument,
visible focus, a skip link, semantic landmarks, reduced-motion support, safe
gain limits, a simultaneous-voice cap and responsive layouts for the course's
1920 × 1080 and 390 × 844 marking viewports.

## Run locally

```sh
pnpm install
pnpm dev
pnpm check
pnpm check:evidence
pnpm build
pnpm dlx linkinator ./dist --silent --skip "^https?://(?!localhost|127)"
```

`pnpm check` runs strict type checking, the production build, the starter
invariants, the C4 contracts and the music-mapping tests.
