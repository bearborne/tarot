// Your history, the daily-card calendar, backup reminder and backups.
// Part of the app; the files in js/ load in the order listed in index.html.

// ── 6. Your history ─────────────────────────────────────

// The history is grouped by month. Only open months draw their cards, so a
// long history stays quick; a strip of months at the top jumps to any of them.
// Two lists share the screen: readings, and each day's card of the day.
// days: the days unfolded in the readings list (they start folded).
const HIST = { open: new Set(), days: new Set(), mode: "readings" };
const COTD_SPREAD = "Card of the day";
const monthKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}`; };
const monthName = (t, long) => new Date(t).toLocaleDateString("en-GB",
  { month: long ? "long" : "short", year: long || new Date(t).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
const dayName = (t) => new Date(t).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

function renderHistory() {
  const box = $("historyList");
  box.innerHTML = "";
  const daily = HIST.mode === "cotd";
  const tabs = () => document.querySelectorAll("#histTabs .chip").forEach((c) => {
    c.classList.toggle("on", c.dataset.mode === HIST.mode);
    c.setAttribute("aria-pressed", c.dataset.mode === HIST.mode);
  });
  if (HIST.mode === "patterns") {   // counted across everything, no search
    tabs();
    $("histSearchWrap").hidden = true;
    renderPatterns(box);
    return;
  }
  document.querySelectorAll("#histTabs .chip").forEach((c) => {
    c.classList.toggle("on", c.dataset.mode === HIST.mode);
    c.setAttribute("aria-pressed", c.dataset.mode === HIST.mode);
  });
  let readings = loadHistory().sort((a, b) => b.t - a.t)
    .filter((r) => (r.spread === COTD_SPREAD) === daily);
  if (daily) {   // one card a day: if it was drawn again that day, the last one counts
    const seen = new Set();
    readings = readings.filter((r) => { const d = dayName(r.t) + new Date(r.t).getFullYear(); return !seen.has(d) && seen.add(d); });
  }
  $("clearHistBtn").hidden = !loadHistory().length;
  $("histSearch").placeholder = daily ? "Search by card or date" : "Search by name, card, note or date";
  showBackupNudge();
  if (!readings.length) {
    $("histSearchWrap").hidden = true;
    box.append(el("p", "empty-note history-empty", daily
      ? "Each day's card will appear here once you've revealed one."
      : "Your readings will appear here once you've drawn some cards."));
    return;
  }
  $("histSearchWrap").hidden = false;
  if (daily) {
    const st = cotdStreak();
    if (st.longest > 1) box.append(el("p", "search-count streak",
      st.now > 1 ? `${st.now}-day streak · longest ${st.longest}` : `Longest streak ${st.longest} days`));
  }

  // Searching: every word typed must be found somewhere in the reading.
  const words = fold($("histSearch").value).split(/\s+/).filter(Boolean);
  const searching = words.length > 0;
  if (searching) {
    readings = readings.filter((r) => { const text = searchText(r); return words.every((w) => text.includes(w)); });
    const n = readings.length;
    box.append(el("p", "search-count", n ? `${n} found` : "Nothing found"));
    if (!n) return;
  }
  const months = [];
  readings.forEach((r) => {
    const key = monthKey(r.t);
    if (months.at(-1)?.key !== key) months.push({ key, t: r.t, list: [] });
    months.at(-1).list.push(r);
  });
  if (!HIST.open.size) HIST.open.add(months[0].key);   // the newest month starts open
  const isOpen = (key) => searching || HIST.open.has(key);   // what's found is all shown

  // The strip of months, kept at the top while scrolling.
  if (months.length > 1) {
    const strip = el("nav", "month-strip");
    strip.setAttribute("aria-label", "Jump to a month");
    months.forEach((m) => {
      const chip = el("button", "month-chip");
      chip.append(el("span", "", monthName(m.t)), el("span", "month-count", String(m.list.length)));
      chip.dataset.key = m.key;
      chip.addEventListener("click", () => openMonth(m.key));
      strip.append(chip);
    });
    box.append(strip);
  }

  months.forEach((m) => {
    const sec = el("section", "month");
    sec.dataset.key = m.key;
    const head = el("button", "month-head");
    const n = m.list.length;
    const rev = daily ? m.list.filter((r) => r.cards[0]?.rev).length : 0;
    head.append(el("span", "month-name", monthName(m.t, true)), el("span", "month-count", daily
      ? `${n === 1 ? "1 day" : `${n} days`}${rev ? ` · ${rev} reversed` : ""}`
      : n === 1 ? "1 reading" : `${n} readings`));
    const body = el("div", daily ? "month-body cal" : "month-body");
    const fill = () => {
      if (body.childElementCount) return;
      if (daily) { fillDays(body, m.list); return; }
      // One folded row per day; what's found while searching is shown open.
      const days = [];
      m.list.forEach((r) => {
        const d = dayName(r.t);
        if (days.at(-1)?.d !== d) days.push({ d, list: [] });
        days.at(-1).list.push(r);
      });
      days.forEach(({ d, list }) => body.append(dayRow(d, list, searching)));
    };
    const set = (open) => {
      sec.classList.toggle("open", open);
      head.setAttribute("aria-expanded", open);
      body.hidden = !open;
      if (open) fill();
      if (!searching) open ? HIST.open.add(m.key) : HIST.open.delete(m.key);
    };
    head.addEventListener("click", () => set(body.hidden));
    sec.append(head, body);
    box.append(sec);
    set(isOpen(m.key));
  });
  requestAnimationFrame(markMonthHere);
}

// Lower case, without accents, so "hermit" finds "The Hermit".
const fold = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Everything a reading can be found by: its name, spread, cards, places
// and date ("14 november 2026 saturday", "nov").
function searchText(r) {
  const d = new Date(r.t);
  const bits = [r.spread === COTD_SPREAD ? "" : readingTitle(r), r.spread,
    d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    d.toLocaleDateString("en-GB", { month: "short" })];
  r.cards.forEach((c) => bits.push(c.name, c.rev ? "reversed" : "", c.label || ""));
  bits.push(r.note || "", r.lookback || "");
  return fold(bits.join(" "));
}

let searchTimer = 0;
$("histSearch").addEventListener("input", () => {
  $("histSearchClear").hidden = !$("histSearch").value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { $("history").scrollTop = 0; renderHistory(); }, 120);
});
$("histSearchClear").addEventListener("click", () => {
  $("histSearch").value = "";
  $("histSearchClear").hidden = true;
  renderHistory();
  $("histSearch").focus();
});

// A day of readings, folded to one line: the date, how many, and a small
// fan of the day's cards. Tap to unfold it into the readings themselves.
function dayRow(d, list, open) {
  const day = el("details", "history-dayrow");
  const key = new Date(list[0].t).toDateString();
  day.open = open || HIST.days.has(key);
  const sum = el("summary");
  const n = list.length;
  const fan = el("span", "day-fan");
  fan.setAttribute("aria-hidden", "true");
  const cards = list.flatMap((r) => readingCards(r));
  cards.slice(0, 6).forEach((c) => fan.append(cardFace(c.card, true, c.reversed)));
  if (cards.length > 6) fan.append(el("span", "day-more", `+${cards.length - 6}`));
  sum.append(el("span", "day-date", d), fan, el("span", "day-count", n === 1 ? "1 reading" : `${n} readings`));
  const body = el("div", "day-body");
  const fill = () => { if (!body.childElementCount) list.forEach((r) => body.append(readingItem(r))); };
  if (day.open) fill();
  day.addEventListener("toggle", () => {
    if (day.open) fill();
    if (open) return;   // opened by a search: folds again once it's cleared
    if (day.open) HIST.days.add(key); else HIST.days.delete(key);
  });
  day.append(sum, body);
  return day;
}

// A month of daily cards as a grid, newest first; tap one to open it and
// swipe through the rest of that month.
function fillDays(body, list) {
  const days = list.map((r) => ({ r, c: r.cards[0], card: CARDS.find((x) => x.name === r.cards[0]?.name) }))
    .filter((x) => x.card);
  // Oldest first, so swiping goes through the month like the calendar.
  days.reverse();
  const items = days.map(({ r, c, card }) => detailsItem(card, !!c.rev, `Card of the day · ${dayName(r.t)}`));
  const byDate = new Map(days.map((d, i) => [new Date(d.r.t).getDate(), i]));
  // The month as a calendar, Monday first; days without a card stay empty.
  const first = new Date(days[0]?.r.t || Date.now());
  const y = first.getFullYear(), mo = first.getMonth();
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7;
  const total = new Date(y, mo + 1, 0).getDate();
  const today = new Date();
  ["M", "T", "W", "T", "F", "S", "S"].forEach((w) => body.append(el("span", "cal-head", w)));
  for (let k = 0; k < lead; k++) body.append(el("span", "cal-blank"));
  for (let d = 1; d <= total; d++) {
    const i = byDate.get(d);
    const isToday = today.getFullYear() === y && today.getMonth() === mo && today.getDate() === d;
    if (i == null) {
      body.append(el("span", `cal-day empty${isToday ? " today" : ""}`, String(d)));
      continue;
    }
    const { r, c, card } = days[i];
    const b = el("button", `cal-day${isToday ? " today" : ""}`);
    const face = cardFace(card, true, !!c.rev);
    b.append(el("span", "cal-num", String(d)), face);
    b.setAttribute("aria-label", `${dayName(r.t)}: ${card.name}${c.rev ? ", reversed" : ""}`);
    b.title = c.rev ? `${card.name}, reversed` : card.name;
    b.addEventListener("click", () => openDetails(items, i));
    body.append(b);
  }
}

// Days in a row with a card of the day: the run up to today (or
// yesterday, while today's is still to come), and the longest ever.
function cotdStreak() {
  const key = (t) => { const d = new Date(t); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5; };
  const days = [...new Set(loadHistory().filter((r) => r.spread === COTD_SPREAD).map((r) => key(r.t)))].sort((a, b) => a - b);
  let longest = 0, run = 0;
  days.forEach((d, i) => { run = i && d === days[i - 1] + 1 ? run + 1 : 1; longest = Math.max(longest, run); });
  const last = days.at(-1), now = key(Date.now());
  return { now: last === now || last === now - 1 ? run : 0, longest };
}

// ── Backup reminder ─────────────────────────────────────
// A quiet line when readings have piled up since the last backup.
const BACKUP_KEY = "tarot-backup-at";
function backedUp() {
  try { localStorage.setItem(BACKUP_KEY, String(Date.now())); } catch {}
  showBackupNudge();
}
function backupDue() {
  const at = +readJSON(BACKUP_KEY, 0) || 0;
  const since = loadHistory().filter((r) => r.t > at).length;
  const days = at ? Math.floor((Date.now() - at) / 864e5) : null;
  if (since < 5 || (days != null && days < 14)) return null;
  return days == null ? "No backup yet" : `Last backup ${days} days ago`;
}
function showBackupNudge() {
  const due = backupDue();
  // The history's backup line says so in gold, in place of "Saved on this device only".
  $("backupText").textContent = due || "Saved on this device only";
  $("backupText").classList.toggle("due", !!due);
  // On the home screen only once it's been a month or more (or never).
  const late = due && (due.startsWith("No") || +due.match(/\d+/)[0] >= 30);
  $("homeNudge").hidden = !late;
}

document.querySelectorAll("#histTabs .chip").forEach((c) => c.addEventListener("click", () => {
  if (HIST.mode === c.dataset.mode) return;
  HIST.mode = c.dataset.mode;
  HIST.open.clear();
  renderHistory();
}));

// Opens a month and brings its heading to the top, under the strip.
function openMonth(key) {
  const sec = document.querySelector(`#historyList .month[data-key="${key}"]`);
  if (!sec) return;
  if (!sec.classList.contains("open")) sec.querySelector(".month-head").click();
  const sheet = $("history"), strip = document.querySelector("#historyList .month-strip");
  const top = sec.getBoundingClientRect().top - sheet.getBoundingClientRect().top + sheet.scrollTop
    - (strip ? strip.offsetHeight + 8 : 0);
  sheet.scrollTo({ top, behavior: calm ? "auto" : "smooth" });
}

