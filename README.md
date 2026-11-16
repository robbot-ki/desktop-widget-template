# Desktop Widget Template

A little character that lives on your desktop and listens. Click it, say an idea, and a **local** Whisper model writes it down as a Markdown note. Built with [Claude Code](https://claude.com/claude-code) in about 20 minutes.

The character in this repo ("Blobby") is a simple placeholder. The point is that you give it **your own** character and **your own** idea of what it does. See [PROMPT.md](PROMPT.md) for a prompt that builds your own widget from scratch.

*Deutsche Version: [weiter unten](#deutsch).*

## Features

- Transparent, frameless, always-on-top window. It does not show up in the taskbar.
- **Click = it listens.** A microphone appears, waves grow with your voice, and it stops by itself after a pause.
- **Local transcription** with [faster-whisper](https://github.com/SYSTRAN/faster-whisper). The model is loaded once and stays warm.
- Your words are saved as a **Markdown note** (with front matter), ready for Obsidian, Logseq or any folder of `.md` files.
- Idle life: blinking, random moods (wink, surprise, smile, ...), eyes that follow your mouse cursor, a happy hop when you hover over it.
- After 3 minutes without contact it **yawns and falls asleep** (zzz). A click wakes it up, and it is startled ("!").
- **Drag to move.** It tilts while you drag it. Shake it fast and it gets **dizzy** (spiral eyes, circling stars).
- Right-click menu (open notes folder, quit). Position is remembered. Only one instance runs at a time.
- Test mode with a fake microphone and screenshots, so you can verify everything without touching your real mic.

## Privacy

- Your speech **stays on your PC**. Transcription runs locally with Whisper. No cloud, no account, no API key.
- The audio snippet is **deleted right after transcription**. Only the text note stays.
- The only permission the window can get is the microphone. Everything else is denied.
- The only network traffic is the one-time model download from Hugging Face on first run. Hugging Face telemetry is switched off in the worker.

## Requirements

- Windows, macOS or Linux
- Node.js 20 or newer
- Python 3.10 or newer with faster-whisper: `pip install faster-whisper`
- A microphone
- About 1.6 GB of disk space. The first dictation downloads the `large-v3-turbo` model (~1.6 GB), so the first run takes a while.

## Install and start

```bash
git clone <this repo>
cd desktop-widget-template
npm install
pip install faster-whisper
cp config.example.json config.json     # optional, see Configuration
npm start
```

The widget appears at the bottom right of your main screen. Click it and speak. The first time, the model has to download and load, so give it a minute. Later runs take a few seconds.

## Configuration

Copy `config.example.json` to `config.json` (it is git-ignored, so your paths stay private). All keys are optional.

| Key | Default | Meaning |
|---|---|---|
| `notesFolder` | `""` | Where notes are saved. Empty means a `Widget Notes` folder inside your Documents folder. |
| `pythonPath` | `"python"` | Python that has faster-whisper installed. Use a full path if you use a virtual environment. On macOS/Linux the default falls back to `python3`. |
| `whisperModel` | `"large-v3-turbo"` | Any faster-whisper model name, e.g. `small` or `base` for a lighter, faster, less accurate model. |
| `whisperThreads` | `0` | CPU threads for Whisper. `0` = automatic (up to 8). |
| `language` | `"en"` | `"en"` or `"de"`. Sets the UI texts **and** the language Whisper expects. |
| `sleepAfterSeconds` | `180` | Seconds without any interaction until it yawns and sleeps. |

On Windows, write paths with forward slashes (`C:/Users/you/Notes`) or doubled backslashes.

## How notes look

Each dictation creates one file, for example `Idea 2026-11-16 21-04 Call the dentist about.md`:

```markdown
---
tags: [idea, desktop-widget]
date: 2026-11-16
---

# Call the dentist about

Call the dentist about the appointment next week and ask for a morning slot.

*Dictated on 2026-11-16 at 21:04, transcribed locally with Whisper.*
```

The title is the first six words. If a name exists already, a number is added. Existing notes are never overwritten.

## Test mode

You can test everything without a real microphone. Test mode clicks the character internally (your mouse is not used), plays a WAV file as the fake microphone, and saves screenshots of the window.

Environment variables:

| Variable | Meaning |
|---|---|
| `WIDGET_TEST=<folder>` | Enable test mode and save `frame_000.png`, `frame_001.png`, ... into this folder. |
| `WIDGET_TEST_AUDIO=<file.wav>` | Fake microphone input (Chromium switches). Use e.g. an 8 second, 48 kHz mono speech sample. |
| `WIDGET_TEST_FLOW=life` | Instead of dictation, trigger every idle animation once: wink, surprise, hover hop, yawn, sleep, startled wake-up, fast shaking and dizziness. |
| `WIDGET_CONFIG=<config.json>` | Use another config file, for example with a temporary `notesFolder`. |

Example (bash):

```bash
WIDGET_TEST=./test-frames WIDGET_TEST_AUDIO=./sample.wav npm start
WIDGET_TEST=./test-frames WIDGET_TEST_FLOW=life npm start
```

Make a contact sheet from the frames with ffmpeg to look at them at once:

```bash
ffmpeg -framerate 2 -start_number 1 -i test-frames/frame_%03d.png \
  -vf "select='not(mod(n,4))',scale=130:-1,tile=10x2" -frames:v 1 sheet.png
```

(`-start_number 1` skips the first, still empty frame.)

## Swap the character

The whole look lives in one file: `character.js`. It must define one function:

```js
window.Character(options) // returns an SVG string with viewBox "-20 0 440 500"
```

`options` (all optional):

| Option | Meaning |
|---|---|
| `expression` | `"neutral"`, `"happy"`, `"surprised"`, `"wink"`, `"dizzy"` (spiral eyes), `"startled"`, `"focused"`, `"sad"`, `"shy"`, `"idea"` (light bulb) |
| `eyesClosed` | 0..1, blink amount |
| `look` | `[x, y]`, each -1..1, where the eyes look |
| `hop` | pixels the whole body is lifted |
| `tilt` | degrees, whole body |
| `headTilt` | degrees, head only |
| `squash` | 0..1, squash the body (breathing while asleep) |
| `holdingMic` | `true` while it listens |
| `glow` | 0..1, inner light, follows your voice |

Tips:

- Keep the figure inside the viewBox, with the feet near `y = 480` and the head around `y = 100..300`. The widget places the question mark, waves and stars relative to this box.
- The function runs about 30 times per second. Keep it a pure function that returns a string.
- You do not have to support every expression. Unknown ones can fall back to a neutral face. But the more you support, the more the widget can show.
- Ask Claude Code: "Replace character.js with a character that looks like <your idea>. Keep the same function signature and options."

## Change the behaviour

- **What happens with your words:** `createNote()` in `main.js`. Change the format, add tags, append to a daily note, or send the text to a script.
- **Texts and languages:** `strings.js`. Add a language by adding a block.
- **Animations and timing:** the state machine in `frame()` in `widget.html`. States are `idle`, `hover`, `yawn`, `sleep`, `wake`, `dizzy`, `ask`, `listen`, `think`, `done`, `empty`, `error`. The idle moods are in the `MOODS` table.
- **Recording behaviour:** constants near the top of the recording section in `widget.html` (voice threshold, silence length, maximum length).
- **Window size and start position:** `WIDTH`, `HEIGHT` and `createWindow()` in `main.js`.

Claude Code is good at this. Open the folder, describe what you want, and let it edit.

## License

MIT, see [LICENSE](LICENSE). Copyright (c) 2026 robbot-ki.

---

<a id="deutsch"></a>

# Deutsch

## Was ist das?

Eine kleine Figur auf deinem Desktop, die zuhört. Anklicken, eine Idee sagen, und ein **lokales** Whisper-Modell schreibt sie als Markdown-Notiz mit. Mit [Claude Code](https://claude.com/claude-code) in etwa 20 Minuten gebaut.

Die Figur in diesem Repo ("Blobby") ist nur ein einfacher Platzhalter. Der Sinn: Du gibst ihr **deine eigene** Figur und **deine eigene** Idee, was sie tut. In [PROMPT.md](PROMPT.md) steht ein Prompt, mit dem du dein eigenes Widget von Grund auf bauen lässt.

## Funktionen

- Transparentes Fenster ohne Rahmen, immer im Vordergrund, nicht in der Taskleiste.
- **Klick = sie hört zu.** Ein Mikrofon erscheint, Wellen wachsen mit deiner Stimme, nach einer Pause endet die Aufnahme von selbst.
- **Lokale Transkription** mit faster-whisper. Das Modell wird einmal geladen und bleibt bereit.
- Dein Text wird als **Markdown-Notiz** gespeichert (mit Frontmatter), passend für Obsidian, Logseq oder jeden Ordner mit `.md`-Dateien.
- Leben in Ruhe: Blinzeln, zufällige Launen (Zwinkern, Staunen, Lächeln, ...), die Augen folgen dem Mauszeiger, ein fröhlicher Hüpfer beim Drüberfahren.
- Nach 3 Minuten ohne Berührung **gähnt sie und schläft ein** (zzz). Ein Klick weckt sie, und sie erschrickt ("!").
- **Ziehen zum Verschieben.** Sie neigt sich beim Ziehen. Schüttelst du sie schnell, wird ihr **schwindlig** (Spiralaugen, kreisende Sterne).
- Rechtsklick-Menü (Notizordner öffnen, Beenden). Die Position wird gemerkt. Es läuft immer nur eine Instanz.
- Testmodus mit falschem Mikrofon und Bildern, damit du alles prüfen kannst, ohne dein echtes Mikrofon zu benutzen.

## Datenschutz

- Deine Sprache **bleibt auf deinem PC**. Die Transkription läuft lokal mit Whisper. Keine Cloud, kein Konto, kein API-Schlüssel.
- Die Tonaufnahme wird **direkt nach dem Mitschreiben gelöscht**. Nur die Textnotiz bleibt.
- Das Fenster bekommt nur eine Berechtigung: das Mikrofon. Alles andere wird abgelehnt.
- Netzwerkverkehr gibt es nur beim einmaligen Download des Modells von Hugging Face beim ersten Start. Die Hugging-Face-Telemetrie ist im Worker abgeschaltet.

## Voraussetzungen

- Windows, macOS oder Linux
- Node.js 20 oder neuer
- Python 3.10 oder neuer mit faster-whisper: `pip install faster-whisper`
- Ein Mikrofon
- Etwa 1,6 GB Speicherplatz. Beim ersten Diktat lädt das Modell `large-v3-turbo` herunter (~1,6 GB), der erste Start dauert deshalb länger.

## Installieren und starten

```bash
git clone <dieses Repo>
cd desktop-widget-template
npm install
pip install faster-whisper
cp config.example.json config.json     # optional, siehe Konfiguration
npm start
```

Das Widget erscheint unten rechts auf deinem Hauptbildschirm. Anklicken und sprechen. Beim ersten Mal muss das Modell laden, gib ihr eine Minute. Danach dauert es nur wenige Sekunden.

## Konfiguration

Kopiere `config.example.json` nach `config.json` (steht in der `.gitignore`, deine Pfade bleiben privat). Alle Schlüssel sind optional.

| Schlüssel | Standard | Bedeutung |
|---|---|---|
| `notesFolder` | `""` | Wohin die Notizen kommen. Leer heißt: Ordner `Widget Notes` in deinen Dokumenten. |
| `pythonPath` | `"python"` | Python mit installiertem faster-whisper. Bei einer virtuellen Umgebung den vollen Pfad angeben. |
| `whisperModel` | `"large-v3-turbo"` | Jeder faster-whisper-Modellname, z. B. `small` oder `base` für ein leichteres, schnelleres, weniger genaues Modell. |
| `whisperThreads` | `0` | CPU-Threads für Whisper. `0` = automatisch (bis 8). |
| `language` | `"en"` | `"en"` oder `"de"`. Stellt die Oberflächentexte **und** die erwartete Sprache für Whisper ein. |
| `sleepAfterSeconds` | `180` | Sekunden ohne Interaktion, bis sie gähnt und schläft. |

Unter Windows Pfade mit Schrägstrichen (`C:/Users/du/Notizen`) oder doppelten Rückwärtsschrägstrichen schreiben.

## So sehen Notizen aus

Jedes Diktat erzeugt eine Datei, zum Beispiel `Idee 2026-11-16 21-04 Zahnarzt anrufen wegen.md` mit Frontmatter (Tags, Datum), einer Überschrift aus den ersten sechs Wörtern, dem Text und einer Fußzeile mit Datum und Uhrzeit. Gibt es den Namen schon, wird eine Zahl angehängt. Bestehende Notizen werden nie überschrieben.

## Testmodus

Du kannst alles ohne echtes Mikrofon testen. Der Testmodus klickt die Figur intern an (deine Maus wird nicht benutzt), spielt eine WAV-Datei als falsches Mikrofon ab und speichert Bilder des Fensters.

- `WIDGET_TEST=<Ordner>`: Testmodus an, Bilder `frame_000.png`, ... landen in diesem Ordner.
- `WIDGET_TEST_AUDIO=<datei.wav>`: falsches Mikrofon, z. B. ein Sprachbeispiel mit 8 Sekunden, 48 kHz, mono.
- `WIDGET_TEST_FLOW=life`: statt des Diktats jede Ruhe-Animation einmal auslösen (Zwinkern, Staunen, Hüpfer, Gähnen, Schlaf, Erschrecken beim Wecken, schnelles Schütteln, Schwindel).
- `WIDGET_CONFIG=<config.json>`: andere Konfigurationsdatei, z. B. mit einem temporären `notesFolder`.

Mit ffmpeg kannst du aus den Bildern einen Kontaktbogen machen (Befehl siehe oben).

## Figur austauschen

Das ganze Aussehen steckt in einer Datei: `character.js`. Sie muss eine Funktion `window.Character(options)` anbieten, die einen SVG-String mit viewBox `-20 0 440 500` zurückgibt. Die Optionen (`expression`, `eyesClosed`, `look`, `hop`, `tilt`, `headTilt`, `squash`, `holdingMic`, `glow`) stehen in der englischen Tabelle oben. Halte die Füße nahe `y = 480` und den Kopf bei `y = 100..300`, die Funktion läuft rund 30 Mal pro Sekunde und sollte schlank bleiben.

Tipp für Claude Code: "Ersetze character.js durch eine Figur, die aussieht wie <deine Idee>. Gleiche Funktion, gleiche Optionen."

## Verhalten ändern

- **Was mit deinen Worten passiert:** `createNote()` in `main.js` (Format, Tags, Tagesnotiz, Skript aufrufen).
- **Texte und Sprachen:** `strings.js`.
- **Animationen und Zeiten:** die Zustandsmaschine in `frame()` in `widget.html`, die Launen in der Tabelle `MOODS`.
- **Aufnahmeverhalten:** Konstanten im Aufnahme-Abschnitt von `widget.html` (Stimmschwelle, Stille, Höchstdauer).
- **Fenstergröße und Startposition:** `WIDTH`, `HEIGHT` und `createWindow()` in `main.js`.

## Lizenz

MIT, siehe [LICENSE](LICENSE). Copyright (c) 2026 robbot-ki.
