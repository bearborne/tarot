// Backing up to Google Drive. The backup is one file in Drive's hidden
// app folder (only Bearcana can see it), and Bearcana can't see anything
// else in your Drive. It needs a Google client ID: GOOGLE_CLIENT_ID in
// cloud.js (for everyone using this copy), or one pasted into the setup
// that opens the first time Google Drive is tapped (kept on this device).
//
// Back up: what's here, plus any readings, notes and themes already in
// the Drive backup that aren't here (from another phone, say), so a
// backup from one device never wipes out another's.
// Restore: adds the Drive backup to what's here, like Import backup.
// Nothing here is overwritten either way.

const DRIVE = { token: null, expires: 0, client: null, gsi: null };
const DRIVE_FILE = "bearcana-backup.json";
const DRIVE_AT = "tarot-drive-at";
const DRIVE_API = "https://www.googleapis.com";

const CLIENT_KEY = "tarot-google-client";
const sharedId = () => (typeof GOOGLE_CLIENT_ID === "string" && GOOGLE_CLIENT_ID.trim()) || "";
const clientId = () => sharedId() || readJSON(CLIENT_KEY, "") || "";
const driveOn = () => clientId() !== "";

// Google's sign-in script, loaded once, ahead of the first tap (a sign-in
// window only opens straight from a tap, so it can't wait for a download).
function loadGsi() {
  if (DRIVE.gsi) return DRIVE.gsi;
  const init = () => {
    DRIVE.client = google.accounts.oauth2.initTokenClient({
      client_id: clientId(),
      scope: "https://www.googleapis.com/auth/drive.appdata",
      callback: () => {},
    });
  };
  DRIVE.gsi = new Promise((ok, fail) => {
    if (window.google?.accounts?.oauth2) { init(); ok(); return; }   // already here (a new client ID)
    const s = el("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => { init(); ok(); };
    s.onerror = () => { DRIVE.gsi = null; fail(new Error("offline")); };
    document.head.append(s);
  });
  return DRIVE.gsi;
}

// A token to use Drive with, asking Google (a small window) when there's
// none yet or it has run out. Called straight from a tap.
function driveToken() {
  if (DRIVE.token && Date.now() < DRIVE.expires - 60e3) return Promise.resolve(DRIVE.token);
  if (!DRIVE.client) return Promise.reject(new Error(navigator.onLine ? "loading" : "offline"));
  return new Promise((ok, fail) => {
    DRIVE.client.callback = (res) => {
      if (res.error) { fail(new Error(res.error)); return; }
      DRIVE.token = res.access_token;
      DRIVE.expires = Date.now() + (+res.expires_in || 3600) * 1000;
      ok(DRIVE.token);
    };
    DRIVE.client.error_callback = (e) => fail(new Error(e?.type || "closed"));
    DRIVE.client.requestAccessToken();
  });
}

async function driveFetch(path, opts = {}) {
  const res = await fetch(DRIVE_API + path, {
    ...opts,
    headers: { ...(opts.headers || {}), Authorization: `Bearer ${DRIVE.token}` },
  });
  if (res.status === 401) DRIVE.token = null;
  if (!res.ok) throw new Error(`drive ${res.status}`);
  return res;
}

// The backup file in the app folder, or null.
async function driveFile() {
  const q = encodeURIComponent(`name='${DRIVE_FILE}'`);
  const res = await driveFetch(`/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime desc`);
  return (await res.json()).files?.[0] || null;
}

async function driveRead(file) {
  return (await driveFetch(`/drive/v3/files/${file.id}?alt=media`)).json();
}

async function driveWrite(data, file) {
  const body = JSON.stringify(data);
  if (file) {
    await driveFetch(`/upload/drive/v3/files/${file.id}?uploadType=media`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body });
    return;
  }
  const b = `bearcana${rand(1e9)}`;
  const meta = JSON.stringify({ name: DRIVE_FILE, parents: ["appDataFolder"], mimeType: "application/json" });
  await driveFetch("/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${b}` },
    body: `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`
      + `--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`,
  });
}

// What's here, with whatever only the other backup has added in.
function unionBackup(here, there) {
  if (!there || !Array.isArray(there.history)) return here;
  const ids = new Set(here.history.map((r) => r.id));
  const history = [...here.history, ...there.history.filter((r) => r && r.id && !ids.has(r.id))]
    .sort((a, b) => a.t - b.t);
  const notes = { ...(there.notes && typeof there.notes === "object" ? there.notes : {}), ...here.notes };
  const tids = new Set(here.themes.map((t) => t.id));
  const themes = [...here.themes, ...(Array.isArray(there.themes) ? there.themes.filter((t) => t && t.id && !tids.has(t.id)) : [])];
  return { ...here, history, notes, themes };
}

// What went wrong, in a few words.
function driveTrouble(e) {
  const m = e?.message || "";
  if (m === "offline" || !navigator.onLine) return "No internet connection";
  if (m === "loading") return "Google is still loading, try again in a moment";
  if (/closed|access_denied|popup/.test(m)) return "Google sign-in was closed";
  return "Couldn't reach Google Drive";
}

let driveBusy = false;
async function driveBackup() {
  if (!driveOn()) { showDriveSetup(); return; }
  if (driveBusy) return;
  const token = driveToken();   // first, while this still counts as the tap
  driveBusy = true;
  driveStatus("Backing up…");
  try {
    await token;
    const file = await driveFile();
    const data = unionBackup(backupData(), file ? await driveRead(file).catch(() => null) : null);
    await driveWrite(data, file);
    try { localStorage.setItem(DRIVE_AT, String(Date.now())); } catch {}
    backedUp();
    driveStatus();
    toast("Backed up to Google Drive");
  } catch (e) {
    driveStatus(driveTrouble(e));
  } finally {
    driveBusy = false;
  }
}

