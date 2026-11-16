# Build your own widget from scratch

Paste the prompt below into [Claude Code](https://claude.com/claude-code) in an empty folder. It builds a talking desktop widget in this style, with **your** character and **your** idea of what it does.

Before you paste it, replace the two parts in `<angle brackets>`:

- the character you want (a fox, a cloud, a tiny robot, a potato ...)
- what it should do when you talk to it (save ideas, add to-dos, log your mood, write a diary ...)

*Deutsche Version: [weiter unten](#deutsch).*

---

## English prompt

```text
Build me a small "talking desktop widget" with Electron. Before you write any code,
ask me clarifying questions (at most 6, short, one message) about anything that is
unclear: my operating system, where notes should be saved, which language I speak,
and how the character should look and behave. Wait for my answers, then build.

THE IDEA
A small character lives on my desktop. I click it, speak, and it does this with my
words: <WHAT IT SHOULD DO, e.g. "saves them as an idea note in a Markdown folder">.
The character is: <MY CHARACTER, e.g. "a sleepy fox with a big fluffy tail">.

TECH
- Electron app (pin the major version), plain HTML/JS, no frontend framework.
- Transparent, frameless, always-on-top window, hidden from the taskbar, about
  260 x 330 px, starts at the bottom right of the main screen, remembers its
  position in position.json. Single instance only.
- The character is ONE pure function in character.js: Character(options) returns
  an SVG string with viewBox "-20 0 440 500". Options: expression (neutral, happy,
  surprised, wink, dizzy with spiral eyes, startled, focused, sad, shy, idea with a
  light bulb), eyesClosed 0..1, look [x,y] -1..1, hop, tilt, headTilt, squash,
  holdingMic, glow 0..1. Draw it yourself in a simple, charming flat style.
  No copyrighted characters.
- Speech to text runs LOCALLY: a Python worker with faster-whisper (model
  large-v3-turbo, int8, CPU) that loads the model once and talks JSON lines over
  stdin/stdout. Hugging Face telemetry off. Audio files are deleted right after
  transcription. No cloud, no API keys.
- Notes are saved as Markdown files with front matter (tags, date) and a title
  from the first words, never overwriting existing files.
- All paths and settings come from config.json (git-ignored) with a
  config.example.json: notesFolder, pythonPath, whisperModel, whisperThreads,
  language (en or de), sleepAfterSeconds. UI texts live in a small strings table
  for en and de.
- Security: contextIsolation on, nodeIntegration off, a preload script, a strict
  Content-Security-Policy, and a permission handler that allows only "media".

BEHAVIOUR
- Click = it listens. States: ask (question mark) -> listen (microphone in hand,
  sound waves grow with my voice, red recording dot) -> think (three bouncing
  dots) -> done (light bulb, check mark, short speech bubble with the note title)
  or empty / error (sad face with a short message).
- Recording ends by itself after about 2 seconds of silence once I spoke; if I say
  nothing for 9 seconds it says "heard nothing"; hard stop after 2 minutes.
- Idle life: blinking every few seconds, gentle floating, rare random moods
  (wink, surprise, smile, focus, idea, shy), eyes slowly wander, and follow the
  mouse cursor when it is within 700 px (main process polls the cursor every 80 ms).
- Happy hop when the mouse hovers over it.
- After sleepAfterSeconds without any interaction: yawn, fall asleep (closed eyes,
  hanging head, slow breathing, floating zzz). A click wakes it up: startled with
  an exclamation mark, a hop, then idle. The wake-up click must not start a recording.
- Drag to move (the page reports screen coordinates, main moves the window). It
  tilts against the direction while dragged. If I shake it fast, it gets dizzy:
  spiral eyes, circling stars, swaying, then shakes it off.
- Right-click menu: open notes folder, quit.

TEST MODE (so you can check your own work without my microphone)
- WIDGET_TEST=<folder> enables it: the app clicks the character internally with
  sendInputEvent, saves a screenshot with capturePage into the folder every
  0.5 s, then quits.
- WIDGET_TEST_AUDIO=<file.wav> uses that file as a fake microphone via the
  Chromium switches use-fake-device-for-media-stream, use-fake-ui-for-media-stream
  and use-file-for-fake-audio-capture.
- WIDGET_TEST_FLOW=life triggers every idle animation once (including a fast drag
  with real mouse events) and saves a frame every 0.25 s.
- WIDGET_CONFIG=<file> loads another config, e.g. with a temporary notes folder.

HOW TO WORK
1. Ask the clarifying questions first.
2. Build it, then RUN the test mode for the dictation flow and the life flow,
   build a contact sheet from the frames with ffmpeg, and look at it. Fix what
   looks wrong before you tell me it is done.
3. Write a README: what it is, features, privacy (speech stays on my PC, audio is
   deleted after transcription), requirements, install, configuration, how to
   swap the character, how to change behaviour.
4. Keep code comments and identifiers in English. Keep the code small and readable.
   Do not publish anything and do not create any remote repository.
```

---

<a id="deutsch"></a>

## Deutscher Prompt

Ersetze vor dem Einfügen die zwei Stellen in `<spitzen Klammern>`: deine Figur und das, was beim Sprechen passieren soll.

```text
Baue mir ein kleines "sprechendes Desktop-Widget" mit Electron. Bevor du Code
schreibst, stelle mir Rückfragen (höchstens 6, kurz, in einer Nachricht) zu allem,
was unklar ist: mein Betriebssystem, wohin die Notizen sollen, welche Sprache ich
spreche und wie die Figur aussehen und sich verhalten soll. Warte auf meine
Antworten und baue dann.

DIE IDEE
Eine kleine Figur lebt auf meinem Desktop. Ich klicke sie an, spreche, und sie
macht mit meinen Worten Folgendes: <WAS SIE TUN SOLL, z. B. "als Ideen-Notiz in
einen Markdown-Ordner speichern">.
Die Figur ist: <MEINE FIGUR, z. B. "ein verschlafener Fuchs mit großem Schwanz">.

TECHNIK
- Electron-App (Hauptversion festpinnen), reines HTML/JS, kein Frontend-Framework.
- Transparentes Fenster ohne Rahmen, immer im Vordergrund, nicht in der
  Taskleiste, etwa 260 x 330 px, startet unten rechts auf dem Hauptbildschirm und
  merkt sich die Position in position.json. Nur eine Instanz.
- Die Figur ist EINE reine Funktion in character.js: Character(options) gibt einen
  SVG-String mit viewBox "-20 0 440 500" zurück. Optionen: expression (neutral,
  happy, surprised, wink, dizzy mit Spiralaugen, startled, focused, sad, shy, idea
  mit Glühbirne), eyesClosed 0..1, look [x,y] -1..1, hop, tilt, headTilt, squash,
  holdingMic, glow 0..1. Zeichne sie selbst in einem einfachen, charmanten flachen
  Stil. Keine urheberrechtlich geschützten Figuren.
- Sprache zu Text läuft LOKAL: ein Python-Worker mit faster-whisper (Modell
  large-v3-turbo, int8, CPU), der das Modell einmal lädt und per JSON-Zeilen über
  stdin/stdout spricht. Hugging-Face-Telemetrie aus. Tondateien werden direkt nach
  dem Mitschreiben gelöscht. Keine Cloud, keine API-Schlüssel.
- Notizen werden als Markdown mit Frontmatter (Tags, Datum) gespeichert, Titel aus
  den ersten Wörtern, bestehende Dateien werden nie überschrieben.
- Alle Pfade und Einstellungen kommen aus config.json (in der .gitignore) mit einer
  config.example.json: notesFolder, pythonPath, whisperModel, whisperThreads,
  language (en oder de), sleepAfterSeconds. Oberflächentexte stehen in einer
  kleinen Texttabelle für en und de.
- Sicherheit: contextIsolation an, nodeIntegration aus, Preload-Skript, strenge
  Content-Security-Policy und ein Berechtigungs-Handler, der nur "media" erlaubt.

VERHALTEN
- Klick = sie hört zu. Zustände: ask (Fragezeichen) -> listen (Mikrofon in der
  Hand, Schallwellen wachsen mit meiner Stimme, roter Aufnahmepunkt) -> think
  (drei hüpfende Punkte) -> done (Glühbirne, Haken, kurze Sprechblase mit dem
  Notiztitel) oder empty / error (trauriges Gesicht mit kurzer Meldung).
- Die Aufnahme endet von selbst nach etwa 2 Sekunden Stille, sobald ich gesprochen
  habe; sage ich 9 Sekunden nichts, kommt "nichts gehört"; harter Stopp nach
  2 Minuten.
- Leben in Ruhe: Blinzeln alle paar Sekunden, sanftes Schweben, seltene zufällige
  Launen (Zwinkern, Staunen, Lächeln, Konzentration, Idee, schüchtern), die Augen
  wandern langsam und folgen dem Mauszeiger, wenn er näher als 700 px ist (der
  Hauptprozess fragt den Zeiger alle 80 ms ab).
- Fröhlicher Hüpfer, wenn die Maus darüberfährt.
- Nach sleepAfterSeconds ohne Interaktion: gähnen, einschlafen (Augen zu, Kopf
  hängt, langsames Atmen, aufsteigende zzz). Ein Klick weckt sie: erschrocken mit
  Ausrufezeichen, ein Hüpfer, dann wieder Ruhe. Der Weck-Klick startet keine
  Aufnahme.
- Ziehen zum Verschieben (die Seite meldet Bildschirmkoordinaten, der Hauptprozess
  bewegt das Fenster). Beim Ziehen neigt sie sich gegen die Richtung. Schüttle ich
  sie schnell, wird ihr schwindlig: Spiralaugen, kreisende Sterne, Schwanken, dann
  schüttelt sie sich.
- Rechtsklick-Menü: Notizordner öffnen, Beenden.

TESTMODUS (damit du deine Arbeit ohne mein Mikrofon prüfen kannst)
- WIDGET_TEST=<Ordner> schaltet ihn ein: die App klickt die Figur intern mit
  sendInputEvent an, speichert alle 0,5 s ein Bild per capturePage in den Ordner
  und beendet sich dann.
- WIDGET_TEST_AUDIO=<datei.wav> nutzt die Datei als falsches Mikrofon über die
  Chromium-Schalter use-fake-device-for-media-stream, use-fake-ui-for-media-stream
  und use-file-for-fake-audio-capture.
- WIDGET_TEST_FLOW=life löst jede Ruhe-Animation einmal aus (auch schnelles Ziehen
  mit echten Mausereignissen) und speichert alle 0,25 s ein Bild.
- WIDGET_CONFIG=<datei> lädt eine andere Konfiguration, z. B. mit temporärem
  Notizordner.

SO ARBEITEST DU
1. Zuerst die Rückfragen stellen.
2. Bauen, dann den Testmodus für den Diktat-Ablauf UND den Leben-Ablauf LAUFEN
   lassen, mit ffmpeg einen Kontaktbogen aus den Bildern bauen und ihn ansehen.
   Behebe, was falsch aussieht, bevor du mir "fertig" sagst.
3. Schreibe eine README: was es ist, Funktionen, Datenschutz (Sprache bleibt auf
   meinem PC, Ton wird nach dem Mitschreiben gelöscht), Voraussetzungen,
   Installation, Konfiguration, Figur austauschen, Verhalten ändern.
4. Code-Kommentare und Bezeichner auf Englisch. Der Code soll klein und lesbar
   bleiben. Veröffentliche nichts und lege kein Remote-Repository an.
```