// Marks the month being read in the strip, and keeps its chip in view.
function markMonthHere() {
  const strip = document.querySelector("#historyList .month-strip");
  if (!strip) return;
  const line = strip.getBoundingClientRect().bottom + 12;
  let key = null;
  document.querySelectorAll("#historyList .month").forEach((s) => {
    if (!key || s.getBoundingClientRect().top <= line) key = s.dataset.key;
  });
  strip.querySelectorAll(".month-chip").forEach((c) => {
    const here = c.dataset.key === key;
    if (here && !c.classList.contains("here") && strip.scrollWidth > strip.clientWidth) {
      strip.scrollTo({ left: c.offsetLeft - (strip.clientWidth - c.offsetWidth) / 2, behavior: calm ? "auto" : "smooth" });
    }
    c.classList.toggle("here", here);
  });
}
let monthTick = 0;
$("history").addEventListener("scroll", () => {
  if (!monthTick) monthTick = requestAnimationFrame(() => { monthTick = 0; markMonthHere(); });
}, { passive: true });

function readingItem(r) {
  const item = el("div", "reading");
  const head = el("div", "reading-head");
  // The reading's name (tap to rename), with its time and spread beneath.
  const who = el("div", "reading-who");
  const name = el("button", "reading-name");
  const showName = () => {
    name.replaceChildren(el("span", "reading-name-text", readingTitle(r)), el("span", "rename-mark", "✎"));
    name.setAttribute("aria-label", `${readingTitle(r)}. Tap to rename`);
  };
  showName();
  name.addEventListener("click", () => renameInPlace(name, readingTitle(r), (title) => {
    if (!updateReading(r.id, { title })) return;
    r.title = title;
    showName();
  }, nameIdeas(readingCards(r))));
  who.append(name, el("span", "reading-meta", `${timeText(r.t)} · ${r.spread}`));
  head.append(who);
  const remove = el("button", "link small", "Remove");
  remove.addEventListener("click", () => {
    if (!confirm("Remove this reading from your history?")) return;
    removeReading(r.id);
    renderHistory();
  });
  // The cards, in order; tap one to open its page and swipe through the reading.
  const known = r.cards.map((c) => ({ c, card: CARDS.find((x) => x.name === c.name) })).filter((x) => x.card);
  const items = known.map(({ c, card }) => detailsItem(card, !!c.rev, c.label && c.label !== "Your card" ? c.label : ""));

  const actions = el("span", "reading-actions");
  if (known.length) {
    const sum = el("button", "link small gold", "Summary");
    // The spread's questions, if it still exists and has them.
    // (A themed reading keeps its own questions.)
    const positions = (SPREADS.find((sp) => sp.name === r.spread) || {}).positions || [];
    sum.addEventListener("click", () => {
      const entries = items.map((it, i) => ({ card: it.card, reversed: it.reversed, label: it.label,
        question: known[i].c.question || (positions[i] || {}).question || "" }));
      summonSummary((magic) => openSummary(entries, readingTitle(r), magic, {
        id: r.id,
        onRename: (title) => { r.title = title; showName(); },
      }));
    });
    actions.append(sum);
  }
  actions.append(remove);
  head.append(actions);
  const row = el("div", "related-row");
  known.forEach(({ c, card }, i) => {
    const b = el("button", "related-card");
    const pic = el("div", "related-pic");
    const face = cardFace(card, true, !!c.rev);
    face.style.height = "100%";
    pic.append(face);
    if (items[i].label) b.append(el("span", "related-label", items[i].label));
    b.append(pic, el("span", "related-name", c.rev ? `${card.name}, reversed` : card.name));
    b.setAttribute("aria-label", `${c.label ? c.label + ": " : ""}${card.name}${c.rev ? ", reversed" : ""}`);
    b.addEventListener("click", () => openDetails(items, i));
    row.append(b);
  });
  item.append(head, row);
  // The reading's own note, in short, under its cards.
  const said = (r.note || "").trim() || (r.lookback || "").trim();
  if (said) item.append(el("p", "reading-note", said.length > 140 ? `${said.slice(0, 140).trim()}…` : said));
  return item;
}

