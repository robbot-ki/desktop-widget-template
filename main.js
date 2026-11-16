// Desktop widget: a small character on your desktop. Click it and speak, a local Whisper
// transcribes your words, and the idea is saved as a Markdown note. Nothing leaves your PC.
const { app, BrowserWindow, ipcMain, Menu, screen, shell, session } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const STRINGS = require("./strings.js");

// ---------- Configuration (config.json, see config.example.json) ----------
const DEFAULTS = {
  notesFolder: "",              // empty = "Widget Notes" inside your Documents folder
  pythonPath: "python",         // Python that has faster-whisper installed
  whisperModel: "large-v3-turbo",
  whisperThreads: 0,            // 0 = automatic
  language: "en",               // "en" or "de": UI texts and speech recognition
  sleepAfterSeconds: 180,       // falls asleep after this long without any interaction
};

function loadConfig() {
  const file = process.env.WIDGET_CONFIG || path.join(__dirname, "config.json");
  let user = {};
  try {
    user = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    // No config file is fine (defaults). A broken one deserves a hint, e.g. unescaped backslashes in a Windows path.
    if (e.code !== "ENOENT") console.warn("config.json could not be read, using defaults:", e.message);
  }
  const cfg = { ...DEFAULTS, ...user };
  if (!STRINGS[cfg.language]) cfg.language = "en";
  if (!cfg.notesFolder) cfg.notesFolder = path.join(app.getPath("documents"), "Widget Notes");
  if (cfg.pythonPath === "python" && process.platform !== "win32") cfg.pythonPath = "python3";
  return cfg;
}

let CONFIG = null;
let T = STRINGS.en;                          // active UI strings
const RECORDINGS = path.join(__dirname, "recordings");
const POSITION_FILE = path.join(__dirname, "position.json");

// Window size: character 160 px wide plus room for the bubble, question mark and waves.
const WIDTH = 260, HEIGHT = 330;

let win = null;
let whisper = null, whisperBuffer = "", queue = [];

// ---------- Window position ----------
function readPosition() {
  try { return JSON.parse(fs.readFileSync(POSITION_FILE, "utf8")); } catch { return null; }
}
function savePosition() {
  if (!win) return;
  const [x, y] = win.getPosition();
  try { fs.writeFileSync(POSITION_FILE, JSON.stringify({ x, y })); } catch { /* not critical */ }
}

function createWindow() {
  const work = screen.getPrimaryDisplay().workArea;
  const saved = readPosition();
  // Only reuse the saved position if it is still on a screen.
  const fits = saved && screen.getAllDisplays().some(d =>
    saved.x >= d.workArea.x - 50 && saved.x < d.workArea.x + d.workArea.width - 50 &&
    saved.y >= d.workArea.y - 50 && saved.y < d.workArea.y + d.workArea.height - 50);
  win = new BrowserWindow({
    width: WIDTH, height: HEIGHT,
    x: fits ? saved.x : work.x + work.width - WIDTH - 24,
    y: fits ? saved.y : work.y + work.height - HEIGHT - 8,
    frame: false, transparent: true, backgroundColor: "#00000000", hasShadow: false,
    resizable: false, maximizable: false, minimizable: false, fullscreenable: false,
    skipTaskbar: true, alwaysOnTop: true, show: false,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false },
  });
  win.setAlwaysOnTop(true, "floating");
  win.loadFile("widget.html");
  win.once("ready-to-show", () => win.showInactive());
  win.on("moved", savePosition);
}

// ---------- Whisper: one worker process, the model is loaded only once ----------
function failQueue(message) {
  while (queue.length) queue.shift()({ error: message });
}

function startWhisper() {
  if (whisper) return;
  whisper = spawn(CONFIG.pythonPath, [path.join(__dirname, "whisper_worker.py")], {
    windowsHide: true,
    env: {
      ...process.env,
      PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1",
      WIDGET_MODEL: String(CONFIG.whisperModel),
      WIDGET_THREADS: String(CONFIG.whisperThreads || 0),
      WIDGET_LANGUAGE: CONFIG.language,
    },
  });
  const proc = whisper;
  proc.stdout.setEncoding("utf8");
  proc.stdout.on("data", chunk => {
    whisperBuffer += chunk;
    let i;
    while ((i = whisperBuffer.indexOf("\n")) >= 0) {
      const line = whisperBuffer.slice(0, i).trim();
      whisperBuffer = whisperBuffer.slice(i + 1);
      if (!line) continue;
      let msg; try { msg = JSON.parse(line); } catch { continue; }
      if (msg.ready) continue;
      const job = queue.shift();
      if (job) job(msg);
    }
  });
  proc.stderr.on("data", () => {});    // faster-whisper warnings (symlinks, progress) are harmless
  proc.on("error", () => { whisper = null; failQueue(T.pythonFailed); });
  proc.on("exit", () => { if (whisper === proc) whisper = null; failQueue(T.whisperStopped); });
  proc.stdin.on("error", () => {});    // worker died while we wrote: the exit handler reports it
}

