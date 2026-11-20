// ── A still picture of a page ───────────────────────────
// snapshotPage(sheet) draws a page, exactly as it shows on screen (scrolled
// where it is), onto a canvas, so an effect can move that one picture
// instead of making the browser redraw the whole page every frame.
// Browsers can't photograph a page themselves, so it's rebuilt as a picture:
// a copy of the page and the app's own stylesheet go inside an SVG image
// (a <foreignObject>), with everything they load inlined, since an SVG image
// may load nothing of its own (the card back, the fonts); the card pictures
// are painted on after, where they show. The stylesheet and the fonts are fetched once, ahead
// of time (snapAssets, started when the app is idle), so taking a picture
// costs only the copy and the drawing.

let snapAssetsP = null;
const toDataURL = (blob) => new Promise((done, fail) => {
  const r = new FileReader();
  r.onload = () => done(r.result);
  r.onerror = fail;
  r.readAsDataURL(blob);
});
// Every url(...) in some CSS swapped for the file itself, as data.
async function inlineUrls(css, base) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");   // (not the ones in comments)
  // (nor a picture's own inner links, as in url(#l) inside an inline SVG)
  const urls = [...new Set([...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]).filter((u) => !/^(data:|#|%23)/.test(u)))];
  const data = await Promise.all(urls.map((u) => fetch(new URL(u, base)).then((r) => (r.ok ? r.blob() : null)).then((b) => b && toDataURL(b)).catch(() => null)));
  urls.forEach((u, i) => { if (data[i]) css = css.split(u).join(data[i]); });
  return css;
}
function snapAssets() {
  if (!snapAssetsP) snapAssetsP = (async () => {
    const page = await fetch("style.css").then((r) => r.text()).then((t) => inlineUrls(t, location.href)).catch(() => "");
    // The fonts: only their Latin letters (the rest the app never shows).
    let fonts = "";
    const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find((l) => l.href.includes("fonts.googleapis"));
    if (link) {
      try {
        const css = await fetch(link.href).then((r) => r.text());
        const latin = css.split("/*").filter((b) => /^\s*latin \*\//.test(b)).map((b) => b.replace(/^\s*latin \*\//, "")).join("\n");
        fonts = await inlineUrls(latin, link.href);
      } catch {}
    }
    return fonts + "\n" + page;
  })();
  return snapAssetsP;
}
// (fetched ahead, once the app has settled)
addEventListener("load", () => (window.requestIdleCallback || setTimeout)(() => snapAssets(), { timeout: 4000 }));

// The picture of `sheet` (a page fixed over the whole screen), as a canvas
// `dpr` times the screen's size. Rejects if it can't be made.
async function snapshotPage(sheet, dpr = 1) {
  const css = await snapAssets();
  const W = innerWidth, H = innerHeight;
  if (!W || !H) throw new Error("no screen to picture");
  const copy = sheet.cloneNode(true);
  // What the copy can't carry over by itself: pictures, drawings, what's typed, where it's scrolled.
  // (Pictures inside an SVG image don't reliably draw, so each is left out
  // of the copy, holding its place, and painted onto the picture after, where it shows.)
  const pics = [...sheet.querySelectorAll("img")], picsC = copy.querySelectorAll("img");
  picsC.forEach((im) => {
    im.removeAttribute("srcset");
    im.removeAttribute("src");
    im.style.visibility = "hidden";
  });
  const shown = pics.map((im) => {
    const b = im.getBoundingClientRect();
    if (!im.complete || !im.naturalWidth || b.width < 1 || b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) return null;
    if (getComputedStyle(im).visibility === "hidden") return null;
    const holder = im.parentElement, cs = getComputedStyle(im), hs = holder ? getComputedStyle(holder) : null;
    const round = parseFloat(cs.borderTopLeftRadius) || (hs && Math.abs(holder.offsetWidth - b.width) < 2 ? parseFloat(hs.borderTopLeftRadius) || 0 : 0);
    return { im, b, fit: cs.objectFit, round, flip: !!im.closest(".reversed") };
  }).filter(Boolean);
  const cvs = sheet.querySelectorAll("canvas"), cvsC = copy.querySelectorAll("canvas");
  cvsC.forEach((c, i) => {
    const im = document.createElement("img");
    try { im.src = cvs[i].toDataURL(); } catch {}
    im.className = c.className;
    im.style.cssText = c.style.cssText;
    const b = cvs[i].getBoundingClientRect();
    if (!im.style.width) im.style.width = `${b.width}px`;
    if (!im.style.height) im.style.height = `${b.height}px`;
    c.replaceWith(im);
  });
  const fields = sheet.querySelectorAll("textarea, input"), fieldsC = copy.querySelectorAll("textarea, input");
  fieldsC.forEach((f, i) => {
    if (f.tagName === "TEXTAREA") f.textContent = fields[i].value;
    else f.setAttribute("value", fields[i].value);
  });
  copy.querySelectorAll("script").forEach((s) => s.remove());
  // Laid out as it is, scrolled where it is: the whole page, moved up by
  // how far it's scrolled, seen through a window the size of the screen.
  const st = sheet.scrollTop;
  copy.classList.remove("closing", "swallowed");
  Object.assign(copy.style, { position: "absolute", left: "0", top: `${-st}px`, right: "auto", bottom: "auto",
    width: `${W}px`, height: `${st + H}px`, overflow: "hidden", transform: "none", clipPath: "none",
    maskImage: "none", webkitMaskImage: "none", visibility: "visible", zIndex: "0" });
  const bs = getComputedStyle(document.body);
  const root = document.createElement("div");
  root.className = document.documentElement.className;
  Object.assign(root.style, { position: "relative", width: `${W}px`, height: `${H}px`, overflow: "hidden",
    background: bs.backgroundColor, color: bs.color, fontFamily: bs.fontFamily, fontSize: bs.fontSize, lineHeight: bs.lineHeight });
  const style = document.createElement("style");
  style.textContent = css;
  root.append(style, copy);
  const xhtml = new XMLSerializer().serializeToString(root);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject x="0" y="0" width="100%" height="100%">${xhtml}</foreignObject></svg>`;
  const img = new Image();
  img.width = W; img.height = H;
  // (its load, not decode(): the load waits for the pictures inside it too)
  const loaded = new Promise((done, fail) => { img.onload = done; img.onerror = fail; });
  img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    await loaded;
    const c = document.createElement("canvas");
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0, c.width, c.height);
    x.scale(dpr, dpr);
    shown.forEach(({ im, b, fit, round, flip }) => {
      x.save();
      x.translate(b.left + b.width / 2, b.top + b.height / 2);
      if (flip) x.rotate(Math.PI);   // (a reversed card's picture, upside down)
      x.beginPath();
      x.roundRect ? x.roundRect(-b.width / 2, -b.height / 2, b.width, b.height, round) : x.rect(-b.width / 2, -b.height / 2, b.width, b.height);
      x.clip();
      let sx = 0, sy = 0, sw = im.naturalWidth, sh = im.naturalHeight;
      if (fit === "cover") {
        const k = Math.max(b.width / sw, b.height / sh);
        sx = (sw - b.width / k) / 2; sy = (sh - b.height / k) / 2; sw = b.width / k; sh = b.height / k;
      }
      x.drawImage(im, sx, sy, sw, sh, -b.width / 2, -b.height / 2, b.width, b.height);
      x.restore();
    });
    return c;
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
