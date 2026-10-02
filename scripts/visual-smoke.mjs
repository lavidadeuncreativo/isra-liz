import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = "http://127.0.0.1:3000";
const screenshots = "qa-screenshots";
const profile = mkdtempSync(join(tmpdir(), "isra-liz-chrome-"));
mkdirSync(screenshots, { recursive: true });

function findChrome() {
  for (const name of ["google-chrome", "chromium", "chromium-browser"]) {
    try { return execFileSync("which", [name], { encoding: "utf8" }).trim(); }
    catch { /* try another executable */ }
  }
  throw new Error("Chrome no está disponible en el runner");
}
const browser = spawn(findChrome(), [
  "--headless=new", "--no-sandbox", "--disable-gpu",
  "--no-first-run", "--no-default-browser-check",
  "--remote-debugging-port=9222", "--user-data-dir=" + profile,
  "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
const waiting = new Map();
let nextId = 0;

function assert(ok, detail) { if (!ok) throw new Error("Browser QA: " + detail); }

async function connect() {
  let page;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch("http://127.0.0.1:9222/json");
      page = (await res.json()).find((p) => p.type === "page");
      if (page?.webSocketDebuggerUrl) break;
    } catch { /* browser starts asynchronously */ }
    await sleep(250);
  }
  assert(page?.webSocketDebuggerUrl, "Chrome no responde");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const result = JSON.parse(event.data);
    const cb = waiting.get(result.id);
    if (!cb) return;
    waiting.delete(result.id);
    if (result.error) cb.reject(new Error(JSON.stringify(result.error)));
    else cb.resolve(result.result);
  });
  await send("Page.enable");
  await send("Runtime.enable");
}
function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    waiting.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const res = await send("Runtime.evaluate", {
    expression, awaitPromise: true, returnByValue: true,
  });
  if (res.exceptionDetails) throw new Error("JS en navegador: " + JSON.stringify(res.exceptionDetails));
  return res.result.value;
}
async function until(expression, label) {
  for (let i = 0; i < 40; i++) {
    if (await evaluate(expression)) return;
    await sleep(200);
  }
  throw new Error("Timeout: " + label);
}
async function screenshot(name) {
  const res = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(screenshots, name), Buffer.from(res.data, "base64"));
}
async function inspect(width, height, reduced = false) {
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: width <= 820,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }],
  });
  await send("Page.navigate", { url });
  await until("document.readyState === 'complete' && !!document.querySelector('.entry-actions button')", "portada");
  await evaluate("document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('.entry-actions button:last-of-type').click(); true");
  await sleep(reduced ? 250 : 1200);

  const intro = await evaluate("({visibility:getComputedStyle(document.querySelector('.intro-title .reveal-word')).visibility,opacity:Number(getComputedStyle(document.querySelector('.intro-title .reveal-word')).opacity)})");
  assert(intro.visibility !== "hidden" && intro.opacity > 0.85, width + "px: portada oculta");

  await evaluate("document.querySelector('.story-scene-1').scrollIntoView({block:'start',behavior:'instant'}); true");
  await sleep(reduced ? 250 : 1050);
  const story = await evaluate("(() => { const s=document.querySelector('.story-scene-1'); const last=[...s.querySelectorAll('.display-title .reveal-word')].at(-1); const body=s.querySelector('.story-body'); const photo=s.querySelector('.story-photo'); return {word:Number(getComputedStyle(last).opacity),body:Number(getComputedStyle(body).opacity),photo:Number(getComputedStyle(photo).opacity),horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2}; })()");
  assert(story.word > 0.85 && story.body > 0.85 && story.photo > 0.85, width + "px: escena no legible " + JSON.stringify(story));
  assert(!story.horizontalOverflow, width + "px: overflow horizontal");
  await screenshot(reduced ? "reduced-motion.png" : "story-" + width + ".png");

  await evaluate("document.querySelector('#rsvp').scrollIntoView({block:'start',behavior:'instant'}); true");
  await sleep(600);
  const rsvp = await evaluate("(() => { const f=document.querySelector('#rsvp .rsvp-form'); return {visibility:getComputedStyle(f).visibility,opacity:Number(getComputedStyle(f).opacity)}; })()");
  assert(rsvp.visibility !== "hidden" && rsvp.opacity > 0.99, width + "px: RSVP invisible");
  await screenshot(reduced ? "rsvp-reduced.png" : "rsvp-" + width + ".png");

  if (reduced) {
    const animation = await evaluate("getComputedStyle(document.querySelector('.gallery-track')).animationName");
    assert(animation === "none", "Carrusel activo con movimiento reducido");
  }
  console.log(JSON.stringify({ width, height, reduced, intro, story, rsvp, result: "PASS" }));
}

try {
  await connect();
  await inspect(390, 844);
  await inspect(768, 1024);
  await inspect(1440, 900);
  await inspect(390, 844, true);
  console.log("PASS: scroll, mobile, desktop, reduced motion and RSVP");
} finally {
  socket?.close();
  browser.kill("SIGTERM");
  rmSync(profile, { recursive: true, force: true });
}
