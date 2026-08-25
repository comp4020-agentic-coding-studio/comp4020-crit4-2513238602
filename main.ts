import { RippleAudioEngine } from "./src/audio-engine.ts";
import {
  keyboardPoint,
  mapPointToSound,
  movementBrightness,
  type NormalisedPoint,
} from "./src/music-mapping.ts";

const surface = document.querySelector<HTMLElement>("#instrument");
const rippleLayer = document.querySelector<HTMLElement>("#ripple-layer");
const audioStatus = document.querySelector<HTMLOutputElement>("#audio-status");

if (!surface || !rippleLayer || !audioStatus) {
  throw new Error("Ripple Garden could not find its instrument surface.");
}

// Named callbacks do not retain the outer querySelector narrowing. Rebinding
// after the guard makes the non-null contract structural instead of asserted.
const instrumentSurface = surface;
const visualLayer = rippleLayer;
const statusOutput = audioStatus;

const audio = new RippleAudioEngine();
const activePointers = new Map<number, PointerTrail>();
const heldKeys = new Set<string>();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let keyboardDepth = 0.5;
let hasAwoken = false;

interface PointerTrail {
  point: NormalisedPoint;
  time: number;
  lastRippleTime: number;
}

function wakeWater(): void {
  if (hasAwoken) return;
  hasAwoken = true;
  instrumentSurface.classList.add("is-awake");
  statusOutput.value = "The water is awake. Move to shape the sound.";
}

function pointFromEvent(event: PointerEvent): NormalisedPoint {
  const rect = instrumentSurface.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / Math.max(rect.width, 1),
    y: (event.clientY - rect.top) / Math.max(rect.height, 1),
  };
}

function addRipple(point: NormalisedPoint, energy = 0.5): void {
  const ripple = document.createElement("span");
  const safeEnergy = Math.min(1, Math.max(0, energy));
  const hue = 166 + point.x * 48 - point.y * 18;

  ripple.className = "ripple";
  ripple.style.left = `${Math.min(1, Math.max(0, point.x)) * 100}%`;
  ripple.style.top = `${Math.min(1, Math.max(0, point.y)) * 100}%`;
  ripple.style.setProperty("--ripple-hue", `${hue}deg`);
  ripple.style.setProperty("--ripple-size", `${2 + safeEnergy * 2.8}rem`);
  ripple.style.setProperty("--ripple-duration", reduceMotion ? "1ms" : `${1250 + point.y * 500}ms`);
  visualLayer.append(ripple);

  window.setTimeout(() => ripple.remove(), reduceMotion ? 40 : 1900);
}

function playPointer(event: PointerEvent): void {
  event.preventDefault();
  instrumentSurface.focus({ preventScroll: true });
  instrumentSurface.setPointerCapture(event.pointerId);

  const point = pointFromEvent(event);
  const now = performance.now();
  activePointers.set(event.pointerId, { point, time: now, lastRippleTime: now });
  addRipple(point, event.pressure || 0.55);
  wakeWater();

  void audio.startVoice(`pointer:${event.pointerId}`, mapPointToSound(point));
}

function movePointer(event: PointerEvent): void {
  const previous = activePointers.get(event.pointerId);
  if (!previous) return;

  event.preventDefault();
  const point = pointFromEvent(event);
  const now = performance.now();
  const elapsed = Math.max(now - previous.time, 1);
  const distance = Math.hypot(point.x - previous.point.x, point.y - previous.point.y);
  const speed = distance / elapsed;
  const brightnessBoost = movementBrightness(speed);

  audio.updateVoice(`pointer:${event.pointerId}`, mapPointToSound(point), brightnessBoost);

  if (now - previous.lastRippleTime > Math.max(65, 135 - brightnessBoost * 55)) {
    addRipple(point, Math.min(1, 0.35 + brightnessBoost));
    previous.lastRippleTime = now;
  }

  previous.point = point;
  previous.time = now;
}

function releasePointer(event: PointerEvent): void {
  if (!activePointers.has(event.pointerId)) return;
  event.preventDefault();
  activePointers.delete(event.pointerId);
  audio.stopVoice(`pointer:${event.pointerId}`);

  if (instrumentSurface.hasPointerCapture(event.pointerId)) {
    instrumentSurface.releasePointerCapture(event.pointerId);
  }
}

function shiftedKeyboardPoint(key: string): NormalisedPoint | null {
  const point = keyboardPoint(key);
  return point ? { x: point.x, y: keyboardDepth } : null;
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
    keyboardDepth = Math.min(
      0.84,
      Math.max(0.16, keyboardDepth + (event.key === "ArrowUp" ? -0.17 : 0.17)),
    );
    statusOutput.value =
      keyboardDepth < 0.4
        ? "Keyboard voice is bright."
        : keyboardDepth > 0.6
          ? "Keyboard voice is deep."
          : "Keyboard voice is balanced.";
    return;
  }

  const key = event.key.toLowerCase();
  const point = shiftedKeyboardPoint(key);
  if (!point || heldKeys.has(key)) return;

  event.preventDefault();
  heldKeys.add(key);
  wakeWater();
  addRipple(point, 0.7);
  void audio.startVoice(`key:${key}`, mapPointToSound(point));
}

function handleKeyUp(event: KeyboardEvent): void {
  const key = event.key.toLowerCase();
  if (!heldKeys.delete(key)) return;
  event.preventDefault();
  audio.stopVoice(`key:${key}`);
}

instrumentSurface.addEventListener("pointerdown", playPointer);
instrumentSurface.addEventListener("pointermove", movePointer);
instrumentSurface.addEventListener("pointerup", releasePointer);
instrumentSurface.addEventListener("pointercancel", releasePointer);
instrumentSurface.addEventListener("lostpointercapture", releasePointer);
instrumentSurface.addEventListener("keydown", handleKeyDown);
instrumentSurface.addEventListener("keyup", handleKeyUp);

window.addEventListener("blur", () => {
  activePointers.clear();
  heldKeys.clear();
  audio.stopAll();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) audio.stopAll();
});

if (!audio.isSupported) {
  statusOutput.value = "This browser does not support the Web Audio API.";
  instrumentSurface.classList.add("audio-unsupported");
}
