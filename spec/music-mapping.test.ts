import { describe, expect, it } from "vitest";
import {
  instrumentKeyboardKeys,
  keyboardPoint,
  mapPointToSound,
  movementBrightness,
  noteIndexToMidi,
} from "../src/music-mapping.ts";

describe("expressive music mapping", () => {
  it("moves left to right through an ascending pentatonic range", () => {
    const notes = Array.from({ length: 16 }, (_, index) => noteIndexToMidi(index));
    expect(notes).toEqual([...notes].sort((a, b) => a - b));
    expect(new Set(notes).size).toBe(16);
    expect(notes.at(-1)! - notes[0]!).toBeGreaterThanOrEqual(30);
  });

  it("uses depth to change colour while keeping safe output values", () => {
    const bright = mapPointToSound({ x: 0.5, y: 0 });
    const deep = mapPointToSound({ x: 0.5, y: 1 });
    expect(bright.brightness).toBeGreaterThan(deep.brightness);
    expect(bright.gain).toBeLessThanOrEqual(0.12);
    expect(deep.gain).toBeGreaterThan(0);
    expect(bright.frequency).toBe(deep.frequency);
  });

  it("clamps positions and movement at the instrument boundary", () => {
    expect(mapPointToSound({ x: -10, y: 10 }).pan).toBeCloseTo(-0.7);
    expect(mapPointToSound({ x: 10, y: -10 }).pan).toBeCloseTo(0.7);
    expect(movementBrightness(-1)).toBe(0);
    expect(movementBrightness(99)).toBe(1);
  });

  it("maps every visible letter key across the whole surface", () => {
    const points = instrumentKeyboardKeys.map((key) => keyboardPoint(key));
    expect(points.every(Boolean)).toBe(true);
    expect(points[0]?.x).toBe(0);
    expect(points.at(-1)?.x).toBe(1);
    expect(keyboardPoint("z")).toBeNull();
  });
});
