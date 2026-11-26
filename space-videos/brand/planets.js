/*
  SPACE VIDEOS — reusable planet drawings (canvas 2D, deterministic, cheap enough for every frame).

  SV.saturn.draw(ctx, {
    cx, cy,        // centre in canvas pixels
    R,             // equatorial radius in px
    open,          // ring opening angle in radians (0 = edge-on hairline, ~0.45 = wide open)
    tilt,          // rotation of the whole planet in radians (axis tilt on screen)
    ringAlpha,     // 0..1 ring opacity (fade the rings away)
    planetAlpha,   // 0..1 planet opacity
    glow,          // 0..1 soft halo
  })

  Ring radii follow Saturn's real main rings (in planet radii): C 1.24–1.53, B 1.53–1.95,
  Cassini Division 1.95–2.03, A 2.03–2.27 (Encke Gap near 2.21). Saturn is ~10% flattened.
  Sources: NASA Saturn fact sheet (nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html).
*/
window.SV = window.SV || {};
SV.saturn = (function () {
  const BANDS = [
    [0.0, "#e9d6ab"], [0.1, "#dcc08f"], [0.2, "#ead8b0"], [0.3, "#cfae7b"], [0.38, "#e4cb9b"],
    [0.47, "#c79f6c"], [0.56, "#e7d2a6"], [0.66, "#d3b384"], [0.76, "#bf9666"], [0.86, "#dcc196"], [1.0, "#b98f62"],
  ];
  function ringColor(r) {
    // returns [rgb, alpha] for radius r in planet radii
    if (r < 1.24 || r > 2.27) return null;
    if (r < 1.53) return ["150,135,115", 0.28]; // C ring: faint, grey-brown
    if (r < 1.95) {
      const k = (r - 1.53) / 0.42;
      return ["232,214,180", 0.75 + 0.2 * Math.sin(k * 9.0)]; // B ring: bright, banded
    }
    if (r < 2.03) return ["40,40,50", 0.12]; // Cassini Division
    if (r > 2.2 && r < 2.215) return ["40,40,50", 0.1]; // Encke Gap
    return ["205,190,160", 0.6]; // A ring
  }
  function rings(ctx, R, open, alpha, half) {
    // half: -1 = far half (drawn behind the planet), +1 = near half (in front)
    const s = Math.abs(Math.sin(open));
    ctx.save();
    ctx.beginPath();
    if (half < 0) ctx.rect(-3 * R, -3 * R, 6 * R, 3 * R);
    else ctx.rect(-3 * R, 0, 6 * R, 3 * R);
    ctx.clip();
    ctx.lineWidth = Math.max(1.2, R * 0.0115);
    for (let r = 1.24; r <= 2.27; r += 0.01) {
      const c = ringColor(r);
      if (!c) continue;
      ctx.strokeStyle = "rgba(" + c[0] + "," + (c[1] * alpha).toFixed(3) + ")";
      ctx.beginPath();
      ctx.ellipse(0, 0, r * R, Math.max(0.5, r * R * s), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  function planet(ctx, R, alpha) {
    const ry = R * 0.9;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, R, ry, 0, 0, Math.PI * 2);
    ctx.clip();
    const g = ctx.createLinearGradient(0, -ry, 0, ry);
    for (const [p, c] of BANDS) g.addColorStop(p, c);
    ctx.fillStyle = g;
    ctx.fillRect(-R, -ry, 2 * R, 2 * ry);
    // Sunlight from the upper left; night side lower right.
    const sh = ctx.createRadialGradient(-R * 0.45, -ry * 0.5, R * 0.1, -R * 0.2, -ry * 0.2, R * 1.45);
    sh.addColorStop(0, "rgba(255,250,235,0.18)");
    sh.addColorStop(0.45, "rgba(0,0,0,0)");
    sh.addColorStop(0.8, "rgba(5,5,20,0.55)");
    sh.addColorStop(1, "rgba(5,5,20,0.92)");
    ctx.fillStyle = sh;
    ctx.fillRect(-R, -ry, 2 * R, 2 * ry);
    ctx.restore();
  }
  function draw(ctx, o) {
    const R = o.R, open = o.open == null ? 0.45 : o.open;
    const ringAlpha = o.ringAlpha == null ? 1 : o.ringAlpha;
    const planetAlpha = o.planetAlpha == null ? 1 : o.planetAlpha;
    ctx.save();
    ctx.translate(o.cx, o.cy);
    ctx.rotate(o.tilt || 0);
    if (o.glow) {
      const h = ctx.createRadialGradient(0, 0, R * 0.8, 0, 0, R * 2.2);
      h.addColorStop(0, "rgba(255,200,130," + (0.22 * o.glow).toFixed(3) + ")");
      h.addColorStop(1, "rgba(255,200,130,0)");
      ctx.fillStyle = h;
      ctx.fillRect(-2.4 * R, -2.4 * R, 4.8 * R, 4.8 * R);
    }
    // Rings tilted toward us from above: the upper half passes behind the planet.
    rings(ctx, R, open, ringAlpha, -1);
    planet(ctx, R, planetAlpha);
    rings(ctx, R, open, ringAlpha, +1);
    ctx.restore();
  }
  return { draw };
})();
