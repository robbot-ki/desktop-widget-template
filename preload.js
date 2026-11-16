// Bridge between the widget page and the main process (context isolation stays on).
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("widget", {
  recording: buffer => ipcRenderer.invoke("recording", buffer),
  settings: () => ipcRenderer.invoke("settings"),
  warmUp: () => ipcRenderer.send("warm-up"),
  dragStart: p => ipcRenderer.send("drag-start", p),
  drag: p => ipcRenderer.send("drag", p),
  dragEnd: () => ipcRenderer.send("drag-end"),
  menu: () => ipcRenderer.send("menu"),
  onMouse: callback => ipcRenderer.on("mouse", (_e, m) => callback(m)),
});
