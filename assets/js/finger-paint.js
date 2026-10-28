import { controls, text, setTitle, instruction, message, button, colors, swatches, chime, tone, soundEffect, speak, unlockAudio, init, reducedMotion, NS } from './toddler-play.js?v=20261028-lang';

const stage = document.getElementById('stage');
const paper = document.getElementById('paper');
const fx = document.getElementById('sparkles');
const outline = document.getElementById('outline');
const stickerLayer = document.getElementById('stickers');
const secretLayer = document.getElementById('secret');
const actions = document.getElementById('actions');
const gallery = document.getElementById('gallery');
const ctx = paper.getContext('2d');
const fxCtx = fx.getContext('2d');
const layer = () => Object.assign(document.createElement('canvas'), { width: paper.width, height: paper.height });
// Committed strokes live in `settled` (base + recent commands); `base` holds strokes older than the undo window.
const base = layer();
const baseCtx = base.getContext('2d');
const settled = layer();
const settledCtx = settled.getContext('2d');
if (!ctx || !fxCtx || !baseCtx || !settledCtx) throw new Error('This browser does not support the drawing canvas.');

const W = 600;
const H = 380;
const CX = 300;
const CY = 190;
const HISTORY = 50;
const COVER = '#aeb0e2';
const brushes = {
    brush: { icon: '🖌️', label: ['Brush', 'Pinceau'], size: 26, gap: 2, wave: 'sine', bend: 1, octave: 1 },
    rainbow: { icon: '🌈', label: ['Rainbow', 'Arc-en-ciel'], size: 30, gap: 2, wave: 'triangle', bend: 1, octave: 1 },
    sparkle: { icon: '✨', label: ['Sparkles', 'Paillettes'], size: 22, gap: 5, wave: 'sine', bend: 1.02, octave: 2 },
    neon: { icon: '💡', label: ['Neon', 'Néon'], size: 20, gap: 2, wave: 'triangle', bend: 1.04, octave: 1 },
    bubble: { icon: '🔵', label: ['Bubbles', 'Bulles'], size: 24, gap: 16, wave: 'sine', bend: 1.6, octave: 1 },
    eraser: { icon: '🧽', label: ['Eraser', 'Gomme'], size: 48, gap: 2, wave: 'triangle', bend: .7, octave: .5 }
};
// C major pentatonic, low to high: the finger's height picks the note.
const scale = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1047];

let tool = 'rainbow';
let lastBrush = 'rainbow';
let color = colors[0].value;
let stickerKind = 'fish';
let tray = 'brushes';
let mirror = 1;
let rainbowHue = 0;
let pointer = null;
let current = null;
let lastPoint = null;
let commands = [];
let basePaper = { tool: 'paper', paper: 'white', picture: 0 };
let baseStickers = [];
let keyPoint = { x: CX, y: CY };
let nextId = 1;
let lastNote = 0;
let lastNoteIndex = -1;
let secretCount = 0;
let coloringCount = 0;

const rand = n => { const r = Math.sin(n * 127.1 + 311.7) * 43758.5453; return r - Math.floor(r); };
function symmetry(count) {
    if (count === 2) return [[1, 0, 0, 1, 0, 0], [-1, 0, 0, 1, W, 0]];
    if (count === 6) return Array.from({ length: 6 }, (_, k) => {
        const c = Math.cos(k * Math.PI / 3);
        const s = Math.sin(k * Math.PI / 3);
        return [c, s, -s, c, CX - c * CX + s * CY, CY - s * CX - c * CY];
    });
    return [[1, 0, 0, 1, 0, 0]];
}
const SYM = { 1: symmetry(1), 2: symmetry(2), 6: symmetry(6) };
const apply = (m, p) => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] });
const mirrored = (p, count = mirror) => SYM[count].map(m => apply(m, p));

