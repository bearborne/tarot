// ───────────────────────────────────────────────────────────────
//  GOOGLE DRIVE BACKUP
//  The app's Google client ID, for "Back up to Google Drive". It isn't
//  a secret: Google only accepts it from the addresses listed in the
//  Bearcana project (bearborne.github.io, localhost:8771, localhost:8770).
//  While that project stays in "Testing", only its test users can sign in.
//
//  The Google Drive buttons only show on a device that has opened the app
//  once with ?drive at the end of its address (e.g.
//  https://bearborne.github.io/tarot/?drive). ?drive=off hides them again.
//
//  The backup goes into a hidden app folder in your Drive that only
//  Bearcana can see. Bearcana can't see any of your other files.
// ───────────────────────────────────────────────────────────────

const GOOGLE_CLIENT_ID = "395328087001-7egq70kgpki43nb011ffct3gmshoaj02.apps.googleusercontent.com";