function transcribe(file) {
  startWhisper();
  return new Promise(resolve => {
    queue.push(resolve);
    if (whisper && whisper.stdin.writable) whisper.stdin.write(JSON.stringify({ file }) + "\n");
    else failQueue(T.pythonFailed);
  });
}

// ---------- Save the note ----------
const two = n => String(n).padStart(2, "0");
function createNote(text) {
  const now = new Date();
  const date = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
  const time = `${two(now.getHours())}-${two(now.getMinutes())}`;
  // Title from the first words, without characters that are forbidden in file names.
  const words = text.replace(/[\\/:*?"<>|#^\[\]]/g, "").split(/\s+/).filter(Boolean).slice(0, 6).join(" ");
  const title = words.replace(/[.,;!]+$/, "") || T.noteFallbackTitle;
  const folder = CONFIG.notesFolder;
  let name = `${T.notePrefix} ${date} ${time} ${title}.md`, n = 2;
  while (fs.existsSync(path.join(folder, name))) name = `${T.notePrefix} ${date} ${time} ${title} (${n++}).md`;
  const content =
    `---\ntags: [idea, desktop-widget]\ndate: ${date}\n---\n\n` +
    `# ${title}\n\n${text.trim()}\n\n` +
    `${T.noteFooter(date, time.replace("-", ":"))}\n`;
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, name), content, { encoding: "utf8", flag: "wx" });
  return { name, title };
}

// ---------- Messages from the widget page ----------
ipcMain.handle("recording", async (_e, buffer) => {
  fs.mkdirSync(RECORDINGS, { recursive: true });
  const file = path.join(RECORDINGS, `recording_${Date.now()}.webm`);
  fs.writeFileSync(file, Buffer.from(buffer));
  const result = await transcribe(file);
  try { fs.unlinkSync(file); } catch { /* already gone */ }   // audio is deleted after transcription, only the note stays
  if (result.error) return { error: result.error };
  const text = (result.text || "").trim();
  if (text.length < 3) return { empty: true };
  try { return { ok: true, text, ...createNote(text) }; }
  catch (e) { return { error: T.saveFailed + e.message }; }
});

ipcMain.on("warm-up", () => startWhisper());
ipcMain.handle("settings", () => ({ sleepAfterSeconds: CONFIG.sleepAfterSeconds, language: CONFIG.language }));

// Eyes follow the mouse: every 80 ms report the cursor relative to the head
// (the head sits at x 130, y 200 inside the window). Within 700 px the character looks at it,
// the eyes move at most to the edge (-1..1).
function trackMouse() {
  setInterval(() => {
    if (!win || win.isDestroyed() || process.env.WIDGET_TEST) return;
    const p = screen.getCursorScreenPoint(), [wx, wy] = win.getPosition();
    const dx = p.x - (wx + 130), dy = p.y - (wy + 200), dist = Math.hypot(dx, dy);
    const k = v => Math.max(-1, Math.min(1, v / 260));
    win.webContents.send("mouse", { dx: k(dx), dy: k(dy) * 0.8, near: dist < 700 });
  }, 80);
}

// Dragging: the page reports screen coordinates, we move the window.
let drag = null;
ipcMain.on("drag-start", (_e, p) => { const [x, y] = win.getPosition(); drag = { mx: p.x, my: p.y, x, y }; });
ipcMain.on("drag", (_e, p) => {
  if (!drag) return;
  win.setPosition(Math.round(drag.x + p.x - drag.mx), Math.round(drag.y + p.y - drag.my));
});
ipcMain.on("drag-end", () => { drag = null; savePosition(); });

ipcMain.on("menu", () => {
  Menu.buildFromTemplate([
    { label: T.menuOpenNotes, click: () => { fs.mkdirSync(CONFIG.notesFolder, { recursive: true }); shell.openPath(CONFIG.notesFolder); } },
    { type: "separator" },
    { label: T.menuQuit, click: () => app.quit() },
  ]).popup({ window: win });
});

