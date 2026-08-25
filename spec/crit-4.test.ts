import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const DIST = resolve("dist");
const html = readFileSync(join(DIST, "index.html"), "utf8");
const doc = new JSDOM(html).window.document;
const builtJavaScript = readdirSync(join(DIST, "assets"))
  .filter((name) => name.endsWith(".js"))
  .map((name) => readFileSync(join(DIST, "assets", name), "utf8"))
  .join("\n");

describe("C4 instrument contracts", () => {
  it("opens on an invitation to make the first sound", () => {
    expect(doc.querySelector("h1")?.textContent).toMatch(/touch the water/i);
    expect(doc.querySelector("[data-instrument='web-audio']")).toBeTruthy();
  });

  it("offers one focusable surface for pointer, touch and keyboard play", () => {
    const instrument = doc.querySelector<HTMLElement>("#instrument");
    expect(instrument?.getAttribute("tabindex")).toBe("0");
    expect(instrument?.getAttribute("role")).toBe("group");
    expect(instrument?.getAttribute("data-inputs")).toContain("pointer");
    expect(instrument?.getAttribute("data-inputs")).toContain("touch");
    expect(instrument?.getAttribute("data-inputs")).toContain("keyboard");
    expect(instrument?.getAttribute("aria-label")).toMatch(/touch.*click.*drag.*keys/i);
  });

  it("ships a live synthesis engine rather than a media player", () => {
    expect(doc.querySelector("audio, video")).toBeNull();
    expect(builtJavaScript).toContain("createOscillator");
    expect(builtJavaScript).toContain("createGain");
    expect(builtJavaScript).toContain("pointerdown");
    expect(builtJavaScript).toContain("keydown");
  });

  it("frames play without a score or failure state", () => {
    expect(doc.body.textContent).toMatch(/no score.*no wrong notes/i);
    expect(doc.querySelector("form, progress, meter")).toBeNull();
  });
});
