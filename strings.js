// All user-facing texts, in English and German. Add a language by adding a key.
// Loaded by main.js (require) and by widget.html (script tag).
(function () {
  const STRINGS = {
    en: {
      tooltip: "Click: dictate an idea | drag: move | right-click: menu",
      listening: "listening",
      noMic: "I can't reach the <b>microphone</b>. Is it plugged in?",
      heardNothing: "I heard <b>nothing</b>. Click me again.",
      writing: "Writing it down ...",
      writingLong: "Writing it down ... <b>almost done</b>",
      saved: "Noted!",
      notUnderstood: "I did <b>not understand</b> that. Again?",
      oops: "Oops: ",
      menuOpenNotes: "Open notes folder",
      menuQuit: "Quit",
      whisperStopped: "Whisper stopped unexpectedly",
      pythonFailed: "Could not start Python. Check pythonPath in config.json.",
      saveFailed: "Could not save the note: ",
      notePrefix: "Idea",
      noteFallbackTitle: "Idea",
      noteFooter: (date, time) => `*Dictated on ${date} at ${time}, transcribed locally with Whisper.*`,
    },
    de: {
      tooltip: "Klick: Idee diktieren | ziehen: verschieben | Rechtsklick: Menü",
      listening: "hört zu",
      noMic: "Ich komme nicht ans <b>Mikrofon</b>. Ist es angeschlossen?",
      heardNothing: "Ich habe <b>nichts gehört</b>. Klick mich nochmal an.",
      writing: "Ich schreibe mit ...",
      writingLong: "Ich schreibe mit ... <b>gleich fertig</b>",
      saved: "Notiert!",
      notUnderstood: "Das habe ich <b>nicht verstanden</b>. Nochmal?",
      oops: "Hoppla: ",
      menuOpenNotes: "Notizordner öffnen",
      menuQuit: "Beenden",
      whisperStopped: "Whisper wurde beendet",
      pythonFailed: "Python konnte nicht gestartet werden. Prüfe pythonPath in config.json.",
      saveFailed: "Notiz konnte nicht gespeichert werden: ",
      notePrefix: "Idee",
      noteFallbackTitle: "Idee",
      noteFooter: (date, time) => `*Diktiert am ${date} um ${time} Uhr, lokal mit Whisper mitgeschrieben.*`,
    },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = STRINGS;
  else window.STRINGS = STRINGS;
})();
