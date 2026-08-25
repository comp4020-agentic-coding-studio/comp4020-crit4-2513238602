export interface NormalisedPoint {
  x: number;
  y: number;
}

export interface SoundParameters {
  frequency: number;
  brightness: number;
  gain: number;
  pan: number;
  noteIndex: number;
}

const PENTATONIC = [0, 2, 4, 7, 9] as const;
const NOTE_COUNT = 16;
const ROOT_MIDI = 45;
const KEYBOARD_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k"] as const;

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function noteIndexToMidi(noteIndex: number): number {
  const safeIndex = Math.round(clamp(noteIndex, 0, NOTE_COUNT - 1));
  const octave = Math.floor(safeIndex / PENTATONIC.length);
  const degree = PENTATONIC[safeIndex % PENTATONIC.length] ?? 0;
  return ROOT_MIDI + octave * 12 + degree;
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function mapPointToSound(point: NormalisedPoint): SoundParameters {
  const x = clamp(point.x);
  const y = clamp(point.y);
  const noteIndex = Math.round(x * (NOTE_COUNT - 1));

  return {
    frequency: midiToFrequency(noteIndexToMidi(noteIndex)),
    brightness: 620 + (1 - y) ** 1.45 * 4_900,
    gain: 0.075 + (1 - y) * 0.035,
    pan: x * 1.4 - 0.7,
    noteIndex,
  };
}

export function movementBrightness(normalisedDistancePerMs: number): number {
  return clamp(normalisedDistancePerMs * 22, 0, 1);
}

export function keyboardPoint(key: string): NormalisedPoint | null {
  const index = KEYBOARD_KEYS.indexOf(
    key.toLowerCase() as (typeof KEYBOARD_KEYS)[number],
  );
  if (index < 0) return null;

  return {
    x: index / (KEYBOARD_KEYS.length - 1),
    y: 0.5,
  };
}

export const instrumentKeyboardKeys = [...KEYBOARD_KEYS];
