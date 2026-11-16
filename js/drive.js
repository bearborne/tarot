// Backing up to Google Drive. The backup is one file in Drive's hidden
// app folder (only Bearcana can see it), and Bearcana can't see anything
// else in your Drive. It needs GOOGLE_CLIENT_ID in cloud.js.
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

const driveOn = () => typeof GOOGLE_CLIENT_ID === "string" && GOOGLE_CLIENT_ID.trim() !== "";

// Google's sign-in script, loaded once, ahead of the first tap (a sign-in
// window only opens straight from a tap, so it can't wait for a download).
function loadGsi() {
  if (DRIVE.gsi) return DRIVE.gsi;
  DRIVE.gsi = new Promise((ok, fail) => {
    const s = el("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      DRIVE.client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID.trim(),
        scope: "https://www.googleapis.com/auth/drive.appdata",
        callback: () => {},
      });
      ok();
    };
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

// The line under the Drive buttons: the last backup, or what's happening.
function driveStatus(text) {
  const line = $("driveStatus");
  line.replaceChildren();
  const at = +readJSON(DRIVE_AT, 0) || 0;
  line.append(text || (at ? `Last saved to Drive ${dateText(at)}, ${timeText(at)}` : "Not backed up to Drive yet"));
  if (DRIVE.token && !driveBusy) {
    const off = el("button", "link small", "Disconnect");
    off.addEventListener("click", driveDisconnect);
    line.append(" · ", off);
  }
}

// The Drive buttons, when cloud.js has a client ID.
function setUpDrive() {
  $("driveBox").hidden = !driveOn();
  if (!driveOn()) return;
  driveStatus();
  loadGsi().catch(() => {});
}
$("driveBackupBtn").addEventListener("click", driveBackup);
$("driveRestoreBtn").addEventListener("click", driveRestore);
$("historyBtn").addEventListener("click", setUpDrive);   // (the home screen's reminder opens it too)