function drawPaper(context, command) {
    context.clearRect(0, 0, W, H);
    if (command.paper !== 'secret') return;
    const g = context.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#bba8e3');
    g.addColorStop(1, '#9fbbea');
    context.fillStyle = g;
    context.fillRect(0, 0, W, H);
    context.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 80; i++) {
        context.beginPath();
        context.arc(rand(i * 3 + 1) * W, rand(i * 3 + 2) * H, 1.5 + rand(i * 3 + 3) * 3, 0, Math.PI * 2);
        context.fill();
    }
    context.font = '900 64px Nunito, "Trebuchet MS", sans-serif';
    context.textAlign = 'center';
    context.fillStyle = 'rgba(255,255,255,.75)';
    context.fillText('?', CX, CY + 22);
}
function starPath(context, x, y, r) {
    context.beginPath();
    for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        const d = k % 2 ? r * .32 : r;
        context.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    context.closePath();
}
function drawPiece(context, c, i) {
    const p = c.points[i];
    const prev = c.points[i - 1] || { x: p.x - .01, y: p.y, hue: p.hue };
    const s = c.size;
    const line = (style, width) => {
        context.strokeStyle = style;
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(prev.x, prev.y);
        context.lineTo(p.x, p.y);
        context.stroke();
    };
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = 1;
    if (c.tool === 'reveal' || (c.tool === 'eraser' && !c.cover)) {
        context.globalCompositeOperation = 'destination-out';
        line('#000', s);
    } else if (c.tool === 'eraser') line(COVER, s);
    else if (c.tool === 'rainbow') {
        let style = `hsl(${p.hue}, 85%, 63%)`;
        if (c.points[i - 1]) {
            style = context.createLinearGradient(prev.x, prev.y, p.x, p.y);
            style.addColorStop(0, `hsl(${prev.hue}, 85%, 63%)`);
            style.addColorStop(1, `hsl(${p.hue}, 85%, 63%)`);
        }
        line(style, s);
    } else if (c.tool === 'neon') {
        context.shadowColor = c.color;
        context.shadowBlur = 22;
        line(c.color, s * .75);
        context.shadowBlur = 0;
        line('rgba(255,255,255,.85)', s * .25);
    } else if (c.tool === 'sparkle') {
        context.globalAlpha = .5;
        line(c.color, s * .3);
        const tints = [c.color, '#ffd54a', '#ffe9a8', c.color];
        for (let k = 0; k < 3; k++) {
            const n = c.seed + i * 7 + k;
            const a = rand(n) * Math.PI * 2;
            const d = rand(n + .5) * s * .8;
            context.globalAlpha = .9;
            context.fillStyle = tints[(i + k) % tints.length];
            context.beginPath();
            context.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 1.2 + rand(n + .25) * 2.4, 0, Math.PI * 2);
            context.fill();
        }
        if (i % 3 === 0) {
            context.fillStyle = '#ffcf3f';
            starPath(context, p.x, p.y, 6 + rand(c.seed + i) * 4);
            context.fill();
        }
    } else if (c.tool === 'bubble') {
        const r = s * (.35 + rand(c.seed + i) * .45);
        context.fillStyle = c.color;
        context.strokeStyle = c.color;
        context.lineWidth = 2.5;
        context.globalAlpha = .22;
        context.beginPath();
        context.arc(p.x, p.y, r, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = .9;
        context.stroke();
        context.fillStyle = '#fff';
        context.beginPath();
        context.arc(p.x - r * .35, p.y - r * .35, r * .2, 0, Math.PI * 2);
        context.fill();
    } else line(c.color, s);
}
// Draws a command, or only its points from `from` onwards (incremental live strokes).
function drawCommand(context, command, from = 0) {
    context.save();
    context.setTransform(2, 0, 0, 2, 0, 0);
    if (command.tool === 'paper') drawPaper(context, command);
    else if (command.tool !== 'sticker') {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        SYM[command.mirror || 1].forEach(m => {
            context.save();
            context.transform(...m);
            for (let i = from; i < command.points.length; i++) drawPiece(context, command, i);
            context.restore();
        });
    }
    context.restore();
}