$("historyBtn").addEventListener("click", () => {
  HIST.open.clear();
  $("history").scrollTop = 0;
  $("histSearch").value = "";
  $("histSearchClear").hidden = true;
  renderHistory();
  slideIn($("history"));
});
$("historyBack").addEventListener("click", async () => {
  await slideOut($("history"));
  $("history").hidden = true;
});

// ── Backups ─────────────────────────────────────────────

// Everything worth keeping: readings, card notes and your own themes.
function backupData() {
  return {
    app: "Bearcana",
    version: 1,
    exported: new Date().toISOString(),
    history: loadHistory(),
    notes: loadNotes(),
    themes: loadOwnThemes(),
  };
}

async function exportBackup() {
  const data = backupData();
  const stamp = new Date().toISOString().slice(0, 10);
  const name = `bearcana-backup-${stamp}.json`;
  const file = new File([JSON.stringify(data, null, 2)], name, { type: "application/json" });

  // On a phone: the share sheet, so it can go to Files, iCloud Drive or email.
  if (!canHover && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Bearcana backup" });
      backedUp();
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  // On a computer: an ordinary download.
  const url = URL.createObjectURL(file);
  const a = el("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  backedUp();
}

// Adds a backup's readings and notes to what's here; nothing is lost.
// A note that differs from the one here is added below it.
function importBackup(data) {
  if (!data || !Array.isArray(data.history) || typeof data.notes !== "object") {
    alert("That file doesn't look like a Bearcana backup.");
    return;
  }
  const history = loadHistory();
  const ids = new Set(history.map((r) => r.id));
  let readings = 0;
  data.history.forEach((r) => {
    if (!r || !r.id || !Number.isFinite(r.t) || !Array.isArray(r.cards) || ids.has(r.id)) return;
    history.push(r);
    ids.add(r.id);
    readings++;
  });
  // A reading that's already here takes the backup's notes if it has none.
  data.history.forEach((r) => {
    const here = r && history.find((x) => x.id === r.id);
    if (!here) return;
    ["note", "lookback"].forEach((k) => { if (typeof r[k] === "string" && r[k].trim() && !here[k]) here[k] = r[k]; });
  });
  history.sort((a, b) => a.t - b.t);
  const themes = mergeOwnThemes(data.themes);

  const notes = loadNotes();
  let added = 0;
  Object.entries(data.notes || {}).forEach(([name, text]) => {
    if (typeof text !== "string" || !text.trim()) return;
    const here = notes[name] || "";
    if (here.includes(text)) return;
    notes[name] = here.trim() ? `${here}\n\n${text}` : text;
    added++;
  });

  if (!writeJSON(HISTORY_KEY, history) || !writeJSON(NOTES_KEY, notes)) {
    alert("Couldn't save the backup on this device.");
    return;
  }
  const r = readings === 1 ? "1 reading" : `${readings} readings`;
  const n = added === 1 ? "1 note" : `${added} notes`;
  alert(`Imported ${r} and ${n}${themes ? `, ${themes === 1 ? "1 theme" : `${themes} themes`}` : ""}.`);
  renderHistory();
}

$("exportBtn").addEventListener("click", exportBackup);
$("backupToggle").addEventListener("click", () => {
  const open = $("backupPanel").hidden;
  $("backupPanel").hidden = !open;
  $("backupToggle").setAttribute("aria-expanded", open);
  $("backupToggle").textContent = open ? "Close" : "Back up";
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    importBackup(JSON.parse(await file.text()));
  } catch {
    alert("That file couldn't be read.");
  }
});

// ── Clearing the history ────────────────────────────────
// A window to choose readings, cards of the day or both, with a warning
// that they're gone for good. Card notes and your own themes stay.
const CLEAR = { kinds: new Set() };
const isCotd = (r) => r.spread === COTD_SPREAD;
const cotdDays = (h) => new Set(h.filter(isCotd).map((r) => new Date(r.t).toDateString())).size;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function clearCounts() {
  const h = loadHistory();
  return { readings: h.filter((r) => !isCotd(r)).length, cotd: cotdDays(h) };
}

function showClearAsk() {
  const n = clearCounts();
  // Start with the list being looked at; from Patterns, both.
  CLEAR.kinds = new Set(HIST.mode === "patterns" ? ["readings", "cotd"] : [HIST.mode]);
  ["readings", "cotd"].forEach((k) => { if (!n[k]) CLEAR.kinds.delete(k); });
  if (!CLEAR.kinds.size) ["readings", "cotd"].forEach((k) => n[k] && CLEAR.kinds.add(k));
  updateClearAsk();
  $("clearAsk").hidden = false;
  $("clearAsk").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  $("clearCancel").focus();
}

function updateClearAsk() {
  const n = clearCounts();
  const names = { readings: plural(n.readings, "reading", "readings"), cotd: plural(n.cotd, "card of the day", "cards of the day") };
  document.querySelectorAll("#clearPicks .chip").forEach((c) => {
    const k = c.dataset.kind, on = CLEAR.kinds.has(k);
    c.textContent = k === "readings" ? `Readings · ${n.readings}` : `Cards of the day · ${n.cotd}`;
    c.disabled = !n[k];
    c.classList.toggle("on", on);
    c.setAttribute("aria-pressed", on);
  });
  const going = ["readings", "cotd"].filter((k) => CLEAR.kinds.has(k));
  $("clearGo").disabled = !going.length;
  $("clearWarn").textContent = going.length
    ? `This deletes ${going.map((k) => names[k]).join(" and ")} from this device for good` +
      `${CLEAR.kinds.has("readings") ? ", with their notes" : ""}` +
      `${CLEAR.kinds.has("cotd") && todaysCard() ? ", including today's card" : ""}. It can't be undone.`
    : "Nothing chosen.";
  const due = backupDue();
  $("clearBackup").textContent = due ? `${due} — back up first to keep a copy.` : "Your backups aren't touched.";
  $("clearBackup").classList.toggle("due", !!due);
}

async function hideClearAsk() {
  await $("clearAsk").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).finished;
  $("clearAsk").hidden = true;
}

