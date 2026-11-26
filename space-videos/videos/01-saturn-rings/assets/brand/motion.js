/*
  SPACE VIDEOS — house motion helpers (loaded once by index.html, used by every scene).
  The house transition is the "slow cosmic zoom": each scene flies in from deep space
  (small, blurred, faint) and leaves by rushing past the camera (large, blurred, faint),
  while index.html draws a burst of star streaks at every cut.
*/
window.SV = window.SV || {};

/** Scene length in seconds, read from the host clip that mounts this scene. */
SV.sceneDuration = function (el, fallback) {
  const host = el && el.closest("[data-duration]");
  const d = host ? parseFloat(host.getAttribute("data-duration")) : NaN;
  return Number.isFinite(d) ? d : fallback;
};

/** Fly the scene's inner wrapper in from deep space. Skip for the first scene (frame 0 is the thumbnail). */
SV.zoomIn = function (tl, sel, at) {
  // Starts 0.3 s into the 0.5 s overlap, so the outgoing scene has mostly cleared.
  tl.fromTo(
    sel,
    { scale: 0.55, opacity: 0, filter: "blur(14px)" },
    { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
    at == null ? 0.3 : at,
  );
};

/** Rush the scene past the camera at its end. Skip for the last scene. */
SV.zoomOut = function (tl, sel, sceneDur) {
  tl.to(
    sel,
    { scale: 1.9, opacity: 0, filter: "blur(12px)", duration: 0.6, ease: "power2.in" },
    sceneDur - 0.6,
  );
};

/** A slow push-in while a scene holds, so nothing is ever fully still. */
SV.drift = function (tl, sel, sceneDur) {
  tl.fromTo(sel, { scale: 1 }, { scale: 1.04, duration: sceneDur, ease: "none" }, 0);
};

/** Standard text entrance: rise + fade. */
SV.rise = function (tl, sel, at, opts) {
  tl.fromTo(
    sel,
    { opacity: 0, y: 40 },
    Object.assign({ opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, opts || {}),
    at,
  );
};

/** Deterministic pseudo-random number in [0,1) for index n. Never use Math.random(). */
SV.rnd = function (n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
