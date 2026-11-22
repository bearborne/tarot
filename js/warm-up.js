// Warming up the animations. The first time any effect plays, the browser
// has work to do before it can draw it: running the drawing code for the
// first time, setting up the graphics card for its gradients, glows, blurs
// and the smoke filter, and making the pictures the effects draw from. Done
// in the middle of the animation, that makes its first run stutter.
//
// So once the home screen has settled, while the browser has nothing else to
// do, each effect is played once, out of sight: into tiny pictures nobody
// sees, or on screen at almost no opacity for a frame or two. One small step
// at a time, so the home screen never waits on it; and none of it changes
// anything the user sees.
// Part of the app; the files in js/ load in the order listed in index.html
// (this one last: it uses the others).

(() => {
  if (calm) return;   // (with less motion, these effects don't play)
  const idle = (fn) => (window.requestIdleCallback
    ? requestIdleCallback(fn, { timeout: 1500 })
    : setTimeout(fn, 60));
  const frames = (n) => new Promise((done) => {
    const step = () => (--n <= 0 ? done() : requestAnimationFrame(step));
    requestAnimationFrame(step);
    setTimeout(done, 400);   // (frames are paused while the page is hidden)
  });
  const pad = (px) => {
    const c = document.createElement("canvas");
    c.width = c.height = px;
    return c.getContext("2d");
  };
  // A layer at the screen's corner, there for the browser but not for the eye.
  const unseen = (node) => {
    Object.assign(node.style, { opacity: "0.01", pointerEvents: "none" });
    return node;
  };
  const size = (sel, fallback) => {
    const r = document.querySelector(sel)?.getBoundingClientRect();
    return r && r.width ? r : fallback;
  };

  const steps = [
    // The rings of runes, with their lights and glows.
    () => {
      const x = pad(96);
      [20, 40, 70].forEach((R) => {
        const art = ringArt(R);
        x.setTransform(0.5, 0, 0, 0.5, 48, 48);
        [0, 300, 900].forEach((ms) => art.draw(x, ms));
      });
    },
    // The black holes, at the sizes the home screen's cards and buttons make
    // (their working pictures are kept, so the first tap finds them ready).
    () => {
      const x = pad(64);
      const sizes = new Set([
        holeSize(size("#floatDeck .fd-card", { width: 90, height: 150 })),
        holeSize(size("#home .home-links .pill", { width: 150, height: 40 })),
        holeSize(size(".spread-btn", { width: 80, height: 90 })),
      ].map(Math.round));
      sizes.forEach((hr) => {
        const art = holeArt(hr, miniSharp());
        x.setTransform(0.1, 0, 0, 0.1, 32, 32);
        [[0, 0.5, 0.4], [400, 1, 1]].forEach(([ms, h, g]) => art.draw(x, ms, h, g));
      });
    },
    // The card of the day's dawn: the day sky, the halo and the light round
    // the card, at a few moments from the first glow to the nightfall.
    () => {
      const W = innerWidth, H = innerHeight, C = { x: W / 2, y: H * 0.3 }, h = 150;
      const sky = pad(48), halo = pad(48), card = pad(48), sk = 48 / Math.max(W, H);
      const skyKeep = {}, haloKeep = {}, motes = dawnMotes(h);
      [300, 900, 1700, 2600, 3600].forEach((t) => {
        [sky, halo].forEach((x) => { x.setTransform(sk, 0, 0, sk, 0, 0); x.clearRect(0, 0, W, H); });
        daySky(sky, t, W, H, C, h, skyKeep);
        haloLight(halo, t, W, H, C, h, haloKeep);
        dayAmount(t, C, W, H, h, W / 2, H / 2);
        const f = dawnFrame(t, h, motes);
        card.setTransform(0.05, 0, 0, 0.05, 24, 24);
        f.back(card);
        f.front(card);
      });
    },
    // The smoke a card or button dissolves in as it collapses, and the
    // blurring lens at the edge of the light: played once, unseen.
    async () => {
      const node = document.querySelector("#home .home-links .pill");
      const smoke = node && collapseCopy(node);
      if (smoke) unseen(smoke.box);
      const lens = unseen(document.createElement("div"));
      lens.className = "dawn-lens";
      Object.assign(lens.style, { left: "20px", top: "20px", width: "24px", height: "24px" });
      const wave = unseen(document.createElement("div"));
      wave.className = "hole-wave";
      Object.assign(wave.style, { left: "20px", top: "20px", width: "24px", height: "24px" });
      document.body.append(lens, wave);
      smoke?.set(0.5, 200);
      await frames(3);
      smoke?.remove();
      lens.remove();
      wave.remove();
    },
    // The card back the other cards crumble from, as a picture.
    () => cardBackArt(),
    // The great circle's sigils, at the size the summary's portal uses
    // (they're kept once made).
    () => sigilsFor(Math.round(Math.min(innerWidth, innerHeight) * 0.25)),
  ];

  const next = () => {
    const step = steps.shift();
    if (!step) return;
    idle(async () => {
      try { await step(); } catch (e) { /* only a warm-up: the effect will still play */ }
      next();
    });
  };
  // After the home screen's own opening has played.
  const begin = () => setTimeout(next, 1200);
  if (document.readyState === "complete") begin();
  else addEventListener("load", begin, { once: true });
})();
