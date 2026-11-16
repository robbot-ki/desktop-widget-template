// Placeholder character: "Blobby", a round friendly blob with two eyes and a mouth.
// Replace this file with your own character (see README, "Swap the character").
//
// Contract: window.Character(options) returns an SVG string with viewBox "-20 0 440 500".
// The widget calls it about 30 times per second, so keep it cheap and pure.
//
// Options (all optional):
//   expression   "neutral" | "happy" | "surprised" | "wink" | "dizzy" | "startled" |
//                "focused" | "sad" | "shy" | "idea"
//   eyesClosed   0..1   blink amount for open-eye expressions
//   look         [x, y] each -1..1, where the eyes look
//   hop          pixels (SVG units) the whole body is lifted
//   tilt         degrees, whole body, pivot at the feet
//   headTilt     degrees, face only
//   squash       0..1   squash the body (landing, sleeping breath)
//   holdingMic   bool   holds a small microphone
//   glow         0..1   inner light, grows with your voice while listening
(function () {
  const INK = "#26344a";      // outline and eyes
  const BODY = "#8fe3d0";     // body fill
  const BODY_DARK = "#6fcdb8";
  const CHEEK = "#ff9fb2";

  const f = n => (Math.round(n * 10) / 10).toString();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Spiral for the dizzy eyes, rotating slowly with the clock.
  function spiral(cx, cy, turns, radius, rot) {
    let d = "";
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, a = rot + t * turns * Math.PI * 2, r = t * radius;
      d += (i ? "L" : "M") + f(cx + Math.cos(a) * r) + " " + f(cy + Math.sin(a) * r);
    }
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  function Character(o) {
    o = o || {};
    const ex = o.expression || "neutral";
    const closed = clamp(o.eyesClosed || 0, 0, 1);
    const lk = o.look || [0, 0];
    const lx = clamp(lk[0], -1, 1), ly = clamp(lk[1], -1, 1);
    const hop = o.hop || 0, tilt = o.tilt || 0, headTilt = o.headTilt || 0;
    const squash = clamp(o.squash || 0, 0, 0.5);
    const glow = clamp(o.glow || 0, 0, 1);
    const clock = Date.now() / 1000;

    const EY = 272, EXL = 150, EXR = 250;      // eye line and eye centers
    const sx = lx * 7, sy = ly * 5;            // pupil shift

    // ----- eyes -----
    const dot = (cx, ry = 21, rx = 15) => {
      const h = Math.max(2.2, ry * (1 - closed));
      return `<ellipse cx="${f(cx + sx)}" cy="${f(EY + sy)}" rx="${rx}" ry="${f(h)}" fill="${INK}"/>` +
        (closed < 0.5 ? `<circle cx="${f(cx + sx - 5)}" cy="${f(EY + sy - 8)}" r="5" fill="#fff"/>` : "");
    };
    const arcUp = cx => `<path d="M${cx - 17} ${EY + 7} Q${cx} ${EY - 17} ${cx + 17} ${EY + 7}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    const wide = (cx, pupil) => {
      const h = Math.max(2.5, 27 * (1 - closed));
      return `<ellipse cx="${cx}" cy="${EY}" rx="26" ry="${f(h)}" fill="#fff" stroke="${INK}" stroke-width="4"/>` +
        (closed < 0.5 ? `<circle cx="${f(cx + sx * 1.2)}" cy="${f(EY + sy * 1.2)}" r="${pupil}" fill="${INK}"/>` : "");
    };

    let eyes = "", mouth = "", extra = "", bulb = "", cheeks = 0.35;
    const smile = `<path d="M176 333 Q200 352 224 333" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;

    switch (ex) {
      case "happy":
        eyes = arcUp(EXL) + arcUp(EXR);
        mouth = `<path d="M170 328 Q200 372 230 328 Z" fill="#c84b63" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>` +
          `<path d="M184 343 Q200 356 216 343 Q200 338 184 343Z" fill="#ff8da3"/>`;
        cheeks = 0.7;
        break;
      case "surprised":
        eyes = wide(EXL, 9) + wide(EXR, 9);
        mouth = `<ellipse cx="200" cy="344" rx="12" ry="15" fill="#c84b63" stroke="${INK}" stroke-width="5"/>`;
        break;
      case "wink":
        eyes = dot(EXL) + `<path d="M${EXR - 17} ${EY - 8} L${EXR + 14} ${EY + 2} L${EXR - 17} ${EY + 12}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
        mouth = `<path d="M174 331 Q204 358 230 328" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
        cheeks = 0.55;
        break;
      case "dizzy": {
        const rot = clock * 5;
        eyes = spiral(EXL, EY, 2.6, 22, rot) + spiral(EXR, EY, 2.6, 22, -rot);
        mouth = `<path d="M172 338 Q186 326 200 338 T228 338" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
        break;
      }
      case "startled":
        eyes = wide(EXL, 5) + wide(EXR, 5);
        mouth = `<ellipse cx="200" cy="348" rx="17" ry="20" fill="#c84b63" stroke="${INK}" stroke-width="5"/>`;
        extra = `<path d="M118 226 L142 232 M282 226 L258 232" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
        cheeks = 0.1;
        break;
      case "focused":
        eyes = dot(EXL, 14, 15) + dot(EXR, 14, 15);
        extra = `<path d="M124 240 L172 248 M276 240 L228 248" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
        mouth = `<path d="M184 340 L216 340" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
        cheeks = 0.2;
        break;
      case "sad":
        eyes = dot(EXL, 22, 15) + dot(EXR, 22, 15);
        extra = `<path d="M128 246 L170 232 M272 246 L230 232" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` +
          `<path d="M262 300 q-7 12 0 18 q7 -6 0 -18Z" fill="#7cc4ff" stroke="${INK}" stroke-width="2.5"/>`;
        mouth = `<path d="M176 350 Q200 326 224 350" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
        cheeks = 0.15;
        break;
      case "shy":
        eyes = dot(EXL - 2, 12, 14).replace(/cy="[^"]+"/, `cy="${EY + 8 + sy}"`) +
          dot(EXR - 2, 12, 14).replace(/cy="[^"]+"/, `cy="${EY + 8 + sy}"`);
        mouth = `<path d="M184 338 Q192 346 200 338 Q208 346 216 338" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
        cheeks = 1;
        break;
      case "idea": {
        eyes = dot(EXL, 22, 16) + dot(EXR, 22, 16);
        mouth = `<path d="M172 328 Q200 366 228 328 Z" fill="#c84b63" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
        const pulse = 0.7 + 0.3 * Math.sin(clock * 6);
        let rays = "";
        for (let i = -2; i <= 2; i++) {
          const a = (-90 + i * 36) * Math.PI / 180;
          rays += `<line x1="${f(200 + Math.cos(a) * 36)}" y1="${f(48 + Math.sin(a) * 36)}" x2="${f(200 + Math.cos(a) * (46 + 8 * pulse))}" y2="${f(48 + Math.sin(a) * (46 + 8 * pulse))}" stroke="#f2b01e" stroke-width="5" stroke-linecap="round"/>`;
        }
        bulb = rays +
          `<circle cx="200" cy="48" r="26" fill="#ffe066" stroke="${INK}" stroke-width="5"/>` +
          `<rect x="188" y="72" width="24" height="14" rx="4" fill="#cfd6df" stroke="${INK}" stroke-width="4"/>` +
          `<path d="M192 40 Q200 30 208 40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>`;
        cheeks = 0.6;
        break;
      }
      default: // neutral
        eyes = dot(EXL) + dot(EXR);
        mouth = smile;
    }

    // face group: shifts slightly toward where it looks, tilts with headTilt
    const face =
      `<g transform="translate(${f(lx * 6)} ${f(ly * 3)}) rotate(${f(headTilt)} 200 300)">` +
      `<ellipse cx="112" cy="318" rx="20" ry="12" fill="${CHEEK}" opacity="${cheeks}"/>` +
      `<ellipse cx="288" cy="318" rx="20" ry="12" fill="${CHEEK}" opacity="${cheeks}"/>` +
      eyes + extra + mouth + `</g>`;

    // (the idea bulb is drawn outside the face group, so it does not rotate with the face)

    // body: soft blob with a lighter belly, small feet, stub arms
    const body =
      `<ellipse cx="150" cy="468" rx="34" ry="14" fill="${BODY_DARK}" stroke="${INK}" stroke-width="5"/>` +
      `<ellipse cx="250" cy="468" rx="34" ry="14" fill="${BODY_DARK}" stroke="${INK}" stroke-width="5"/>` +
      `<ellipse cx="48" cy="350" rx="20" ry="30" fill="${BODY}" stroke="${INK}" stroke-width="5" transform="rotate(18 48 350)"/>` +
      (o.holdingMic ? "" : `<ellipse cx="352" cy="350" rx="20" ry="30" fill="${BODY}" stroke="${INK}" stroke-width="5" transform="rotate(-18 352 350)"/>`) +
      `<path d="M200 96 C302 96 348 190 348 300 C348 404 304 462 200 462 C96 462 52 404 52 300 C52 190 98 96 200 96 Z" fill="url(#bb)" stroke="${INK}" stroke-width="6"/>` +
      `<ellipse cx="200" cy="376" rx="92" ry="58" fill="#fff" opacity="${f(0.18 + 0.55 * glow)}"/>` +
      `<path d="M118 160 Q140 124 176 114" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".55"/>`;

    // microphone in the right hand (viewer's left), raised toward the face
    const mic = o.holdingMic
      ? `<g transform="rotate(-14 340 300)">` +
        `<ellipse cx="352" cy="352" rx="20" ry="30" fill="${BODY}" stroke="${INK}" stroke-width="5" transform="rotate(-18 352 352)"/>` +
        `<rect x="338" y="296" width="28" height="48" rx="10" fill="${INK}"/>` +
        `<rect x="330" y="262" width="44" height="42" rx="21" fill="#dfe6ee" stroke="${INK}" stroke-width="5"/>` +
        `<path d="M336 276 H368 M336 288 H368" stroke="${INK}" stroke-width="3" opacity=".5"/>` +
        `</g>`
      : "";

    const halo = glow > 0.02
      ? `<circle cx="200" cy="300" r="${f(215 + glow * 20)}" fill="url(#hg)" opacity="${f(glow * 0.9)}"/>`
      : "";

    const shadowW = 120 - Math.min(40, hop * 2);
    const shadow = `<ellipse cx="200" cy="482" rx="${f(shadowW)}" ry="9" fill="#000" opacity="${f(Math.max(0.05, 0.16 - hop * 0.004))}"/>`;

    // squash around the feet (200, 480), tilt around the feet, hop lifts everything
    const sxs = 1 + squash * 0.5, sys = 1 - squash;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 0 440 500" overflow="visible">` +
      `<defs>` +
      `<linearGradient id="bb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9efdf"/><stop offset="1" stop-color="${BODY_DARK}"/></linearGradient>` +
      `<radialGradient id="hg"><stop offset="0" stop-color="#fff3a8" stop-opacity=".9"/><stop offset="1" stop-color="#fff3a8" stop-opacity="0"/></radialGradient>` +
      `</defs>` +
      shadow +
      `<g transform="translate(0 ${f(-hop)}) rotate(${f(tilt)} 200 480) translate(200 480) scale(${sxs.toFixed(3)} ${sys.toFixed(3)}) translate(-200 -480)">` +
      halo + body + mic + face + bulb + `</g></svg>`;
  }

  window.Character = Character;
})();