function clearHistory() {
  const kinds = CLEAR.kinds;
  if (!kinds.size) return;
  const kept = loadHistory().filter((r) => !kinds.has(isCotd(r) ? "cotd" : "readings"));
  if (!writeJSON(HISTORY_KEY, kept)) { alert("Couldn't clear the history on this device."); return; }
  if (kinds.has("cotd")) {   // today's card goes too, so the home deck can be drawn again
    try { localStorage.removeItem("tarot-cotd"); } catch {}
    buildFloatDeck();
  }
  HIST.open.clear();
  HIST.days.clear();
  hideClearAsk();
  renderHistory();
}

$("clearHistBtn").addEventListener("click", showClearAsk);
$("clearPicks").addEventListener("click", (e) => {
  const c = e.target.closest(".chip");
  if (!c || c.disabled) return;
  const k = c.dataset.kind;
  if (CLEAR.kinds.has(k)) CLEAR.kinds.delete(k); else CLEAR.kinds.add(k);
  updateClearAsk();
});
$("clearCancel").addEventListener("click", hideClearAsk);
$("clearGo").addEventListener("click", clearHistory);
$("clearAsk").addEventListener("click", (e) => { if (e.target === $("clearAsk")) hideClearAsk(); });
$("clearAsk").addEventListener("keydown", (e) => { if (e.key === "Escape") hideClearAsk(); });

// Lets the app open without internet once it has been visited.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js");
}

// Some browsers (often Firefox on Linux) draw the page without the graphics
// card, which makes the animations stutter. Say so once at launch.
function drawsOnCpu() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!gl) return true;   // no hardware WebGL: the browser is on the CPU
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /llvmpipe|softpipe|lavapipe|swiftshader|software|basic render/i.test(name);
  } catch { return false; }
}
if (drawsOnCpu()) {
  const t = el("div", "copy-note cpu-note",
    "Your browser is drawing without the graphics card, so animations may lag. Turn on hardware acceleration in its settings.");
  t.style.zIndex = ++Z + 10;
  const close = () => { t.classList.add("gone"); setTimeout(() => t.remove(), 400); };
  t.addEventListener("click", close);
  document.body.append(t);
  setTimeout(close, 9000);
}
