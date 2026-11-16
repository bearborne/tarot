// A reading as one picture to save or send: its name and date, the cards
// in a row (reversed ones upside down), each card's name and key word,
// on the app's dark ground with a thin gold frame.

const SHARE_W = 1080, SHARE_H = 1350;

function loadPicture(src) {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = src;
  });
}

// Wraps text to at most `lines` lines of `max` px; the last one ends in "…" if cut.
function wrapLines(ctx, text, max, lines = 2) {
  const out = [];
  let line = "";
  for (const w of text.split(" ")) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= max || !line) line = next;
    else { out.push(line); line = w; }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    out.length = lines;
    while (ctx.measureText(`${out[lines - 1]}…`).width > max) out[lines - 1] = out[lines - 1].slice(0, -1);
    out[lines - 1] += "…";
  }
  return out;
}

async function readingPicture(entries, title, t = Date.now()) {
  const cv = document.createElement("canvas");
  cv.width = SHARE_W;
  cv.height = SHARE_H;
  const ctx = cv.getContext("2d");
  const gold = "#c9a96e", ink = "#e9e2d3", muted = "#a79f8f";
  const fell = '"IM Fell English SC", Georgia, serif', read = 'Literata, Georgia, serif';
  await Promise.all([`64px ${fell}`, `30px ${read}`].map((f) => document.fonts?.load(f).catch(() => {})));

  ctx.fillStyle = "#15131c";
  ctx.fillRect(0, 0, SHARE_W, SHARE_H);
  // Two gold hairlines round the edge.
  ctx.strokeStyle = gold;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, SHARE_W - 72, SHARE_H - 72);
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, SHARE_W - 96, SHARE_H - 96);
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";

  // The name and the date.
  ctx.fillStyle = gold;
  ctx.font = `64px ${fell}`;
  const head = wrapLines(ctx, title, SHARE_W - 200, 2);
  head.forEach((l, i) => ctx.fillText(l, SHARE_W / 2, 170 + i * 72));
  ctx.fillStyle = muted;
  ctx.font = `28px ${read}`;
  const below = 170 + (head.length - 1) * 72 + 56;
  ctx.fillText(dateText(t), SHARE_W / 2, below);

  // The cards: one row up to three, then rows of two or three (the picture is tall).
  const n = entries.length;
  const cols = n <= 3 ? n : n === 4 ? 2 : 3, rows = Math.ceil(n / cols);
  const gap = 28, side = 110;
  const top = below + 70, bottom = SHARE_H - 150;
  const textH = 124;
  const cw = Math.min(300, (SHARE_W - 2 * side - (cols - 1) * gap) / cols,
    ((bottom - top) / rows - textH) * (7 / 12));
  const ch = cw * (12 / 7);
  const rowH = ch + textH;
  const startY = top + ((bottom - top) - rows * rowH) / 2;
  const pics = await Promise.all(entries.map((e) => (e.card.image ? loadPicture(e.card.image) : null)));
  entries.forEach((e, i) => {
    const r = Math.floor(i / cols), inRow = r === rows - 1 ? n - r * cols : cols;
    const c = i - r * cols;
    const x = SHARE_W / 2 + (c - (inRow - 1) / 2) * (cw + gap) - cw / 2;
    const y = startY + r * rowH;
    ctx.save();
    ctx.translate(x + cw / 2, y + ch / 2);
    if (e.reversed) ctx.rotate(Math.PI);
    if (pics[i]) ctx.drawImage(pics[i], -cw / 2, -ch / 2, cw, ch);
    else { ctx.fillStyle = "#efe7d6"; ctx.fillRect(-cw / 2, -ch / 2, cw, ch); }
    ctx.restore();
    ctx.strokeStyle = gold;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, cw, ch);
    ctx.globalAlpha = 1;
    // Its name (two lines at most; upside down already says reversed),
    // then its key word in gold, level across the row.
    const size = Math.max(20, Math.min(28, cw / 7));
    ctx.fillStyle = ink;
    ctx.font = `${size}px ${read}`;
    const names = wrapLines(ctx, e.card.name, cw + gap - 6, 2);
    names.forEach((l, k) => ctx.fillText(l, x + cw / 2, y + ch + 36 + k * (size + 6)));
    const kw = linkedKeyword(e, entries);
    if (kw) {
      ctx.fillStyle = gold;
      ctx.font = `italic ${size - 2}px ${read}`;
      ctx.fillText(wrapLines(ctx, kw, cw + gap - 6, 1)[0], x + cw / 2, y + ch + 36 + 2 * (size + 6) + 4);
    }
  });

  ctx.fillStyle = gold;
  ctx.globalAlpha = 0.8;
  ctx.font = `34px ${fell}`;
  ctx.fillText("Bearcana", SHARE_W / 2, SHARE_H - 84);
  ctx.globalAlpha = 1;
  return new Promise((ok) => cv.toBlob(ok, "image/png"));
}

// The share sheet on a phone; a download on a computer.
async function shareReading(entries, title, t) {
  const blob = await readingPicture(entries, title, t);
  if (!blob) { toast("Couldn't make the picture"); return; }
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "reading";
  const file = new File([blob], `bearcana-${slug}.png`, { type: "image/png" });
  if (!canHover && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  const url = URL.createObjectURL(file);
  const a = el("a");
  a.href = url;
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// A short note at the foot of the screen, like "Copied".
function toast(text) {
  const t = el("div", "copy-note", text);
  t.style.zIndex = ++Z + 10;
  document.body.append(t);
  setTimeout(() => t.classList.add("gone"), 1400);
  setTimeout(() => t.remove(), 1800);
}
