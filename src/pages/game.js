import { initNavbar } from '../components/navbar.js';
import { initFooter }  from '../components/footer.js';

initNavbar({ activePage: 'game' });
initFooter();

const SCALE = 5;           // axis range: -5 to +5
const GRID_STEP = 1;       // grid lines every 1 unit

const COLOR_AXIS      = 'rgb(0, 0, 0)';
const COLOR_GRID      = 'rgba(0, 0, 0, 0.27)';
const COLOR_LABEL     = 'rgb(0, 0, 0)';
const COLOR_TARGET    = '#0059ff';
const COLOR_GUESS_HIT = '#2ad100';
const COLOR_GUESS_MID = '#ffd900';
const COLOR_GUESS_MISS= '#ff0000';

let state = {
  hasGuessed: false,
  question:   null,     // { expr, type, re, im }
  guessRe:    0,
  guessIm:    0,
};

const canvas    = document.getElementById('game-canvas');
const ctx       = canvas.getContext('2d');
const wrapper   = document.getElementById('canvas-wrapper');
const exprEl    = document.getElementById('question-expr');
const newQBtn   = document.getElementById('new-question-btn');

function toCanvas(re, im) {
  const w = canvas.width, h = canvas.height;
  return {
    x: (w / 2) + (re / SCALE) * (w / 2),
    y: (h / 2) - (im / SCALE) * (h / 2),
  };
}

function toComplex(x, y) {
  const w = canvas.width, h = canvas.height;
  return {
    re:  ((x - w / 2) / (w / 2)) * SCALE,
    im: -((y - h / 2) / (h / 2)) * SCALE,
  };
}
function resizeCanvas() {
  const rect = wrapper.getBoundingClientRect();
  canvas.width  = rect.width;
  canvas.height = rect.height;
  drawCanvas();
}

const ro = new ResizeObserver(resizeCanvas);
ro.observe(wrapper);
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmtZ(a, b) {
  const bAbs  = Math.abs(b);
  const bSign = b < 0 ? '−' : '+';
  const bStr  = bAbs === 1 ? 'i' : `${bAbs}i`;

  if (b === 0) return `${a}`;
  if (a === 0) return b === 1 ? 'i' : b === -1 ? '−i' : `${b > 0 ? '' : '−'}${bAbs}i`;
  return `${a} ${bSign} ${bStr}`;
}

const OPS = {
  add: {
    generate() {
      const a = randInt(-4, 4), b = randInt(-4, 4);
      const c = randInt(-4, 4), d = randInt(-4, 4);
      const re = a + c, im = b + d;
      if (Math.abs(re) > SCALE || Math.abs(im) > SCALE) return null;
      return { expr: `(${fmtZ(a,b)}) + (${fmtZ(c,d)})`, re, im };
    },
  },
  sub: {
    generate() {
      const a = randInt(-4, 4), b = randInt(-4, 4);
      const c = randInt(-4, 4), d = randInt(-4, 4);
      const re = a - c, im = b - d;
      if (Math.abs(re) > SCALE || Math.abs(im) > SCALE) return null;
      return { expr: `(${fmtZ(a,b)}) − (${fmtZ(c,d)})`, re, im };
    },
  },
  mul: {
    generate() {
      const a = randInt(-2, 2), b = randInt(-2, 2);
      const c = randInt(-2, 2), d = randInt(-2, 2);
      if ((a === 0 && b === 0) || (c === 0 && d === 0)) return null;
      const re = a * c - b * d, im = a * d + b * c;
      if (Math.abs(re) > SCALE || Math.abs(im) > SCALE) return null;
      return { expr: `(${fmtZ(a,b)}) × (${fmtZ(c,d)})`, re, im };
    },
  },
};