const INK = '#344359';
const eyes = (x1, x2, y, r = 5.5) => `<g class="blink"><circle cx="${x1}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x1 - 1}" cy="${y}" r="${r * .55}" fill="${INK}"/>${x2 === null ? '' : `<circle cx="${x2}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x2 - 1}" cy="${y}" r="${r * .55}" fill="${INK}"/>`}</g>`;
const art = {
    fish: c => `<path d="M20 0L44 -19Q37 0 44 19Z" fill="${c}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M-6 -19Q6 -36 16 -15" fill="${c}" stroke="${INK}" stroke-width="2.5"/><ellipse cx="-4" cy="0" rx="30" ry="21" fill="${c}" stroke="${INK}" stroke-width="2.5"/><path d="M2 -9Q9 0 2 9M12 -8Q18 0 12 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>${eyes(-17, null, -5, 6)}<path d="M-29 7Q-24 12 -18 8" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="-12" cy="9" rx="5" ry="3" fill="#f39b9c" opacity=".8"/>`,
    bird: c => `<path d="M-6 27v9M6 27v9" stroke="#f08a3c" stroke-width="3.5" stroke-linecap="round"/><path d="M-2 -18Q0 -34 12 -27Q5 -24 6 -19" fill="${c}" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="4" r="25" fill="${c}" stroke="${INK}" stroke-width="2.5"/><ellipse class="flap" cx="9" cy="9" rx="13" ry="9" fill="#fff" opacity=".7"/><path d="M-23 -1L-37 4L-23 10Z" fill="#f8b544" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>${eyes(-11, null, -5)}<ellipse cx="-5" cy="11" rx="5" ry="3" fill="#f39b9c" opacity=".8"/>`,
    ladybug: () => `<path d="M-8 -34Q-13 -44 -19 -42M8 -34Q13 -44 19 -42M-14 26l-8 8M14 26l8 8M-26 6h-10M26 6h10" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="-23" r="14" fill="${INK}"/><circle cx="0" cy="6" r="26" fill="#e8505b" stroke="${INK}" stroke-width="2.5"/><path d="M0 -20V32" stroke="${INK}" stroke-width="2.5"/><g fill="${INK}"><circle cx="-12" cy="2" r="5"/><circle cx="12" cy="2" r="5"/><circle cx="-10" cy="19" r="4"/><circle cx="10" cy="19" r="4"/></g>${eyes(-6, 6, -28, 4)}`,
    sun: () => `<g class="rays" stroke="#f6a93b" stroke-width="5" stroke-linecap="round">${Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `<path d="M${(Math.cos(a) * 29).toFixed(1)} ${(Math.sin(a) * 29).toFixed(1)}L${(Math.cos(a) * 39).toFixed(1)} ${(Math.sin(a) * 39).toFixed(1)}"/>`; }).join('')}</g><circle r="23" fill="#ffd54a" stroke="#f0a43a" stroke-width="2.5"/><g class="blink" fill="${INK}"><circle cx="-8" cy="-4" r="3.3"/><circle cx="8" cy="-4" r="3.3"/></g><path d="M-9 6Q0 15 9 6" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><g fill="#f39b9c" opacity=".7"><ellipse cx="-14" cy="5" rx="4" ry="2.5"/><ellipse cx="14" cy="5" rx="4" ry="2.5"/></g>`
};
const stickers = {
    fish: { label: ['Fish', 'Poisson'], sound: 'splash' },
    bird: { label: ['Bird', 'Oiseau'], sound: 'flutter' },
    ladybug: { label: ['Ladybug', 'Coccinelle'], sound: 'squeak' },
    sun: { label: ['Sunny', 'Soleil'], sound: 'sparkle' }
};
const icon = kind => `<svg viewBox="-42 -46 84 84" width="36" height="36" aria-hidden="true">${art[kind](color)}</svg>`;
const flower = (x, y, c) => `<path d="M${x} ${y}v34" stroke="#3f9a5a" stroke-width="5"/><g fill="${c}">${Array.from({ length: 5 }, (_, k) => `<circle cx="${(x + Math.cos(k * 1.2566) * 11).toFixed(1)}" cy="${(y + Math.sin(k * 1.2566) * 11).toFixed(1)}" r="9"/>`).join('')}</g><circle cx="${x}" cy="${y}" r="7" fill="#ffe27a"/>`;
const secrets = [
    `<rect width="600" height="380" fill="#bfe8ff"/><g fill="none" stroke-width="24">${['#ee6374', '#f4ab45', '#f8d85b', '#58b98c', '#5b9fe4', '#ad79d1'].map((c, k) => { const r = 230 - k * 24; return `<path d="M${300 - r} 330A${r} ${r} 0 0 1 ${300 + r} 330" stroke="${c}"/>`; }).join('')}</g><g fill="#fff"><path d="M40 110Q20 85 48 78Q50 50 80 60Q104 42 120 70Q152 66 150 92Q154 112 126 112Z"/><path d="M420 150Q405 128 430 122Q434 98 460 106Q482 92 496 116Q526 112 526 136Q528 152 502 152Z"/></g><g transform="translate(520 70) scale(1.4)">${art.sun()}</g><path d="M0 300Q150 240 300 300T600 290V380H0Z" fill="#7cc979"/><path d="M0 345Q200 305 400 348T600 332V380H0Z" fill="#58b98c"/>${flower(70, 318, '#ee6374')}${flower(170, 336, '#ad79d1')}${flower(440, 334, '#f4ab45')}${flower(545, 318, '#5b9fe4')}<g transform="translate(250 345) scale(.8)">${art.ladybug()}</g>`,
    `<defs><linearGradient id="sea" x2="0" y2="1"><stop offset="0" stop-color="#7fd3f0"/><stop offset="1" stop-color="#2f86c8"/></linearGradient></defs><rect width="600" height="380" fill="url(#sea)"/><g fill="#fff" opacity=".18"><path d="M80 0L140 0L60 380L20 380Z"/><path d="M330 0L380 0L300 380L250 380Z"/></g><path d="M0 330Q150 300 300 335T600 320V380H0Z" fill="#f3d79a"/><g fill="none" stroke="#3fae6a" stroke-width="9" stroke-linecap="round"><path d="M60 345Q40 300 65 265Q85 230 62 195"/><path d="M540 340Q560 295 535 260Q515 225 540 190"/><path d="M95 345Q110 310 92 280"/></g><g transform="translate(300 180) scale(2.6)">${art.fish('#f4ab45')}</g><g transform="translate(130 95) scale(1.1)">${art.fish('#ee6374')}</g><g transform="translate(480 110) scale(-1.1 1.1)">${art.fish('#ad79d1')}</g><g fill="#fff" fill-opacity=".45" stroke="#fff"><circle cx="210" cy="130" r="9"/><circle cx="196" cy="98" r="6"/><circle cx="214" cy="70" r="4"/><circle cx="420" cy="230" r="7"/></g><path d="M470 345l8 -18l8 18l19 1l-15 12l6 18l-18 -10l-18 10l6 -18l-15 -12Z" fill="#ee6374"/>`
];
const pictures = [
    '',
    '<path d="M300 310V185M300 253Q235 210 212 238Q220 280 300 253M300 276Q356 224 383 251Q368 291 300 276"/><g>' + Array.from({ length: 8 }, (_, i) => `<ellipse cx="300" cy="113" rx="28" ry="40" transform="rotate(${i * 45} 300 170)"/>`).join('') + '</g><circle cx="300" cy="170" r="34"/>',
    '<path d="M125 263L143 212L207 198L248 133H360L410 198L469 218V263Z"/><path d="M230 195L258 151H298V195ZM317 151H352L382 195H317Z"/><circle cx="212" cy="267" r="33"/><circle cx="411" cy="267" r="33"/>',
    '<path d="M300 192Q150 31 140 133Q135 208 277 204Q164 218 185 291Q217 344 300 213M300 192Q450 31 460 133Q465 208 323 204Q436 218 415 291Q383 344 300 213"/><ellipse cx="300" cy="204" rx="15" ry="74"/><path d="M297 139L279 115M303 139L321 115"/>'
];
const outlineMarkup = sheet => sheet.paper === 'coloring' ? `<g fill="none" stroke="#526179" stroke-opacity=".55" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${pictures[sheet.picture]}</g>` : '';