// ---------- Test mode ----------
// WIDGET_TEST=<frames folder>   click the character internally (no real mouse needed) and save frames
// WIDGET_TEST_FLOW=life         instead of the dictation flow, trigger every idle animation once
// WIDGET_TEST_AUDIO=<file.wav>  use this file as the fake microphone (Chromium switches below)
// WIDGET_CONFIG=<config.json>   use another config file, e.g. with a temporary notesFolder
if (process.env.WIDGET_TEST && process.env.WIDGET_TEST_AUDIO) {
  app.commandLine.appendSwitch("use-fake-device-for-media-stream");
  app.commandLine.appendSwitch("use-fake-ui-for-media-stream");
  app.commandLine.appendSwitch("use-file-for-fake-audio-capture", process.env.WIDGET_TEST_AUDIO + "%noloop");
}

function internalClick() {
  const p = { x: 130, y: 260 };    // middle of the character inside the window
  win.webContents.sendInputEvent({ type: "mouseDown", button: "left", clickCount: 1, ...p });
  win.webContents.sendInputEvent({ type: "mouseUp", button: "left", clickCount: 1, ...p });
}

function captureFrames(folder, everyMs, maxFrames, untilDone) {
  let n = 0, rest = 4;                 // after "done" was seen, capture 4 more frames
  const timer = setInterval(async () => {
    const image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(folder, `frame_${String(n).padStart(3, "0")}.png`), image.toPNG());
    if (untilDone && await win.webContents.executeJavaScript("window.__test.state()") === "done") rest--;
    if (++n > maxFrames || rest <= 0) { clearInterval(timer); app.quit(); }
  }, everyMs);
}

function testDictation(folder) {
  fs.mkdirSync(folder, { recursive: true });
  setTimeout(internalClick, 1500);
  captureFrames(folder, 500, 400, true);   // the first run may need a while to load the model
}

// "life" flow: trigger each idle animation once and save a frame every 0.25 s.
// The fast drag uses real mouse events with globalX, so the dizzy measurement is tested too.
function testLife(folder) {
  fs.mkdirSync(folder, { recursive: true });
  const js = code => win.webContents.executeJavaScript(code);
  const plan = [
    [1000, () => js('__test.mood("wink")')],
    [3000, () => js('__test.mood("surprised")')],
    [5000, () => win.webContents.sendInputEvent({ type: "mouseEnter", x: 130, y: 260 })],
    [5050, () => win.webContents.sendInputEvent({ type: "mouseMove", x: 130, y: 262 })],
    [7000, () => js('__test.set("yawn")')],
    [12000, () => internalClick()],
    [15000, () => fastDrag()],
  ];
  for (const [ms, fn] of plan) setTimeout(fn, ms);
  captureFrames(folder, 250, 84);
}

function fastDrag() {
  // 1.2 s of violent shaking: 60 events every 20 ms, swing 220 px
  const [wx, wy] = win.getPosition(), p = { x: 130, y: 260 };
  win.webContents.sendInputEvent({ type: "mouseDown", button: "left", clickCount: 1, ...p, globalX: wx + 130, globalY: wy + 260 });
  for (let i = 1; i <= 60; i++) setTimeout(() => {
    const gx = wx + 130 + Math.round(Math.sin(i / 3) * 220);
    win.webContents.sendInputEvent({ type: "mouseMove", button: "left", ...p, globalX: gx, globalY: wy + 260 });
  }, i * 20);
  setTimeout(() => win.webContents.sendInputEvent({ type: "mouseUp", button: "left", clickCount: 1, ...p, globalX: wx + 130, globalY: wy + 260 }), 1300);
}

// ---------- Start ----------
if (!app.requestSingleInstanceLock()) app.quit();

app.whenReady().then(() => {
  CONFIG = loadConfig();
  T = STRINGS[CONFIG.language];
  // Only the microphone is allowed, everything else is denied.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, allow) => allow(permission === "media"));
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === "media");
  createWindow();
  trackMouse();
  if (process.env.WIDGET_TEST) {
    (process.env.WIDGET_TEST_FLOW === "life" ? testLife : testDictation)(process.env.WIDGET_TEST);
  }
});

app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => { if (whisper) whisper.kill(); });
