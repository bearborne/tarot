// Your own words on a whole reading, kept with it in the history:
// what it meant to you now, and later on, how it turned out.

// The reflection part at the foot of a saved reading's summary.
// id: the reading's id in the history.
function reflectionPart(id) {
  const sec = el("section", "summary-part reflection");
  sec.append(el("p", "asks-title", "Your reflection"));
  const r = () => loadHistory().find((x) => x.id === id) || {};
  const box = (key, opts) => noteBox({
    get: () => r()[key] || "",
    set: (text) => updateReading(id, { [key]: text.trim() ? text : undefined,
      ...(key === "lookback" ? { lookbackAt: text.trim() ? Date.now() : undefined } : {}) }),
    ...opts,
  });
  sec.append(box("note", {
    placeholder: "What does this reading say to you?",
    add: "Add a note", has: "Your note",
  }));
  // Looking back only makes sense once some time has gone by.
  const reading = r();
  if (reading.t && Date.now() - reading.t > 864e5 || reading.lookback) {
    const ago = Math.floor((Date.now() - reading.t) / 864e5);
    sec.append(box("lookback", {
      placeholder: `${ago === 1 ? "A day" : `${ago} days`} on: how did it turn out?`,
      add: "Looking back", has: "Looking back", close: "Close",
    }));
  }
  return sec;
}

showBackupNudge();
$("homeNudge").addEventListener("click", () => $("historyBtn").click());