function currentPaper() {
    for (let i = commands.length - 1; i >= 0; i--) if (commands[i].tool === 'paper') return commands[i];
    return basePaper;
}
// Stickers after the most recent paper change (including ones that left the undo window).
function liveStickers() {
    const list = [];
    let i = commands.length - 1;
    for (; i >= 0 && commands[i].tool !== 'paper'; i--) if (commands[i].tool === 'sticker') list.unshift(commands[i]);
    return i < 0 ? baseStickers.concat(list) : list;
}
function commit(command) {
    commands.push(command);
    drawCommand(settledCtx, command);
    if (commands.length > HISTORY) {
        const old = commands.shift();
        drawCommand(baseCtx, old);
        if (old.tool === 'paper') { basePaper = old; baseStickers = []; }
        if (old.tool === 'sticker') baseStickers = baseStickers.concat(old).slice(-60);
    }
}
function repaint() {
    ctx.clearRect(0, 0, paper.width, paper.height);
    ctx.drawImage(settled, 0, 0);
    if (current) drawCommand(ctx, current);
}
let stickerKey = '';
function renderStickers(fresh) {
    const list = liveStickers();
    const key = list.map(s => s.id).join(',');
    if (key === stickerKey) return;
    stickerKey = key;
    stickerLayer.innerHTML = list.flatMap(s => s.spots.map(spot => ({ s, spot }))).slice(-90).map(({ s, spot }, i) =>
        `<g transform="translate(${spot.x.toFixed(1)} ${spot.y.toFixed(1)})${spot.flip ? ' scale(-1 1)' : ''}"><g class="sticker${s.id === fresh ? ' pop' : ''}"><g class="critter" style="animation-delay:-${(i * .37 % 3).toFixed(2)}s">${art[s.kind](s.color)}</g></g></g>`).join('');
}
let shownSecret = -1;
function drawOutline() {
    const sheet = currentPaper();
    const guide = sheet.paper === 'night' ? '#d9d4ff' : '#8f7fbf';
    let guides = '';
    if (mirror === 2) guides = '<path d="M300 0V380"/>';
    if (mirror === 6) guides = [0, 60, 120].map(a => `<path d="M${CX - 400} ${CY}H${CX + 400}" transform="rotate(${a} ${CX} ${CY})"/>`).join('');
    let cursor = '';
    if (paper.matches(':focus-visible')) cursor = `<circle cx="${keyPoint.x}" cy="${keyPoint.y}" r="18" fill="none" stroke="#fff" stroke-width="6"/><circle cx="${keyPoint.x}" cy="${keyPoint.y}" r="18" fill="none" stroke="#284f9e" stroke-width="3" stroke-dasharray="4 4"/>`;
    outline.innerHTML = outlineMarkup(sheet) + (guides ? `<g stroke="${guide}" stroke-opacity=".45" stroke-width="2" stroke-dasharray="6 8">${guides}</g>` : '') + cursor;
}
function syncScene(fresh) {
    const sheet = currentPaper();
    stage.dataset.paper = sheet.paper;
    const secret = sheet.paper === 'secret' ? sheet.picture : -1;
    if (secret !== shownSecret) {
        shownSecret = secret;
        secretLayer.innerHTML = secret < 0 ? '' : secrets[secret];
    }
    drawOutline();
    renderStickers(fresh);
}
// ---- magic particles (overlay only, never part of the painting) ----
const particles = [];
let fxFrame = 0;
let fxTime = 0;
function spawn(kind, x, y, extra = {}) {
    if (reducedMotion() || document.hidden || particles.length >= 140 || x < -20 || x > W + 20 || y < -20 || y > H + 20) return;
    particles.push({
        kind, x, y, age: 0, life: kind === 'note' ? 1.3 : 1,
        vx: (Math.random() - .5) * 30, vy: kind === 'twinkle' ? -10 - Math.random() * 20 : -35 - Math.random() * 30,
        size: 5 + Math.random() * 6, color: '#ffcf3f', spin: Math.random() * 6, ...extra
    });
    if (!fxFrame) { fxTime = performance.now(); fxFrame = requestAnimationFrame(tick); }
}
function clearParticles() {
    particles.length = 0;
    cancelAnimationFrame(fxFrame);
    fxFrame = 0;
    fxCtx.setTransform(1, 0, 0, 1, 0, 0);
    fxCtx.clearRect(0, 0, fx.width, fx.height);
}
function tick(now) {
    const dt = Math.min(.05, (now - fxTime) / 1000);
    fxTime = now;
    fxFrame = 0;
    fxCtx.setTransform(1, 0, 0, 1, 0, 0);
    fxCtx.clearRect(0, 0, fx.width, fx.height);
    if (document.hidden) { particles.length = 0; return; }
    fxCtx.setTransform(2, 0, 0, 2, 0, 0);
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.age >= p.life) { particles.splice(i, 1); continue; }
        const t = p.age / p.life;
        fxCtx.globalAlpha = 1 - t * t;
        fxCtx.fillStyle = p.color;
        fxCtx.strokeStyle = p.color;
        if (p.kind === 'twinkle') {
            starPath(fxCtx, p.x, p.y, p.size * (.6 + .4 * Math.sin(p.age * 14 + p.spin)));
            fxCtx.fill();
        } else if (p.kind === 'bubble') {
            fxCtx.lineWidth = 2;
            fxCtx.beginPath();
            fxCtx.arc(p.x + Math.sin(p.age * 6 + p.spin) * 4, p.y, p.size, 0, Math.PI * 2);
            fxCtx.stroke();
        } else {
            fxCtx.font = `900 ${Math.round(p.size * 2.6)}px "Trebuchet MS", sans-serif`;
            fxCtx.textAlign = 'center';
            fxCtx.fillText(p.spin > 3 ? '♫' : '♪', p.x + Math.sin(p.age * 5) * 6, p.y);
        }
    }
    fxCtx.globalAlpha = 1;
    if (particles.length) fxFrame = requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange', () => { if (document.hidden) clearParticles(); });
