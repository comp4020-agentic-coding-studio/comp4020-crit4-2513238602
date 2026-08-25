# C4 reflection

The breakthrough was treating Ripple Garden as one relationship between gesture,
image and sound rather than as a collection of controls. At first, mouse, touch
and keyboard looked like three implementation tasks. Normalising all three into
the same point made the instrument coherent: moving across the pool always means
pitch, moving down always softens the colour, and movement always adds energy.
That decision also gave the tests an honest job. They can prove that the mappings
stay in a pentatonic range, that gain remains bounded and that every input path is
wired, without pretending to prove that the instrument is enjoyable.

This work changed my picture of the developer I want to become by making the
boundary between automated evidence and human judgement concrete. The most
important bug was not a wrong note in a unit test, but the timing of a real first
tap while the browser was still waking its audio context. Browser interaction
exposed that boundary; explicit start-and-release state corrected it. After the
checks and viewport passes were green, a human still had to listen for latency,
harshness, fatigue and stuck sound. I want to build systems where each question
goes to the right judge: types and tests for contracts, the browser for rendered
behaviour, and people for whether the experience is actually worth having.