async function driveRestore() {
  if (!driveOn()) { showDriveSetup(); return; }
  if (driveBusy) return;
  const token = driveToken();
  driveBusy = true;
  driveStatus("Looking in your Drive…");
  try {
    await token;
    const file = await driveFile();
    if (!file) { driveStatus("No backup in your Google Drive yet"); return; }
    importBackup(await driveRead(file));
    driveStatus();
  } catch (e) {
    driveStatus(driveTrouble(e));
  } finally {
    driveBusy = false;
  }
}

function driveDisconnect() {
  if (DRIVE.token) try { google.accounts.oauth2.revoke(DRIVE.token, () => {}); } catch {}
  DRIVE.token = null;
  driveStatus("Disconnected from Google Drive");
}

// The line under the buttons: the last Drive backup, or what's happening.
function driveStatus(text) {
  const line = $("driveStatus");
  line.replaceChildren();
  if (!driveOn() && !text) { line.hidden = true; return; }
  line.hidden = false;
  const at = +readJSON(DRIVE_AT, 0) || 0;
  line.append(text || (at ? `Last saved to Drive ${dateText(at)}, ${timeText(at)}` : "Google Drive is ready"));
  if (driveBusy) return;
  if (DRIVE.token) {
    const off = el("button", "link small", "Disconnect");
    off.addEventListener("click", driveDisconnect);
    line.append(" · ", off);
  } else if (driveOn() && !sharedId()) {
    const change = el("button", "link small", "Setup");
    change.addEventListener("click", showDriveSetup);
    line.append(" · ", change);
  }
}

// ── Setting up Google Drive, in the app ─────────────────
// Bearcana has no server, so Google needs to know it by a client ID made
// in your own Google Cloud project: the steps, with this page's address to
// copy, and a box to paste the ID into. Kept on this device only.
function showDriveSetup() {
  const box = $("driveSetup");
  box.replaceChildren();
  box.hidden = false;
  box.append(el("p", "asks-title", "Set up Google Drive"));
  const close = () => { box.hidden = true; };
  if (location.protocol === "file:") {
    box.append(el("p", "drive-help", "Google sign-in doesn't work when the app is opened straight from its folder. Open it with Run Tarot.bat or from its website, and set it up there."));
    const ok = el("button", "link small gold", "Close");
    ok.addEventListener("click", close);
    box.append(ok);
    return;
  }
  box.append(el("p", "drive-help", "Bearcana has no server of its own, so Google needs a free client ID from your own Google account. About ten minutes, once:"));
  const ol = el("ol", "drive-steps");
  const step = (...parts) => { const li = el("li"); li.append(...parts); ol.append(li); };
  const link = Object.assign(el("a", "", "console.cloud.google.com"),
    { href: "https://console.cloud.google.com/", target: "_blank", rel: "noopener" });
  step("Open ", link, " and create a project.");
  step("APIs & Services › Library: enable ", el("b", "", "Google Drive API"), ".");
  step("Google Auth Platform: choose External. Under Data access add ", el("code", "", "drive.appdata"),
    "; under Audience add your Google address as a test user.");
  const origin = el("button", "drive-origin", location.origin);
  origin.title = "Copy";
  origin.addEventListener("click", () => copyText(location.origin, "Address copied"));
  step("Clients › Create client › Web application. Under Authorized JavaScript origins, add this address (tap to copy):", origin);
  step("Copy the client ID and paste it here:");
  box.append(ol);

  const input = el("input", "own-input drive-id");
  Object.assign(input, { type: "text", placeholder: "…apps.googleusercontent.com", spellcheck: false, autocomplete: "off" });
  input.value = readJSON(CLIENT_KEY, "") || "";
  input.setAttribute("aria-label", "Google client ID");
  const note = el("p", "drive-status");
  const save = el("button", "chip", "Save");
  const cancel = el("button", "link small", "Cancel");
  const row = el("div", "backup-row");
  row.append(save, cancel);
  if (readJSON(CLIENT_KEY, "")) {
    const forget = el("button", "link small", "Remove");
    forget.addEventListener("click", () => {
      try { localStorage.removeItem(CLIENT_KEY); } catch {}
      DRIVE.client = DRIVE.gsi = DRIVE.token = null;
      close();
      driveStatus();
    });
    row.append(forget);
  }
  box.append(input, note, row);
  cancel.addEventListener("click", close);
  save.addEventListener("click", async () => {
    const id = input.value.trim();
    if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(id)) {
      note.textContent = "That doesn't look like a client ID. It ends in .apps.googleusercontent.com";
      return;
    }
    if (!writeJSON(CLIENT_KEY, id)) { note.textContent = "Couldn't save it on this device"; return; }
    DRIVE.client = DRIVE.gsi = DRIVE.token = null;
    note.textContent = "Connecting to Google…";
    try { await loadGsi(); } catch { note.textContent = "Saved, but Google couldn't be reached just now"; return; }
    close();
    driveStatus("Ready: tap Google Drive to back up");
  });
  input.focus();
}

// Gets Google ready when the history opens, so a tap can sign in at once.
function setUpDrive() {
  driveStatus();
  if (driveOn()) loadGsi().catch(() => {});
}
$("driveBackupBtn").addEventListener("click", driveBackup);
$("driveRestoreBtn").addEventListener("click", driveRestore);
$("historyBtn").addEventListener("click", setUpDrive);   // (the home screen's reminder opens it too)