const sparkleColors = () => [color, '#ffcf3f', '#ffffff', '#ff9fd0'];
function magicTrail(command, p, index) {
    if (reducedMotion()) return;
    mirrored(p, command.mirror).forEach(q => {
        if (command.tool === 'sparkle') spawn('twinkle', q.x, q.y, { color: sparkleColors()[(index + Math.floor(q.x)) % 4] });
        else if (command.tool === 'bubble' && index % 2 === 0) spawn('bubble', q.x, q.y, { color: command.color });
        else if ((command.tool === 'reveal' || command.tool === 'neon') && index % 6 === 0) spawn('twinkle', q.x, q.y, { color: '#fff7c2', size: 4 });
    });
}

// ---- musical painting: higher finger, higher note ----
function playNote(p) {
    const now = performance.now();
    const index = Math.round((1 - p.y / H) * (scale.length - 1));
    if (now - lastNote < 170 || (index === lastNoteIndex && now - lastNote < 360)) return;
    lastNote = now;
    lastNoteIndex = index;
    const b = brushes[tool] || brushes.brush;
    tone([scale[index] * b.octave], b.wave, b.bend);
    if (tool !== 'eraser' && Math.random() < .3) spawn('note', p.x, p.y - 14, { color: tool === 'rainbow' ? `hsl(${rainbowHue}, 80%, 55%)` : color });
}

