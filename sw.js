// Keeps a copy of the app on the phone so it works offline.
// It always tries the internet first, so your changes show up,
// and falls back to the saved copy when there is no connection.
// On install it saves the whole app and every card picture up front,
// so a card you've never drawn still shows without internet. The fonts
// (from Google) are saved the first time they load.

const CACHE = "tarot-v51";

importScripts("cards.js");   // for the list of card pictures

const APP_FILES = [
  "./", "index.html", "style.css", "manifest.json", "card-back-art.svg",
  "icon-180.png", "icon-512.png", "icon.svg",
  "cloud.js", "cards.js", "symbols.js", "spreads.js", "pickfx.js", "astronomy.js",
  "js/core.js", "js/home.js", "js/table.js", "js/table-magic.js", "js/arcane-circle.js", "js/rune-ring.js",
  "js/summary.js", "js/portal.js", "js/card-pages.js", "js/browse.js", "js/sky.js",
  "js/history.js", "js/drive.js", "js/reading-notes.js", "js/patterns.js", "js/own-themes.js", "js/share.js", "js/warm-up.js",
];
const PICTURES = CARDS.filter((c) => c.image)
  .flatMap((c) => [c.image, c.image.replace(/^cards\//, "cards/small/")]);

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await c.addAll(APP_FILES);
    // Pictures one by one, so a missing one doesn't stop the rest.
    await Promise.all(PICTURES.map((p) => c.add(p).catch(() => {})));
  }));
});

self.addEventListener("activate", (e) => e.waitUntil((async () => {
  // Older copies take room for nothing once this one is ready.
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
  await self.clients.claim();
})()));

// Only the app's own files and its fonts are kept. Anything else, like
// Google sign-in and your Drive backup, goes straight to the internet
// and is never stored here.
const KEEP_HOSTS = [self.location.host, "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (!KEEP_HOSTS.includes(new URL(e.request.url).host)) return;
  // Ask the server for a fresh copy instead of a stale one from the browser.
  // (A page load can't take options directly, so it's asked for by its address.)
  const fresh = e.request.mode === "navigate"
    ? fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" })
    : fetch(e.request, { cache: "no-cache" });
  e.respondWith(
    fresh
      .then((res) => {
        if (res.ok || res.type === "opaque") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: e.request.mode === "navigate" })
        .then((hit) => hit || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
