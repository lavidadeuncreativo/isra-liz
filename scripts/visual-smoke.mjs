import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
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
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
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
  for (let i = 0; i < 120; i++) {
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
  await sleep(350);
  await until("document.readyState === 'complete' && !!document.querySelector('.entry-actions button')", "portada");
  await evaluate("document.documentElement.style.scrollBehavior = 'auto'; true");
  // SSR can finish before React hydration has attached click handlers.
  // Never interpret a missed entry click as a motion failure.
  let opened = false;
  for (let attempt = 0; attempt < 15; attempt++) {
    await evaluate("document.querySelector('.entry-actions button:last-of-type').click(); true");
    await sleep(120);
    opened = await evaluate("document.querySelector('.wedding-site').classList.contains('entered')");
    if (opened) break;
  }
  assert(opened, width + "px: no se pudo abrir la invitación tras la hidratación de React");

  // Visibility by itself is insufficient: the old test missed that the
  // headline entrance had finished behind the 700ms opening overlay.
  if (!reduced) {
    await sleep(780);
    const during = await evaluate("(() => {const w=[...document.querySelectorAll('.intro-title .reveal-word')];return {first:Number(getComputedStyle(w[0]).opacity),last:Number(getComputedStyle(w.at(-1)).opacity)};})()");
    assert(during.first > 0.15 && during.last < 0.90,
      width + "px: sin animación perceptible al abrir " + JSON.stringify(during));
    await sleep(1500);
  } else {
    await sleep(250);
  }

  const intro = await evaluate("({visibility:getComputedStyle(document.querySelector('.intro-title .reveal-word')).visibility,opacity:Number(getComputedStyle(document.querySelector('.intro-title .reveal-word')).opacity)})");
  assert(intro.visibility !== "hidden" && intro.opacity > 0.85, width + "px: portada oculta");
  await screenshot(reduced ? "cover-reduced.png" : "cover-" + width + ".png");

  const ui = await evaluate("(() => { const dock=document.querySelector('.mobile-dock'); const bar=document.querySelector('.scroll-progress-line'); return {dock:getComputedStyle(dock).display, tabs:dock.querySelectorAll('a,button').length, bar:!!bar, church:!!document.querySelector('.mobile-menu-panel a[href*=\"church\"]')}; })()");
  assert(ui.bar, "No se encontró la barra de progreso");
  assert(ui.tabs === 4, width + "px: el menú no tiene cuatro accesos");
  if (width <= 820) {
    assert(ui.dock === "grid", width + "px: la navegación móvil no es persistente");
    await evaluate("document.querySelector('.mobile-dock button').click(); true");
    await sleep(180);
    const menu = await evaluate("(() => { const m=document.querySelector('.mobile-menu-panel'); return {open:!!m,links:m?.querySelectorAll('a').length||0,containsRsvp:!!m?.querySelector('a[href=\"#rsvp\"]')}; })()");
    assert(menu.open && menu.links >= 7 && menu.containsRsvp, width + "px: menú móvil incompleto");
    await screenshot("mobile-menu-" + width + ".png");
    await evaluate("document.querySelector('.mobile-dock button').click();true");
    await sleep(180);
    assert(await evaluate("!document.querySelector('.mobile-menu-panel')"), width + "px: el menú no cierra");
  } else {
    assert(ui.dock === "none", "El dock móvil no debe mostrarse en escritorio");
  }


  // The next chapter must begin hidden BEFORE reaching the viewport and
  // be completely readable once its sticky stage occupies the viewport.
  if (!reduced) {
    await evaluate("window.scrollTo({top:document.querySelector('.story-scene-1').offsetTop-innerHeight*1.05,behavior:'instant'});true");
    await sleep(500);
    const before = await evaluate("Number(getComputedStyle(document.querySelector('.story-scene-1 .display-title .reveal-word')).opacity)");
    assert(before < 0.25, width + "px: el capítulo carece de efecto de entrada (" + before + ")");
  }
  await evaluate("document.querySelector('.story-scene-1').scrollIntoView({block:'start',behavior:'instant'}); true");
  await sleep(reduced ? 250 : 1050);
  const story = await evaluate("(() => { const s=document.querySelector('.story-scene-1'); const last=[...s.querySelectorAll('.display-title .reveal-word')].at(-1);const lastBody=[...s.querySelectorAll('.story-body .reveal-word')].at(-1); const photo=s.querySelector('.story-photo'); return {word:Number(getComputedStyle(last).opacity),body:Number(getComputedStyle(lastBody).opacity),photo:Number(getComputedStyle(photo).opacity),horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+2}; })()");
  assert(story.word > 0.85 && story.body > 0.85 && story.photo > 0.85, width + "px: escena no legible " + JSON.stringify(story));
  assert(!story.horizontalOverflow, width + "px: overflow horizontal");
  const geometry = await evaluate("(() => {const s=document.querySelector('.story-scene-1'),stage=s.querySelector('.scene-stage'),title=s.querySelector('.display-title'),word=title.querySelector('.reveal-word'),photo=s.querySelector('.story-photo'); const r=e=>{const p=e.getBoundingClientRect();return {top:Math.round(p.top),bottom:Math.round(p.bottom),height:Math.round(p.height)};}; return {scrollY:Math.round(window.scrollY),viewport:window.innerHeight,section:r(s),stage:r(stage),title:r(title),word:r(word),photo:r(photo),stagePos:getComputedStyle(stage).position,stageOverflow:getComputedStyle(stage).overflow};})()");
  console.log("STORY_GEOMETRY " + width + " " + JSON.stringify(geometry));
  const paint = await evaluate("(() => {const nodes=['.story-scene-1','.story-scene-1 .scene-stage','.story-scene-1 .scene-layout','.story-scene-1 .scene-copy','.story-scene-1 .display-title','.story-scene-1 .display-title .reveal-word','.story-scene-1 .story-body','.story-scene-1 .story-photo'];return {layers:nodes.map(q=>{const e=document.querySelector(q);const s=getComputedStyle(e);return {q,opacity:s.opacity,visibility:s.visibility,filter:s.filter,display:s.display,transform:s.transform,color:s.color,z:s.zIndex}}),topHit:document.elementFromPoint(innerWidth/2,220)?.className,photoHit:document.elementFromPoint(innerWidth/2,520)?.className};})()");
  console.log("STORY_PAINT " + width + " " + JSON.stringify(paint));
  await screenshot(reduced ? "reduced-motion.png" : "story-" + width + ".png");
  assert(geometry.title.bottom > 0 && geometry.title.top < height &&
    geometry.photo.bottom > 0 && geometry.photo.top < height,
    width + "px: texto o foto fuera del viewport " + JSON.stringify(geometry));

  // At the end of a narrative scene the editorial blur must return, not
  // remain static after the first reveal.
  if (!reduced) {
    await evaluate("window.scrollTo({top:document.querySelector('.story-scene-1').offsetTop+document.querySelector('.story-scene-1').offsetHeight-window.innerHeight,behavior:'instant'});true");
    await sleep(750);
    const departing = await evaluate("Number(getComputedStyle(document.querySelector('.story-scene-1 .display-title .reveal-word')).opacity)");
    assert(departing < 0.30, width + "px: no se aprecia blur disappear (" + departing + ")");
  }

  if (!reduced) await screenshot("story-exit-" + width + ".png");

  // Two visually identical groups permit an uninterrupted half-track loop.
  const loop = await evaluate("(() => { const groups=[...document.querySelectorAll('.gallery-loop-group')]; return {length:groups.length,first:groups[0]?.getBoundingClientRect().width,second:groups[1]?.getBoundingClientRect().width,animation:getComputedStyle(document.querySelector('.gallery-track')).animationName};})()");
  assert(loop.length === 2, width + "px: faltan ciclos de galería");
  if (!reduced) {
    assert(Math.abs(loop.first-loop.second) < 1, width + "px: la galería no tiene dos ciclos iguales");
    assert(loop.animation !== "none", width + "px: carrusel sin animación");
    await evaluate("document.querySelector('.gallery-pause').click();true");
    await sleep(180);
    const paused = await evaluate("({pressed:document.querySelector('.gallery-pause').getAttribute('aria-pressed'),state:getComputedStyle(document.querySelector('.gallery-track')).animationPlayState})");
    assert(paused.pressed === "true" && paused.state === "paused", width + "px: botón de pausa no funciona");
    await evaluate("document.querySelector('.gallery-pause').click();true");
    await sleep(180);
    assert(await evaluate("getComputedStyle(document.querySelector('.gallery-track')).animationPlayState === 'running'"),
      width + "px: no se pudo reanudar el carrusel");
  }

  await evaluate("document.querySelector('#galeria').scrollIntoView({block:'start',behavior:'instant'});true");
  await sleep(850);
  await screenshot(reduced ? "gallery-reduced.png" : "gallery-" + width + ".png");

  await evaluate("document.querySelector('#rsvp').scrollIntoView({block:'start',behavior:'instant'}); true");
  await sleep(600);
  const rsvp = await evaluate("(() => { const f=document.querySelector('#rsvp .rsvp-form'); return {visibility:getComputedStyle(f).visibility,opacity:Number(getComputedStyle(f).opacity)}; })()");
  assert(rsvp.visibility !== "hidden" && rsvp.opacity > 0.99, width + "px: RSVP invisible");
  await sleep(120);
  const progress = await evaluate("(() => { const m=getComputedStyle(document.querySelector('.scroll-progress-line')).transform;return Number(m.match(/matrix\\(([^,]+)/)?.[1]||0);})()");
  assert(progress > 0.35 && progress < 1, width + "px: barra de progreso fuera de rango (" + progress + ")");

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
  await inspect(375, 667);
  await inspect(768, 1024);
  await inspect(1440, 900);
  await inspect(390, 844, true);
  console.log("PASS: scroll, mobile, desktop, reduced motion and RSVP");
} finally {
  socket?.close();
  if (browser.exitCode === null) {
    browser.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => browser.once("exit", resolve)),
      sleep(1500),
    ]);
  }
  // The ephemeral GitHub runner removes this Chrome profile at job shutdown.
}