// ---- painting input ----
function position(event) {
    const rect = paper.getBoundingClientRect();
    return {
        x: Math.max(0, Math.min(W, (event.clientX - rect.left) / rect.width * W)),
        y: Math.max(0, Math.min(H, (event.clientY - rect.top) / rect.height * H))
    };
}
function newStroke() {
    const secret = currentPaper().paper === 'secret';
    const kind = secret && tool !== 'eraser' ? 'reveal' : tool;
    return { tool: kind, id: nextId++, color, size: kind === 'reveal' ? 46 : brushes[tool].size, seed: Math.floor(Math.random() * 1e5), mirror, cover: secret && tool === 'eraser', points: [] };
}
function addPoint(p) {
    p.hue = rainbowHue;
    rainbowHue = (rainbowHue + 6) % 360;
    current.points.push(p);
    drawCommand(ctx, current, current.points.length - 1);
    magicTrail(current, p, current.points.length);
    playNote(p);
    lastPoint = p;
}
function placeSticker(p) {
    const spots = SYM[mirror].map((m, k) => ({ ...apply(m, p), flip: mirror === 2 && k === 1 }))
        .filter(s => s.x > -20 && s.x < W + 20 && s.y > -20 && s.y < H + 20);
    const command = { tool: 'sticker', id: nextId++, kind: stickerKind, color, spots };
    commit(command);
    syncScene(command.id);
    refreshUndo();
    soundEffect(stickers[stickerKind].sound);
    spots.forEach(s => spawn('twinkle', s.x, s.y - 30, { color: '#ffcf3f' }));
}
paper.addEventListener('pointerdown', event => {
    if (pointer !== null || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    unlockAudio();
    const p = position(event);
    if (tool === 'sticker') { placeSticker(p); return; }
    pointer = event.pointerId;
    paper.setPointerCapture(pointer);
    current = newStroke();
    addPoint(p);
});
paper.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer || !current) return;
    event.preventDefault();
    const p = position(event);
    if (Math.hypot(p.x - lastPoint.x, p.y - lastPoint.y) < brushes[tool].gap) return;
    addPoint(p);
    if (current.points.length >= 1000) {
        commit(current);
        current = { ...current, id: nextId++, points: [lastPoint] };
    }
});
function finish(event) {
    if (event.pointerId !== pointer) return;
    if (current) commit(current);
    current = null;
    const id = pointer;
    pointer = null;
    if (paper.hasPointerCapture(id)) paper.releasePointerCapture(id);
    refreshUndo();
}
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => paper.addEventListener(type, finish));
window.addEventListener('blur', () => { if (pointer !== null) finish({ pointerId: pointer }); });
window.addEventListener('resize', () => { if (pointer !== null) finish({ pointerId: pointer }); });
document.addEventListener('visibilitychange', () => { if (document.hidden && pointer !== null) finish({ pointerId: pointer }); });
function finishStroke() {
    if (pointer !== null) finish({ pointerId: pointer });
}
paper.addEventListener('keydown', event => {
    const moves = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, -15], ArrowDown: [0, 15] };
    if (moves[event.key]) {
        event.preventDefault();
        keyPoint.x = Math.max(15, Math.min(585, keyPoint.x + moves[event.key][0]));
        keyPoint.y = Math.max(15, Math.min(365, keyPoint.y + moves[event.key][1]));
        drawOutline();
    } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (pointer !== null) return;
        unlockAudio();
        if (tool === 'sticker') { placeSticker({ ...keyPoint }); return; }
        current = newStroke();
        addPoint({ ...keyPoint });
        commit(current);
        current = null;
        refreshUndo();
    }
});
paper.addEventListener('focus', drawOutline);
paper.addEventListener('blur', drawOutline);
// ---- actions ----
const papers = {
    white: { icon: '⬜', label: ['White paper', 'Papier blanc'], say: ['Fresh white paper! Undo brings your picture back.', 'Papier blanc tout neuf ! Annuler retrouve ton dessin.'] },
    night: { icon: '🌙', label: ['Night paper', 'Papier de nuit'], say: ['Night paper! Try the neon brush.', 'Papier de nuit ! Essaie le pinceau néon.'] },
    kraft: { icon: '📦', label: ['Brown paper', 'Papier kraft'], say: ['Cozy brown paper!', 'Un joli papier kraft !'] },
    secret: { icon: '🎁', label: ['Secret picture', 'Image secrète'], say: ['A secret picture is hiding. Paint to find it!', 'Une image secrète se cache. Peins pour la trouver !'] },
    coloring: { icon: '🖍️', label: ['Coloring page', 'Coloriage'], say: ['A coloring page! Fill it with color.', 'Un coloriage ! Remplis-le de couleurs.'] }
};
let danceTimer = 0;
function refreshUndo() {
    const undo = actions.querySelector('[data-focus-key="undo"]');
    if (undo) undo.disabled = commands.length === 0;
}
function undo() {
    finishStroke();
    if (!commands.length) return;
    commands.pop();
    settledCtx.clearRect(0, 0, settled.width, settled.height);
    settledCtx.drawImage(base, 0, 0);
    commands.forEach(command => drawCommand(settledCtx, command));
    repaint();
    syncScene();
    refreshUndo();
    soundEffect('whoosh');
    message(['Back one little step!', 'Un petit pas en arrière !']);
}
function choosePaper(kind) {
    finishStroke();
    let picture = 0;
    if (kind === 'secret') picture = secretCount++ % secrets.length;
    if (kind === 'coloring') picture = 1 + coloringCount++ % (pictures.length - 1);
    commit({ tool: 'paper', id: nextId++, paper: kind, picture });
    repaint();
    clearParticles();
    tray = 'brushes';
    if (tool === 'sticker') tool = lastBrush;
    updateUI();
    soundEffect('whoosh');
    message(papers[kind].say, true);
}
function cycleMirror() {
    finishStroke();
    mirror = mirror === 1 ? 2 : mirror === 2 ? 6 : 1;
    updateUI();
    soundEffect(mirror === 1 ? 'pop' : 'sparkle');
    message(mirror === 2 ? ['Mirror magic! Both sides paint together.', 'Miroir magique ! Les deux côtés peignent ensemble.']
        : mirror === 6 ? ['Kaleidoscope! Six brushes paint at once.', 'Kaléidoscope ! Six pinceaux peignent à la fois.']
            : ['Mirror off. One brush again.', 'Miroir éteint. Un seul pinceau.'], mirror !== 1);
}
function dance() {
    finishStroke();
    const spots = liveStickers().flatMap(s => s.spots);
    if (!spots.length) {
        message(['Tap the paper to add friends. Then they can dance!', 'Touche le papier pour ajouter des amis. Ensuite, ils dansent !'], true);
        return;
    }
    stickerLayer.classList.remove('dancing');
    void stickerLayer.getBoundingClientRect();
    stickerLayer.classList.add('dancing');
    clearTimeout(danceTimer);
    danceTimer = setTimeout(() => stickerLayer.classList.remove('dancing'), 1800);
    tone([523, 659, 784, 659, 1047], 'triangle', 1.02);
    spots.slice(-12).forEach((s, i) => spawn('note', s.x, s.y - 40, { color: colors[i % colors.length].value, size: 7 }));
    message(['Look! Your friends dance and sing!', 'Regarde ! Tes amis dansent et chantent !']);
}
function selectTool(next) {
    finishStroke();
    tool = next;
    lastBrush = next;
    updateUI();
    soundEffect(next === 'sparkle' ? 'sparkle' : next === 'bubble' ? 'boing' : 'pop');
    if (next === 'neon' && currentPaper().paper !== 'night') message(['Neon glows brightest on night paper!', 'Le néon brille encore plus sur le papier de nuit !']);
    else message(brushes[next].label);
}
function selectSticker(kind) {
    finishStroke();
    tool = 'sticker';
    stickerKind = kind;
    updateUI();
    soundEffect(stickers[kind].sound);
    message(stickers[kind].label, true);
}

