// Low-res (160x72) pixel ocean that gets darker as you dive.
const W = 160;
const H = 72;
const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k))})`;

export function createOcean(canvas) {
  const cx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;

  let target = 0;
  let depth = 0;
  let tick = 0;
  let bubbles = [];
  let fish = [];
  const snow = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.2 + Math.random() * 0.5 }));

  function frame() {
    requestAnimationFrame(frame);
    if (canvas.offsetParent === null) return; // hidden tab: skip drawing
    tick++;
    depth += (target - depth) * 0.04;
    const k = 1 - Math.exp(-depth / 60);

    const g = cx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix([30, 130, 160], [0, 0, 0], k));
    g.addColorStop(1, mix([6, 40, 70], [0, 0, 0], Math.min(1, k * 1.25)));
    cx.fillStyle = g;
    cx.fillRect(0, 0, W, H);

    cx.fillStyle = `rgba(200,240,255,${0.5 - k * 0.3})`;
    snow.forEach((p) => {
      p.y -= p.s * (1 + Math.abs(target - depth) * 0.5);
      if (p.y < 0) { p.y = H; p.x = Math.random() * W; }
      cx.fillRect(p.x | 0, p.y | 0, 1, 1);
    });

    if (tick % 90 === 0) fish.push({ x: Math.random() < 0.5 ? -6 : W + 6, y: 8 + Math.random() * (H - 20), v: (Math.random() < 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3) });
    fish = fish.filter((f) => f.x > -10 && f.x < W + 10);
    cx.fillStyle = mix([20, 60, 80], [0, 0, 0], Math.min(1, k + 0.3));
    fish.forEach((f) => {
      f.x += f.v;
      cx.fillRect(f.x | 0, f.y | 0, 5, 2);
      cx.fillRect((f.x + (f.v > 0 ? -2 : 5)) | 0, (f.y - 1) | 0, 2, 4);
    });

    if (k > 0.55) { // deep-sea lure
      const lx = (W / 2 + Math.sin(tick / 50) * 50) | 0;
      cx.fillStyle = '#ffe66b'; cx.fillRect(lx, 50, 2, 2);
      cx.fillStyle = 'rgba(255,230,107,.25)'; cx.fillRect(lx - 2, 48, 6, 6);
    }

    if (tick % 25 === 0) bubbles.push({ x: W / 2 + 3, y: 34, s: 0.3 + Math.random() * 0.3 });
    bubbles = bubbles.filter((b) => b.y > 0);
    cx.fillStyle = '#cfefff';
    bubbles.forEach((b) => { b.y -= b.s; b.x += Math.sin(b.y / 4) * 0.2; cx.fillRect(b.x | 0, b.y | 0, 1, 1); });

    drawDiver(cx, W / 2 - 4, 30 + ((Math.sin(tick / 30) * 2) | 0));
  }

  frame();
  return { setLevel: (level) => { target = level; }, reset: () => { target = 0; depth = 0; } };
}

function drawDiver(cx, x, y) {
  cx.fillStyle = '#ffd34f'; cx.fillRect(x, y + 5, 8, 9);
  cx.fillStyle = '#bff3ff'; cx.fillRect(x + 1, y, 6, 6);
  cx.fillStyle = '#103040'; cx.fillRect(x + 2, y + 2, 4, 2);
  cx.fillStyle = '#8aa'; cx.fillRect(x - 2, y + 6, 2, 6);
  cx.fillStyle = '#ffd34f'; cx.fillRect(x + 1, y + 14, 2, 3); cx.fillRect(x + 5, y + 14, 2, 3);
}
