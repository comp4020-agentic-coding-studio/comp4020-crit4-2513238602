# Process overview

## What I built

Ripple Garden turns a dark pool into a live browser instrument. Horizontal
position selects a pentatonic note, depth changes its colour, and movement adds
energy. Pointer, touch and keyboard players enter the same mapping while rings
make each voice visible. There is no score or fail state: the opening simply
invites a stranger to touch the water.

## The moments that mattered

### One mapping, not three control schemes

The obvious implementation was clickable pads, keyboard shortcuts, then touch
as a mobile fallback. That met an input checklist but made three different
instruments. I instead made every input produce the same normalised point and
kept its musical mapping in pure functions. Position, depth and movement now
retain their meaning across devices. Focused tests settle the mapping ranges
and boundaries, while the rendered surface states the controls a stranger can
use ([`dc9149b`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-2513238602/commit/dc9149b)).

### Treat the first tap as asynchronous

Driving the page made me inspect the shortest gesture rather than only holding
a note. On the first tap, `AudioContext.resume()` can still be pending when
pointer-up arrives; assuming resume would be fast could lose the sound or its
release. I added explicit `starting` and `pendingReleases` states, so an early
release becomes a short drop and every oscillator still stops. The rule also
went into `CLAUDE.md`. The strict build and 25 tests stayed green, while a
fresh-page click, keyboard play and mobile drag produced feedback without
browser errors
([`dc9149b...6ddcdf6`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit4-2513238602/compare/dc9149b...6ddcdf6)).

## Verification

At 1920 × 1080 and 390 × 844, the invitation stayed above the fold and neither
layout overflowed horizontally. Automated checks settled structure, input
wiring and safe parameter ranges. A separate human listening pass settled what
they cannot: first response, volume, timbre, movement and release all felt
acceptable without a tuning correction.