// ---- interface ----
function addButton(iconHtml, label, key, action, parent, pressed) {
    const el = button(iconHtml, label, action, parent);
    el.dataset.focusKey = key;
    if (pressed !== undefined) el.setAttribute('aria-pressed', String(pressed));
    return el;
}
function currentInstruction() {
    const secret = currentPaper().paper === 'secret';
    if (tool === 'sticker') return ['Tap the paper to add a friend!', 'Touche le papier pour ajouter un ami !'];
    if (tool === 'eraser') return secret ? ['Rub to hide the picture again!', 'Frotte pour recacher l\'image !'] : ['Rub to erase. Your colors are waiting!', 'Frotte pour effacer. Tes couleurs t\'attendent !'];
    if (secret) return ['Paint to find the hidden picture!', 'Peins pour trouver l\'image cachée !'];
    return {
        brush: ['Paint! High up makes high notes.', 'Peins ! En haut, les notes sont aiguës.'],
        rainbow: ['Slide your finger to sing a rainbow!', 'Glisse ton doigt pour chanter un arc-en-ciel !'],
        sparkle: ['Swish! Make twinkly sparkles!', 'Hop ! Fais briller des paillettes !'],
        neon: ['Draw glowing neon lines!', 'Dessine des lignes néon qui brillent !'],
        bubble: ['Slide to blow bubbles!', 'Glisse pour souffler des bulles !']
    }[tool];
}
function updateUI() {
    setTitle(['Magic Finger Painting', 'Peinture magique']);
    instruction(currentInstruction());
    paper.setAttribute('aria-label', text(['Drawing paper. Arrow keys move; space paints.', 'Papier à dessin. Les flèches déplacent ; espace peint.']));
    controls.replaceChildren();
    controls.dataset.tray = tray;
    if (tray === 'brushes') {
        Object.entries(brushes).forEach(([key, b]) => addButton(b.icon, b.label, key, () => selectTool(key), controls, tool === key));
    } else {
        addButton('🖌️', ['Paint', 'Peindre'], 'back', () => { tray = 'brushes'; selectTool(tool === 'sticker' ? lastBrush : tool); }, controls);
        if (tray === 'stickers') {
            Object.entries(stickers).forEach(([key, s]) => addButton(icon(key), s.label, key, () => selectSticker(key), controls, tool === 'sticker' && stickerKind === key));
            addButton('🎶', ['Dance!', 'Danse !'], 'dance', dance, controls);
        } else {
            const sheet = currentPaper().paper;
            Object.entries(papers).forEach(([key, p]) => addButton(p.icon, p.label, key, () => choosePaper(key), controls, sheet === key));
        }
    }
    actions.replaceChildren();
    actions.setAttribute('aria-label', text(['Magic and actions', 'Magie et actions']));
    addButton(mirror === 6 ? '❄️' : '🦋', mirror === 6 ? ['Kaleidoscope', 'Kaléidoscope'] : mirror === 2 ? ['Mirror on', 'Miroir actif'] : ['Mirror', 'Miroir'], 'mirror', cycleMirror, actions, mirror !== 1);
    addButton('🐞', ['Stickers', 'Autocollants'], 'stickers', () => {
        finishStroke();
        tray = tray === 'stickers' ? 'brushes' : 'stickers';
        if (tray === 'stickers') selectSticker(stickerKind);
        else selectTool(lastBrush);
    }, actions, tray === 'stickers');
    addButton('📄', ['New paper', 'Papier neuf'], 'paper', () => {
        finishStroke();
        tray = tray === 'papers' ? 'brushes' : 'papers';
        updateUI();
        if (tray === 'papers') message(['Pick a paper!', 'Choisis un papier !'], true);
    }, actions, tray === 'papers');
    addButton('↩️', ['Undo', 'Annuler'], 'undo', undo, actions).disabled = commands.length === 0;
    addButton('🖼️', ['Done!', 'Fini !'], 'done', showGallery, actions);
    swatches(tool === 'eraser' ? null : color, selected => {
        finishStroke();
        color = selected.value;
        if (tool === 'eraser' || tool === 'rainbow') tool = 'brush';
        updateUI();
        message(selected.name, true);
    });
    syncScene();
    galleryText();
}
// ---- gallery ----
const galleryArt = document.getElementById('gallery-art');
const saveButton = document.getElementById('save-art');
const keepButton = document.getElementById('keep-painting');
const paperFill = { white: '#ffffff', coloring: '#ffffff', night: '#1d2347', kraft: '#dcbf93', secret: '#bfe8ff' };
let artUrl = '';
let artBlob = null;
let galleryBusy = false;
function galleryText() {
    document.getElementById('gallery-title').textContent = text(['What a masterpiece!', 'Quel chef-d\'œuvre !']);
    galleryArt.alt = text(['Your painting in a golden frame', 'Ton dessin dans un cadre doré']);
    [[keepButton, '🖌️', ['Keep painting', 'Continuer à peindre']], [saveButton, '💾', ['Save picture (grown-ups)', 'Enregistrer (adultes)']]].forEach(([el, emoji, label]) => {
        el.innerHTML = `<span class="tool-icon" aria-hidden="true">${emoji}</span><span class="tool-label"></span>`;
        el.querySelector('.tool-label').textContent = text(label);
        el.setAttribute('aria-label', text(label));
    });
    document.getElementById('gallery-note').textContent = text(['The picture stays on this device. Nothing is uploaded.', 'L\'image reste sur cet appareil. Rien n\'est envoyé.']);
}
function svgImage(content) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('A picture layer could not be drawn.'));
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="${NS}" viewBox="0 0 600 380" width="1200" height="760" preserveAspectRatio="none">${content}</svg>`);
    });
}
async function exportPicture() {
    const out = layer();
    const o = out.getContext('2d');
    const sheet = currentPaper();
    o.fillStyle = paperFill[sheet.paper];
    o.fillRect(0, 0, out.width, out.height);
    if (sheet.paper === 'night') {
        o.fillStyle = '#ffffff88';
        for (let i = 0; i < 40; i++) o.fillRect(rand(i + 9) * out.width, rand(i + 99) * out.height, 3, 3);
    }
    if (sheet.paper === 'secret') o.drawImage(await svgImage(secrets[sheet.picture]), 0, 0, out.width, out.height);
    o.drawImage(settled, 0, 0);
    const top = outlineMarkup(sheet) + stickerLayer.innerHTML;
    if (top) o.drawImage(await svgImage(top), 0, 0, out.width, out.height);
    return new Promise((resolve, reject) => out.toBlob(blob => blob ? resolve(blob) : reject(new Error('The picture could not be saved.')), 'image/png'));
}
function confetti() {
    if (reducedMotion()) return;
    const card = gallery.querySelector('.gallery-card');
    for (let i = 0; i < 28; i++) {
        const bit = document.createElement('span');
        bit.className = 'confetti';
        bit.setAttribute('aria-hidden', 'true');
        bit.style.left = (4 + Math.random() * 92) + '%';
        bit.style.background = colors[i % colors.length].value;
        bit.style.animationDelay = (Math.random() * .5).toFixed(2) + 's';
        bit.style.setProperty('--drift', ((Math.random() - .5) * 120).toFixed(0) + 'px');
        card.appendChild(bit);
        setTimeout(() => bit.remove(), 2600);
    }
}
async function showGallery() {
    finishStroke();
    if (galleryBusy) return;
    galleryBusy = true;
    try {
        artBlob = await exportPicture();
        if (artUrl) URL.revokeObjectURL(artUrl);
        artUrl = URL.createObjectURL(artBlob);
        galleryArt.src = artUrl;
        galleryText();
        if (typeof gallery.showModal === 'function') gallery.showModal(); else gallery.setAttribute('open', '');
        keepButton.focus();
        chime(true);
        confetti();
        setTimeout(() => speak(text(['Wow! What a beautiful painting!', 'Bravo ! Quel joli dessin !'])), 400);
    } catch (error) {
        console.error('Unable to frame the painting:', error);
        message(['Oops, the frame is shy. Keep painting!', 'Oups, le cadre est timide. Continue à peindre !']);
    } finally {
        galleryBusy = false;
    }
}
function closeGallery() {
    if (typeof gallery.close === 'function' && gallery.open) gallery.close(); else gallery.removeAttribute('open');
}
keepButton.addEventListener('click', closeGallery);
gallery.addEventListener('close', () => {
    gallery.querySelectorAll('.confetti').forEach(bit => bit.remove());
    document.querySelector('[data-focus-key="done"]')?.focus({ preventScroll: true });
    message(['Your painting is still here. Keep going!', 'Ton dessin est toujours là. Continue !']);
});
saveButton.addEventListener('click', () => {
    if (!artUrl) return;
    const link = document.createElement('a');
    link.href = artUrl;
    link.download = `ba-by-painting-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    soundEffect('pop');
});

init(() => {
    updateUI();
    message(['Your paper, your imagination!', 'Ton papier, ton imagination !']);
});
