/* Home page: the eye-chart strip and the golden iris in the hero. */
(function () {
  // ---- Tumbling-E acuity band ----
  const rows = [['6/60', 64, 0], ['6/36', 48, 90], ['6/24', 38, 180], ['6/18', 30, 270], ['6/12', 22, 0], ['6/9', 16, 180], ['6/6', 11, 90]];
  const band = document.getElementById('acuity');
  rows.forEach((r, i) => {
    const el = document.createElement('div');
    el.className = 'optotype' + (i === rows.length - 1 ? ' last' : '');
    el.innerHTML = '<span style="font-size:' + r[1] + 'px;transform:rotate(' + r[2] + 'deg)">E</span><small>' + r[0] + '</small>';
    band.append(el);
  });

  // ---- Hero iris, drawn in gold ----
  const cv = document.getElementById('iris'), ctx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let fibers = null, size = 0;
  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    size = cv.clientWidth * dpr;
    cv.width = cv.height = size;
    const R = size * 0.42, off = document.createElement('canvas');
    off.width = off.height = size;
    const o = off.getContext('2d'), c = size / 2;
    // iris ground
    const g = o.createRadialGradient(c, c, R * 0.25, c, c, R);
    g.addColorStop(0, '#E9D5A6'); g.addColorStop(0.55, '#C9A15A'); g.addColorStop(0.9, '#9C772F'); g.addColorStop(1, '#6E5220');
    o.fillStyle = g; o.beginPath(); o.arc(c, c, R, 0, Math.PI * 2); o.fill();
    // radial fibres
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 360; i++) {
      const a = (i / 360) * Math.PI * 2 + rnd() * 0.02, r0 = R * (0.28 + rnd() * 0.06), r1 = R * (0.7 + rnd() * 0.3), bend = (rnd() - 0.5) * 0.18;
      o.strokeStyle = rnd() > 0.5 ? 'rgba(255,248,230,' + (0.15 + rnd() * 0.3) + ')' : 'rgba(92,66,20,' + (0.12 + rnd() * 0.25) + ')';
      o.lineWidth = (0.6 + rnd() * 1.2) * dpr;
      o.beginPath();
      o.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
      o.quadraticCurveTo(c + Math.cos(a + bend) * (r0 + r1) / 2, c + Math.sin(a + bend) * (r0 + r1) / 2, c + Math.cos(a) * r1, c + Math.sin(a) * r1);
      o.stroke();
    }
    // collarette + limbal ring
    o.strokeStyle = 'rgba(255,244,215,.55)'; o.lineWidth = 2 * dpr; o.beginPath(); o.arc(c, c, R * 0.46, 0, Math.PI * 2); o.stroke();
    o.strokeStyle = '#5E451A'; o.lineWidth = 5 * dpr; o.beginPath(); o.arc(c, c, R - 2 * dpr, 0, Math.PI * 2); o.stroke();
    fibers = off;
  }
  function frame(t) {
    const c = size / 2, R = size * 0.42, dpr = size / cv.clientWidth;
    ctx.clearRect(0, 0, size, size);
    // outer guide rings
    ctx.strokeStyle = 'rgba(179,139,63,.35)'; ctx.lineWidth = 1 * dpr;
    [1.1, 1.18].forEach(k => { ctx.beginPath(); ctx.arc(c, c, R * k, 0, Math.PI * 2); ctx.stroke(); });
    // tick marks like a keratometer scale
    for (let i = 0; i < 72; i++) {
      const a = i / 72 * Math.PI * 2, l = i % 6 === 0 ? 10 : 5;
      ctx.beginPath(); ctx.moveTo(c + Math.cos(a) * R * 1.18, c + Math.sin(a) * R * 1.18);
      ctx.lineTo(c + Math.cos(a) * (R * 1.18 + l * dpr), c + Math.sin(a) * (R * 1.18 + l * dpr)); ctx.stroke();
    }
    // iris, slowly turning
    ctx.save(); ctx.translate(c, c); ctx.rotate(t / 60000); ctx.drawImage(fibers, -c, -c); ctx.restore();
    // pupil (breathes very slightly)
    const pr = R * (0.3 + (still ? 0 : Math.sin(t / 2400) * 0.012));
    ctx.fillStyle = '#16130D'; ctx.beginPath(); ctx.arc(c, c, pr, 0, Math.PI * 2); ctx.fill();
    // laser sweep arc
    const a0 = still ? -0.6 : t / 1600;
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6 * dpr; ctx.shadowColor = '#FFE7A8'; ctx.shadowBlur = 12 * dpr;
    ctx.beginPath(); ctx.arc(c, c, R * 0.64, a0, a0 + 0.9); ctx.stroke(); ctx.shadowBlur = 0;
    // catch-lights
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.beginPath(); ctx.arc(c + R * 0.16, c - R * 0.17, R * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(c - R * 0.1, c + R * 0.12, R * 0.025, 0, Math.PI * 2); ctx.fill();
    if (!still) requestAnimationFrame(frame);
  }
  build();
  requestAnimationFrame(frame);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (still) frame(0); }, 150); });
})();