function generateQuestion() {
  const keys = Object.keys(OPS);
  let q = null;
  let attempts = 0;
  while (!q && attempts < 30) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    const result = OPS[key].generate();
    if (result) {
      q = { ...result, type: key };
    }
    attempts++;
  }
  return q;
}
function drawCanvas() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = COLOR_GRID;
  ctx.lineWidth = 1;
  for (let v = -SCALE; v <= SCALE; v += GRID_STEP) {
    const { x } = toCanvas(v, 0);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    const { y } = toCanvas(0, v);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.strokeStyle = COLOR_AXIS;
  ctx.lineWidth = 1.5;
  const { x: cx } = toCanvas(0, 0);
  const { y: cy } = toCanvas(0, 0);
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  ctx.font = `bold 12px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = COLOR_LABEL;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let v = -SCALE + 1; v <= SCALE - 1; v++) {
    if (v === 0) continue;
    const { x } = toCanvas(v, 0);
    ctx.fillText(String(v), x, cy + 16);
    const { y } = toCanvas(0, v);
    ctx.textAlign = 'right';
    ctx.fillText(v === 1 ? 'i' : v === -1 ? '−i' : `${v}i`, cx - 8, y);
    ctx.textAlign = 'center';
  }
  ctx.font = `italic 11px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = COLOR_LABEL;
  ctx.textAlign = 'right';
  ctx.fillText('Sumbu Real (Re)', w - 8, cy - 10);
  ctx.textAlign = 'center';
  ctx.fillText('Sumbu Imajiner (Im)', cx, 14);
  if (state.hasGuessed && state.question) {
    const dist = Math.hypot(state.guessRe - state.question.re, state.guessIm - state.question.im);
    const guessColor = dist < 0.5 ? COLOR_GUESS_HIT : dist < 1.5 ? COLOR_GUESS_MID : COLOR_GUESS_MISS;

    const t = toCanvas(state.question.re, state.question.im);
    const g = toCanvas(state.guessRe, state.guessIm);

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(t.x, t.y); ctx.stroke();
    ctx.setLineDash([]);

    ctx.shadowColor = COLOR_TARGET;
    ctx.shadowBlur = 20;
    ctx.fillStyle = COLOR_TARGET;
    ctx.beginPath(); ctx.arc(t.x, t.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = `bold 12px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = COLOR_TARGET;
    ctx.fillText(`z = ${fmtZ(state.question.re, state.question.im)}`, t.x, t.y - 16);

    ctx.shadowColor = guessColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = guessColor;
    ctx.beginPath(); ctx.arc(g.x, g.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = `bold 10px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = guessColor;
    const label = dist < 0.3 ? 'Tepat' : dist < 1.5 ? 'Dekat' : 'Miss';
    ctx.fillText(label, g.x, g.y + 16);
  }
}
function evaluate(distance) {
  if (distance < 0.3) return 'Sempurna! Jawaban Anda benar.';
  if (distance < 0.8) return 'Luar biasa! Hampir tepat.';
  if (distance < 1.5) return 'Bagus! Lumayan dekat.';
  if (distance < 2.5) return 'Mendekati, coba lagi nanti.';
  return 'Meleset! Jawaban masih jauh.';
}
function resetGame() {
  state.hasGuessed = false;
  state.question = generateQuestion();
  if (!state.question) return;
  const { expr, type } = state.question;
  exprEl.textContent = '\\( ' + expr + ' = ? \\)';
  drawCanvas();
  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}
function handleCanvasClick(e) {
  if (state.hasGuessed) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top) * scaleY;

  const { re, im } = toComplex(px, py);
  state.guessRe = re;
  state.guessIm = im;
  state.hasGuessed = true;

  const dist = Math.hypot(re - state.question.re, im - state.question.im);
  const resultMessage = evaluate(dist);

  drawCanvas();
  setTimeout(() => {
    const playAgain = confirm(`${resultMessage}\n\nIngin bermain lagi dengan soal baru?`);
    if (playAgain) {
      resetGame();
    }
  }, 500);
}
function onNewQuestion() {
  resetGame();
}
canvas.addEventListener('click', handleCanvasClick);
newQBtn.addEventListener('click', onNewQuestion);
resetGame();