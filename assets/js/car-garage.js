import { stage, controls, palette, text, setTitle, instruction, message, button, svg, node, colors, swatches, init, sceneButton, soundEffect, tone, chime, celebrate, reducedMotion, unlockAudio, react } from './toddler-play.js?v=20261028-lang';

// ---------- Vehicles (all drawn in "car space": wheels sit on y = 306, centre x ~ 305) ----------
const FLOOR = 306;
const vehicles = [
    { icon: '🚗', label: ['Car', 'Voiture'], face: [308, 226], light: [468, 234],
        body: 'M135 266L150 217L207 205L243 146Q255 130 283 130H355Q376 130 391 151L424 205L464 215Q482 222 482 243V266Z',
        windows: '<path d="M229 202L257 151H305V202ZM321 151H352Q364 151 373 165L396 202H321Z"/>',
        wheels: [[209, 34], [417, 34]], rects: [[150, 206, 328, 56], [250, 138, 130, 64]] },
    { icon: '🚌', label: ['Bus', 'Bus'], face: [300, 220], light: [472, 246],
        body: 'M158 124H457Q485 124 485 152V269H130V152Q130 124 158 124Z',
        windows: '<rect x="151" y="144" width="60" height="50" rx="9"/><rect x="228" y="144" width="60" height="50" rx="9"/><rect x="305" y="144" width="60" height="50" rx="9"/><rect x="382" y="144" width="80" height="50" rx="9"/>',
        wheels: [[200, 34], [420, 34]], rects: [[136, 128, 344, 136]] },
    { icon: '🚚', label: ['Truck', 'Camion'], face: [236, 196], light: [470, 242],
        body: 'M140 143H330Q345 143 345 158V266H125V158Q125 143 140 143ZM356 170H426L479 221V266H356Z',
        windows: '<path d="M372 184H416L447 218H372Z"/>',
        wheels: [[209, 34], [417, 34]], rects: [[130, 148, 210, 114], [360, 178, 114, 84]] },
    { icon: '🚜', label: ['Tractor', 'Tracteur'], face: [398, 208], light: [472, 206], treads: true,
        body: 'M165 255V125Q165 110 180 110H288Q300 110 303 123L316 185H458Q482 185 482 207V255Z',
        windows: '<path d="M184 128H282L294 182H184Z"/>',
        extra: '<rect x="430" y="146" width="13" height="42" rx="4" fill="#4b5568"/><circle cx="436" cy="138" r="7" fill="#c5ccd6" class="cg-puff"/>',
        wheels: [[215, 56], [432, 32]], rects: [[170, 115, 125, 68], [278, 188, 198, 62]] },
    { icon: '🚒', label: ['Fire truck', 'Camion de pompiers'], face: [240, 200], light: [472, 240], siren: true,
        body: 'M150 150H340V266H125V175Q125 150 150 150ZM350 150H420Q440 150 450 170L480 215V266H350Z',
        windows: '<path d="M362 165H415Q428 165 434 180L452 210H362Z"/>',
        extra: '<g stroke="#e4e9f0" stroke-linecap="round"><path d="M142 124H330M142 142H330" stroke-width="6"/><path d="M160 124V142M190 124V142M220 124V142M250 124V142M280 124V142M310 124V142" stroke-width="5"/></g><g class="cg-siren"><rect x="372" y="134" width="20" height="16" rx="5" fill="#ff5a5a"/><rect x="394" y="134" width="20" height="16" rx="5" fill="#5b9fe4"/></g>',
        wheels: [[205, 34], [420, 34]], rects: [[130, 155, 206, 107], [354, 155, 122, 107]] }
];

const stickerKinds = [
    { icon: '⭐', label: ['Star', 'Étoile'], art: '<path d="M0 -24L7 -8L24 -7L11 4L15 22L0 12L-15 22L-11 4L-24 -7L-7 -8Z" fill="#ffd34d" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>' },
    { icon: '❤️', label: ['Heart', 'Cœur'], art: '<path d="M0 20C-26 4 -22 -20 -8 -20C-3 -20 0 -16 0 -12C0 -16 3 -20 8 -20C22 -20 26 4 0 20Z" fill="#ff6f9c" stroke="#fff" stroke-width="3"/>' },
    { icon: '🌼', label: ['Flower', 'Fleur'], art: '<g fill="#fff" stroke="#f4ab45" stroke-width="2"><circle cx="0" cy="-13" r="10"/><circle cx="12" cy="-4" r="10"/><circle cx="8" cy="11" r="10"/><circle cx="-8" cy="11" r="10"/><circle cx="-12" cy="-4" r="10"/></g><circle r="8" fill="#f4ab45"/>' },
    { icon: '🔥', label: ['Flames', 'Flammes'], art: '<path d="M-22 18C-28 0 -12 -6 -10 -22C-2 -12 2 -14 4 -28C14 -14 28 -2 22 18Z" fill="#ff8a3d" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M-10 18C-12 6 -4 2 -2 -8C4 0 12 6 10 18Z" fill="#ffd34d"/>' },
    { icon: '🌈', label: ['Rainbow', 'Arc-en-ciel'], art: '<g fill="none" stroke-linecap="round" stroke-width="7"><path d="M-24 12A24 24 0 0 1 24 12" stroke="#fff" stroke-width="22"/><path d="M-21 12A21 21 0 0 1 21 12" stroke="#ee6374"/><path d="M-14 12A14 14 0 0 1 14 12" stroke="#f8d85b"/><path d="M-7 12A7 7 0 0 1 7 12" stroke="#5b9fe4"/></g>' }
];

const RAINBOW = ['#ee6374', '#f4ab45', '#f8d85b', '#58b98c', '#5b9fe4', '#ad79d1'];
const paintFill = c => c === 'rainbow' ? 'url(#cg-rainbow)' : c;
const mudPath = (x, y) => `M${x - 20} ${y} Q${x - 28} ${y - 24} ${x - 5} ${y - 18} Q${x + 22} ${y - 30} ${x + 26} ${y - 3} Q${x + 30} ${y + 21} ${x + 2} ${y + 18} Q${x - 24} ${y + 29} ${x - 20} ${y}Z`;

// ---------- State ----------
const state = {
    phase: 'garage',          // 'garage' | 'drive'
    tool: 'wash',             // 'vehicle' | 'wash' | 'paint' | 'sticker'
    washTool: 'sponge',       // 'sponge' | 'hose'
    vehicle: 0,
    base: '#ee6374',          // committed paint
    pending: '#5b9fe4',       // colour in the spray can
    layers: [],               // [{ fill, circles: [[x,y,r]], covered: Set }]
    sticker: 0,
    stickers: [],             // [{ x, y, kind, rot }]
    mud: [],                  // [{ x, y, dirt, el }]
    foam: [],                 // [{ x, y, r, el }]
    shinyCheered: false,
    world: 0,
    jar: 0,
    lastMessage: null
};

// Sample grid inside the body, used for paint coverage, mud spots and sticker snapping.
function bodyPoints(v = vehicles[state.vehicle]) {
    if (!v.points) {
        v.points = [];
        v.rects.forEach(([x, y, w, h]) => {
            for (let px = x + 9; px < x + w; px += 18) for (let py = y + 9; py < y + h; py += 18) v.points.push([px, py]);
        });
    }
    return v.points;
}
const inBody = (x, y, v = vehicles[state.vehicle]) => v.rects.some(([rx, ry, w, h]) => x >= rx && x <= rx + w && y >= ry && y <= ry + h);
function snapToBody(x, y) {
    if (inBody(x, y)) return [x, y];
    let best = bodyPoints()[0];
    let bestD = Infinity;
    bodyPoints().forEach(p => {
        const d = Math.hypot(p[0] - x, p[1] - y);
        if (d < bestD) { bestD = d; best = p; }
    });
    return best;
}
function makeMuddy(count = 7) {
    const pts = bodyPoints();
    const fresh = Array.from({ length: count }, (_, i) => {
        const p = pts[Math.floor((i + .5) * pts.length / count)];
        return { x: p[0] + (i % 2 ? 6 : -6), y: p[1] + (i % 3) * 4, dirt: 1 };
    });
    state.mud = fresh;
    state.shinyCheered = false;
}
function say(pair, speakIt = false) {
    state.lastMessage = pair;
    message(pair, speakIt);
}

// ---------- Car drawing ----------
function faceMarkup([x, y]) {
    return `<g id="car-face"><g fill="#f39b9c" opacity=".65"><ellipse cx="${x - 38}" cy="${y + 15}" rx="11" ry="7"/><ellipse cx="${x + 38}" cy="${y + 15}" rx="11" ry="7"/></g>
        <g class="cg-eyes"><circle cx="${x - 22}" cy="${y}" r="9" fill="#fff"/><circle cx="${x + 22}" cy="${y}" r="9" fill="#fff"/><g id="pupils" fill="#344359"><circle cx="${x - 22}" cy="${y}" r="5.5"/><circle cx="${x + 22}" cy="${y}" r="5.5"/><circle cx="${x - 20}" cy="${y - 2}" r="1.8" fill="#fff"/><circle cx="${x + 24}" cy="${y - 2}" r="1.8" fill="#fff"/></g></g>
        <path class="cg-smile" d="M${x - 13} ${y + 20} Q${x} ${y + 33} ${x + 13} ${y + 20}" fill="none" stroke="#344359" stroke-width="5" stroke-linecap="round"/>
        <path class="cg-grin" d="M${x - 15} ${y + 18} Q${x} ${y + 44} ${x + 15} ${y + 18}Z" fill="#344359"/></g>`;
}
function wheelsMarkup(v) {
    return v.wheels.map(([x, r]) => {
        const cy = FLOOR - r;
        const k = r * .45;
        return `<g><circle cx="${x}" cy="${cy}" r="${r}" fill="#354056" stroke="#222f45" stroke-width="${v.treads ? 9 : 4}"${v.treads ? ' stroke-dasharray="9 7"' : ''}/><circle cx="${x}" cy="${cy}" r="${r * .5}" fill="#dfe7ef"/><path class="cg-spokes" data-cx="${x}" data-cy="${cy}" d="M${x - k} ${cy}H${x + k}M${x} ${cy - k}V${cy + k}" stroke="#8d99ab" stroke-width="5" stroke-linecap="round"/></g>`;
    }).join('');
}
const stickerMarkup = s => `<g transform="translate(${s.x} ${s.y}) rotate(${s.rot})">${stickerKinds[s.kind].art}</g>`;
function carMarkup() {
    const v = vehicles[state.vehicle];
    const clips = state.layers.map((l, i) => `<clipPath id="cg-clip-${i}" clipPathUnits="userSpaceOnUse">${l.circles.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/>`).join('')}</clipPath>`).join('');
    return `<defs><linearGradient id="cg-rainbow" gradientUnits="userSpaceOnUse" x1="130" y1="0" x2="485" y2="0">${RAINBOW.map((c, i) => `<stop offset="${i / 5}" stop-color="${c}"/>`).join('')}</linearGradient>${clips}</defs>
        <ellipse class="cg-shadow" cx="305" cy="${FLOOR}" rx="185" ry="13" fill="#3a4357" opacity=".22"/>
        <g class="cg-bodywork">
        <path d="${v.body}" fill="${paintFill(state.base)}"/>
        <g id="paint-layers">${state.layers.map((l, i) => `<path d="${v.body}" fill="${paintFill(l.fill)}" clip-path="url(#cg-clip-${i})"/>`).join('')}</g>
        <path d="${v.body}" fill="none" stroke="#00000026" stroke-width="4" stroke-linejoin="round"/>
        ${v.extra || ''}<g fill="#e4f8ff" stroke="#ffffff" stroke-width="2">${v.windows}</g>
        <g id="stickers">${state.stickers.map(stickerMarkup).join('')}</g>
        <g id="mud">${state.mud.map(m => `<path d="${mudPath(m.x, m.y)}" fill="#9a7052" opacity="${m.dirt.toFixed(2)}"/>`).join('')}</g>
        <circle class="cg-headlight" cx="${v.light[0]}" cy="${v.light[1]}" r="10" fill="#fff2aa" stroke="#e9c75a" stroke-width="2"/>
        ${faceMarkup(v.face)}</g>
        ${wheelsMarkup(v)}
        <g id="foam">${state.foam.map(f => `<circle cx="${f.x}" cy="${f.y}" r="${f.r}" fill="#fff" fill-opacity=".85" stroke="#bfe6f5" stroke-width="2"/>`).join('')}</g>`;
}
// Re-attach live element references after (re)drawing the car.
function bindCar() {
    const mudEls = stage.querySelectorAll('#mud path');
    state.mud.forEach((m, i) => { m.el = mudEls[i]; });
    const foamEls = stage.querySelectorAll('#foam circle');
    state.foam.forEach((f, i) => { f.el = foamEls[i]; });
}
function redrawCar() {
    const car = stage.querySelector('#car');
    if (!car) return;
    car.innerHTML = carMarkup();
    bindCar();
}
function carHappy(ms = 1200) {
    const car = stage.querySelector('#car');
    if (!car) return;
    car.classList.add('cg-happy');
    clearTimeout(carHappy.timer);
    carHappy.timer = setTimeout(() => stage.querySelector('#car')?.classList.remove('cg-happy'), ms);
}
function honkSound() {
    const v = vehicles[state.vehicle];
    if (v.siren) tone([660, 880, 660, 880], 'triangle', 1);
    else if (v.treads) tone([140, 120, 140, 120], 'square', .9);
    else if (state.vehicle === 1) tone([220, 277], 'triangle', 1);
    else soundEffect('horn');
}

// ---------- Garage scene ----------
const rand = (a, b) => a + Math.random() * (b - a);
const now = () => performance.now();
const garageBackdrop = `<rect width="600" height="380" fill="#fbe3c4"/>
    <rect x="34" y="36" width="532" height="252" rx="16" fill="#fff4de"/>
    <path d="M34 88H566M34 140H566M34 192H566M34 244H566" stroke="#efdcbf" stroke-width="4"/>
    <rect width="600" height="20" fill="#cf7658"/>
    <rect x="215" y="8" width="170" height="40" rx="14" fill="#cf7658"/><g fill="#ffe08a"><path d="M250 18l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z"/><path d="M300 16l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z"/><path d="M350 18l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z"/></g>
    <rect x="48" y="106" width="104" height="8" rx="3" fill="#b9825e"/>
    ${['#ee6374', '#5b9fe4', '#f8d85b'].map((c, i) => `<rect x="${56 + i * 32}" y="78" width="24" height="28" rx="4" fill="${c}"/><rect x="${54 + i * 32}" y="73" width="28" height="7" rx="3" fill="#8d99ab"/>`).join('')}
    <g stroke="#8d99ab" stroke-width="7" stroke-linecap="round" fill="none"><path d="M482 74V116"/><circle cx="482" cy="64" r="9"/><path d="M522 72V116M510 72H534"/></g>
    <rect y="288" width="600" height="92" fill="#c9d0da"/><path d="M0 288H600" stroke="#aeb7c4" stroke-width="4"/>
    <path d="M100 288L60 380M220 288L204 380M380 288L396 380M500 288L540 380" stroke="#b9c1cc" stroke-width="3"/>
    <g transform="translate(40 300)"><path d="M0 0H44L38 46H6Z" fill="#5b9fe4"/><path d="M0 0Q22 -26 44 0" fill="none" stroke="#8d99ab" stroke-width="3"/><g fill="#fff"><circle cx="10" cy="-2" r="8"/><circle cx="24" cy="-6" r="10"/><circle cx="36" cy="-1" r="7"/></g></g>
    <g transform="translate(552 300)"><ellipse cy="20" rx="30" ry="12" fill="#354056"/><ellipse cy="4" rx="30" ry="12" fill="#3f4a60"/><ellipse cy="4" rx="13" ry="5" fill="#222f45"/></g>`;

function cursorMarkup() {
    if (state.tool === 'wash' && state.washTool === 'sponge') {
        return '<g class="cg-sponge"><rect x="-36" y="-24" width="72" height="48" rx="15" fill="#ffd95a" stroke="#e8b730" stroke-width="3"/><g fill="#e8b730"><circle cx="-16" cy="-6" r="4"/><circle cx="6" cy="5" r="5"/><circle cx="21" cy="-9" r="3"/><circle cx="-6" cy="13" r="3"/></g></g>';
    }
    if (state.tool === 'wash') {
        return '<circle r="22" fill="#7cc8f0" opacity=".3"/><g transform="translate(16 -16) rotate(-135)"><path d="M0 24C0 60 40 70 50 120" stroke="#58b98c" stroke-width="13" fill="none" stroke-linecap="round"/><rect x="-8" y="-4" width="16" height="30" rx="5" fill="#f4ab45"/></g><g stroke="#6cc3ee" stroke-width="5" stroke-linecap="round"><path d="M10 -10L-6 6M16 -4L2 12M4 -16L-12 0"/></g>';
    }
    if (state.tool === 'paint') {
        const c = state.pending === 'rainbow' ? RAINBOW[4] : state.pending;
        const label = state.pending === 'rainbow'
            ? RAINBOW.map((r, i) => `<rect x="-15" y="${16 + i * 4}" width="30" height="4" fill="${r}"/>`).join('')
            : `<rect x="-15" y="18" width="30" height="22" fill="${c}"/>`;
        return `<circle r="26" fill="${c}" opacity=".28"/><g transform="translate(18 -18) rotate(-135)"><rect x="-5" y="-10" width="10" height="12" rx="3" fill="#6f7b8f"/><rect x="-15" y="2" width="30" height="54" rx="9" fill="#e8edf3" stroke="#8d99ab" stroke-width="3"/>${label}</g>`;
    }
    if (state.tool === 'sticker') return `<g opacity=".75" transform="scale(1.15)">${stickerKinds[state.sticker].art}</g>`;
    return '';
}
function garageScene() {
    svg(`${garageBackdrop}<g id="car">${carMarkup()}</g><g id="fx"></g><g id="cursor" pointer-events="none" visibility="hidden">${cursorMarkup()}</g>`);
    bindCar();
}
function moveCursor(x, y) {
    const c = stage.querySelector('#cursor');
    if (!c || !c.firstChild) return;
    c.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    c.setAttribute('visibility', 'visible');
}
function hideCursor() { stage.querySelector('#cursor')?.setAttribute('visibility', 'hidden'); }
function lookAt(x, y) {
    const pupils = stage.querySelector('#pupils');
    if (!pupils) return;
    const [fx, fy] = vehicles[state.vehicle].face;
    const clamp = n => Math.max(-3.5, Math.min(3.5, n));
    pupils.setAttribute('transform', `translate(${clamp((x - fx) / 40).toFixed(1)} ${clamp((y - fy) / 40).toFixed(1)})`);
}

// Small decorative particles in the garage (CSS animated, capped).
function fxDot(x, y, fill, cls, r = 5) {
    const fx = stage.querySelector('#fx');
    if (!fx || fx.childElementCount > 24) return;
    const el = node('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r, fill, class: cls }, fx);
    setTimeout(() => el.remove(), 700);
}

// ---------- Garage actions ----------
let lastRub = null;
let lastNoise = 0;
function noisy(gap, fn) {
    if (now() - lastNoise < gap) return;
    lastNoise = now();
    fn();
}
function touchCar(honk = false) {
    const car = stage.querySelector('#car');
    if (!car) return;
    react(car, 'cg-bounce');
    carHappy();
    if (honk) { honkSound(); say(['Beep beep! Hello!', 'Pouet pouet ! Coucou !']); }
    else { soundEffect('giggle'); say(['Hee hee! That tickles!', 'Hi hi ! Ça chatouille !']); }
}
function addFoam(x, y) {
    const layer = stage.querySelector('#foam');
    if (!layer || state.foam.length >= 45 || state.foam.some(f => Math.hypot(f.x - x, f.y - y) < 14)) return;
    const f = { x: x + rand(-7, 7), y: y + rand(-7, 7), r: rand(9, 18) };
    f.el = node('circle', { cx: f.x.toFixed(1), cy: f.y.toFixed(1), r: f.r.toFixed(1), fill: '#fff', 'fill-opacity': .85, stroke: '#bfe6f5', 'stroke-width': 2, class: 'cg-foam-pop' }, layer);
    state.foam.push(f);
}
function scrub(x, y, moved) {
    const before = state.mud.length;
    let touched = false;
    state.mud.forEach(m => {
        if (Math.hypot(m.x - x, m.y - y) > 50) return;
        touched = true;
        m.dirt = Math.max(0, m.dirt - (.04 + Math.min(moved, 40) * .006));
        m.el?.setAttribute('opacity', m.dirt.toFixed(2));
        if (!m.dirt) { m.el?.remove(); soundEffect('pop'); }
    });
    state.mud = state.mud.filter(m => m.dirt > 0);
    if (inBody(x, y)) addFoam(x, y);
    if (touched) noisy(380, () => soundEffect('squeak'));
    washProgress(before > 0 && state.mud.length === 0);
}
function rinse(x, y) {
    for (let i = 0; i < 3; i++) fxDot(x + rand(-20, 20), y + rand(-10, 10), '#7cc8f0', 'cg-drop', rand(3, 6));
    let hit = false;
    state.foam = state.foam.filter(f => {
        if (Math.hypot(f.x - x, f.y - y) > 42) return true;
        f.el?.remove();
        hit = true;
        return false;
    });
    state.mud.forEach(m => {
        if (Math.hypot(m.x - x, m.y - y) > 50) return;
        hit = true;
        m.dirt = Math.max(0, m.dirt - .035);
        m.el?.setAttribute('opacity', m.dirt.toFixed(2));
        if (!m.dirt) m.el?.remove();
    });
    state.mud = state.mud.filter(m => m.dirt > 0);
    noisy(300, () => soundEffect(hit ? 'splash' : 'drip'));
    washProgress(false);
}
function washProgress(justCleared) {
    if (!state.mud.length && !state.foam.length && !state.shinyCheered) {
        state.shinyCheered = true;
        carHappy(2200);
        celebrate(305, 170);
        say(['Sparkly clean! Hooray!', 'Toute propre ! Youpi !'], true);
    } else if (justCleared && state.foam.length && state.washTool === 'sponge') {
        state.washTool = 'hose';
        soundEffect('whoosh');
        say(['So bubbly! Now rinse with the hose.', 'Que de bulles ! Rince avec le tuyau.'], true);
        updateUI();
        return;
    }
    updateText();
}
function currentLayer() {
    let layer = state.layers[state.layers.length - 1];
    if (!layer || layer.fill !== state.pending) {
        if (state.layers.length >= 3) state.base = state.layers.shift().fill;
        layer = { fill: state.pending, circles: [], covered: new Set() };
        state.layers.push(layer);
        redrawCar();
    }
    return layer;
}
function spray(x, y, r = 30) {
    const layer = currentLayer();
    const clip = stage.querySelector(`#cg-clip-${state.layers.length - 1}`);
    if (!clip) return;
    const pts = bodyPoints();
    [[x, y, r], [x + rand(-r, r) * .7, y + rand(-r, r) * .7, r * .45]].forEach(c => {
        layer.circles.push(c);
        node('circle', { cx: c[0].toFixed(1), cy: c[1].toFixed(1), r: c[2].toFixed(1) }, clip);
        pts.forEach((p, i) => { if (Math.hypot(p[0] - c[0], p[1] - c[1]) <= c[2] + 5) layer.covered.add(i); });
    });
    const c = state.pending === 'rainbow' ? RAINBOW[Math.floor(Math.random() * 6)] : state.pending;
    for (let i = 0; i < 2; i++) fxDot(x + rand(-26, 26), y + rand(-26, 26), c, 'cg-mist', rand(3, 6));
    noisy(260, () => tone([2400, 2100], 'sawtooth', .82));
    if (layer.covered.size / pts.length >= .8) finishPaint(layer);
}
function finishPaint(layer) {
    state.base = layer.fill;
    state.layers = [];
    redrawCar();
    carHappy(2000);
    celebrate(305, 160);
    const name = state.base === 'rainbow' ? ['Rainbow', 'Arc-en-ciel'] : (colors.find(c => c.value === state.base)?.name || ['New', 'Nouveau']);
    say([`Ta-da! ${name[0]} paint!`, `Tadam ! Peinture ${name[1].toLowerCase()} !`], true);
}
function placeSticker(x, y) {
    const [sx, sy] = snapToBody(x, y);
    const s = { x: sx, y: sy, kind: state.sticker, rot: Math.round(rand(-20, 20)) };
    state.stickers.push(s);
    const layer = stage.querySelector('#stickers');
    if (state.stickers.length > 14) { state.stickers.shift(); layer?.firstElementChild?.remove(); }
    if (layer) {
        const g = node('g', { transform: `translate(${s.x} ${s.y}) rotate(${s.rot})`, class: 'cg-stick' }, layer);
        g.innerHTML = `<g class="cg-stick-in">${stickerKinds[s.kind].art}</g>`;
    }
    soundEffect('pop');
    carHappy(700);
    say(state.stickers.length % 2 ? ['Stuck on!', 'Collé !'] : stickerKinds[s.kind].label);
}
function garageDown(x, y) {
    lastRub = null;
    const v = vehicles[state.vehicle];
    const nearFace = Math.hypot(x - v.face[0], y - v.face[1] - 10) < 42;
    if (state.tool === 'vehicle') { if (inBody(x, y) || nearFace) touchCar(true); else noisy(200, () => soundEffect('boing')); return; }
    if (state.tool === 'sticker') { placeSticker(x, y); return; }
    if (nearFace) touchCar(false);
    garageMove(x, y);
}
function garageMove(x, y) {
    const moved = lastRub ? Math.hypot(x - lastRub[0], y - lastRub[1]) : 12;
    if (state.tool === 'wash') {
        if (state.washTool === 'sponge') scrub(x, y, moved);
        else rinse(x, y);
        lastRub = [x, y];
    } else if (state.tool === 'paint' && (!lastRub || moved >= 9)) {
        spray(x, y);
        lastRub = [x, y];
    }
}
function garageKey() {
    if (state.tool === 'wash') {
        const m = state.mud[0];
        if (m) { state.washTool = 'sponge'; scrub(m.x, m.y, 40); scrub(m.x, m.y, 40); }
        else if (state.foam.length) rinse(state.foam[0].x, state.foam[0].y);
        else { touchCar(); celebrate(305, 170); }
    } else if (state.tool === 'paint') {
        const layer = currentLayer();
        const p = bodyPoints().find((_, i) => !layer.covered.has(i)) || bodyPoints()[0];
        spray(p[0] + 20, p[1] + 20, 52);
    } else if (state.tool === 'sticker') {
        const pts = bodyPoints();
        const p = pts[(state.stickers.length * 11 + 5) % pts.length];
        placeSticker(p[0], p[1]);
    } else touchCar(true);
}

// ---------- Drive phase: worlds ----------
const ROAD = 326;      // y where the wheels touch the road (screen space)
const CAR_X = 170;     // fixed screen x of the car centre
const CAR_S = .42;     // car scale while driving
const cloud = (x, y, s, fill = '#fff') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><ellipse rx="34" ry="18"/><ellipse cx="-26" cy="6" rx="22" ry="14"/><ellipse cx="26" cy="6" rx="24" ry="14"/><ellipse cx="4" cy="-12" rx="20" ry="16"/></g>`;
const tree = (x, s, leaf, trunk) => `<g transform="translate(${x} 290) scale(${s})"><rect x="-6" y="-42" width="12" height="42" fill="${trunk}"/><circle cy="-60" r="28" fill="${leaf}"/><circle cx="-17" cy="-44" r="18" fill="${leaf}"/><circle cx="17" cy="-44" r="18" fill="${leaf}"/></g>`;
const palm = x => `<g transform="translate(${x} 290)"><path d="M0 0Q10 -40 2 -82" stroke="#b98a5a" stroke-width="9" fill="none" stroke-linecap="round"/><g fill="#4fae6a"><ellipse cx="-20" cy="-84" rx="24" ry="8" transform="rotate(20 -20 -84)"/><ellipse cx="22" cy="-84" rx="24" ry="8" transform="rotate(-20 22 -84)"/><ellipse cx="-12" cy="-94" rx="20" ry="7" transform="rotate(-30 -12 -94)"/><ellipse cx="14" cy="-96" rx="20" ry="7" transform="rotate(35 14 -96)"/></g><circle cx="0" cy="-80" r="5" fill="#8a5a3a"/></g>`;
const umbrella = (x, c) => `<g transform="translate(${x} 290)"><path d="M0 0V-48" stroke="#8d99ab" stroke-width="4"/><path d="M-30 -46Q0 -78 30 -46Z" fill="${c}"/><path d="M-10 -46Q0 -76 10 -46Z" fill="#fff"/></g>`;
const flowers = (xs, c) => xs.map((x, i) => `<g transform="translate(${x} ${282 + (i % 2) * 4})"><path d="M0 0V8" stroke="#4f9a5a" stroke-width="3"/><circle r="5" fill="${c[i % c.length]}"/><circle r="2" fill="#fff6a8"/></g>`).join('');
const tile = content => `${content}<g transform="translate(600 0)">${content}</g>`;
const worlds = [
    { icon: '🌳', name: ['Sunny meadow', 'Prairie ensoleillée'], road: '#7d8798',
        sky: ['#9fdcf3', '#e9f8fb'],
        far: '<g class="cg-sun"><circle cx="430" cy="66" r="30" fill="#ffe27a"/><circle cx="430" cy="66" r="42" fill="#ffe27a" opacity=".3"/></g>',
        clouds: cloud(60, 70, 1) + cloud(280, 48, .8) + cloud(470, 96, 1.1),
        hills: '<path d="M0 250C100 160 200 160 300 250C400 190 500 190 600 250V300H0Z" fill="#a6d98c"/>',
        trees: tree(40, 1, '#58a86a', '#a87a58') + tree(205, .8, '#6dbb6f', '#a87a58') + tree(360, 1.15, '#58a86a', '#a87a58') + tree(520, .9, '#6dbb6f', '#a87a58') + flowers([110, 140, 280, 300, 430, 460, 580], ['#ee6374', '#ad79d1', '#f8d85b']) },
    { icon: '🏖️', name: ['Sunny beach', 'Plage ensoleillée'], road: '#8a8f9c',
        sky: ['#7fd3f2', '#d9f4fb'],
        far: '<circle cx="430" cy="62" r="30" fill="#ffd45e"/><rect y="200" width="600" height="80" fill="#4fb6dc"/><path d="M0 214q20 -8 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" stroke="#d9f4fb" stroke-width="4" fill="none" opacity=".7"/><g transform="translate(110 196)"><path d="M-22 0H22L14 12H-14Z" fill="#cf7658"/><path d="M0 0V-34L20 -4Z" fill="#fff"/></g>',
        clouds: cloud(80, 66, .9) + cloud(320, 44, .7) + cloud(520, 90, .9),
        hills: '<path d="M0 266C150 236 250 236 300 258C380 240 480 236 600 266V300H0Z" fill="#f3d58e"/>',
        trees: palm(60) + umbrella(200, '#ee6374') + palm(330) + `<g transform="translate(450 290)"><rect x="-20" y="-22" width="40" height="22" fill="#e9c477"/><rect x="-14" y="-36" width="12" height="14" fill="#e9c477"/><rect x="2" y="-36" width="12" height="14" fill="#e9c477"/><path d="M-6 -36V-50L4 -46L-6 -42" fill="#ee6374" stroke="#8d6a4a" stroke-width="2"/></g>` + umbrella(550, '#5b9fe4') },
    { icon: '🌙', name: ['Starry night', 'Nuit étoilée'], road: '#4d5470', night: true,
        sky: ['#1f2752', '#4b4f8f'],
        far: '<circle cx="440" cy="64" r="28" fill="#fff6c8"/><circle cx="454" cy="56" r="26" fill="#2a3262"/>' + Array.from({ length: 22 }, (_, i) => `<circle class="cg-twinkle" style="animation-delay:${(i % 7) * .4}s" cx="${(i * 97) % 600}" cy="${18 + (i * 53) % 150}" r="${1.5 + (i % 3)}" fill="#fff8d6"/>`).join(''),
        clouds: cloud(120, 80, .9, '#6c72b0') + cloud(380, 120, .7, '#6c72b0'),
        hills: '<path d="M0 250C100 170 200 170 300 250C400 200 500 200 600 250V300H0Z" fill="#3c4a7a"/>',
        trees: tree(60, 1, '#2f5d63', '#5a4a4a') + tree(260, .85, '#2a525a', '#5a4a4a') + tree(470, 1.1, '#2f5d63', '#5a4a4a') + Array.from({ length: 8 }, (_, i) => `<circle class="cg-firefly" style="animation-delay:${i * .35}s" cx="${30 + i * 75}" cy="${225 + (i % 3) * 20}" r="3.5" fill="#fff38a"/>`).join('') }
];
function worldMarkup(w) {
    return `<defs><linearGradient id="cg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.sky[0]}"/><stop offset="1" stop-color="${w.sky[1]}"/></linearGradient></defs>
        <rect width="600" height="300" fill="url(#cg-sky)"/>${w.far}
        <g id="cg-clouds">${tile(w.clouds)}</g><g id="cg-hills">${tile(w.hills)}</g><g id="cg-trees">${tile(w.trees)}</g>
        <rect y="290" width="600" height="90" fill="${w.road}"/><rect y="288" width="600" height="6" fill="#ffffff55"/>
        <path id="cg-lines" d="M-70 356H670" stroke="#fff7df" stroke-width="6" stroke-dasharray="40 30"/>`;
}

// ---------- Drive phase: things along the road ----------
const STAR = '<path d="M0 -20L6 -7L20 -6L9 4L12 18L0 10L-12 18L-9 4L-20 -6L-6 -7Z" fill="#ffd34d" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>';
const balloon = c => `<path d="M0 24Q-8 40 4 62" stroke="#fff" stroke-width="2" fill="none"/><ellipse rx="20" ry="24" fill="${c}"/><ellipse cx="-7" cy="-9" rx="5" ry="8" fill="#fff" opacity=".5"/><path d="M-4 23H4L0 29Z" fill="${c}"/>`;
const animals = [
    { name: ['duck', 'canard'], art: '<path class="cg-wave" d="M6 -24Q26 -40 20 -12Z" fill="#f5c53a"/><ellipse cy="-18" rx="22" ry="16" fill="#ffd84d"/><circle cx="-14" cy="-38" r="12" fill="#ffd84d"/><path d="M-24 -40L-37 -36L-24 -32Z" fill="#f4973d"/><circle cx="-17" cy="-41" r="2.5" fill="#344359"/><path d="M-6 -2V6M6 -2V6" stroke="#f4973d" stroke-width="4"/>' },
    { name: ['bunny', 'lapin'], art: '<ellipse cy="-18" rx="18" ry="17" fill="#f3eee8"/><circle cx="-12" cy="-40" r="13" fill="#f3eee8"/><g class="cg-wave"><ellipse cx="-18" cy="-64" rx="5" ry="15" fill="#f3eee8"/><ellipse cx="-18" cy="-64" rx="2.5" ry="10" fill="#f6b5c4"/></g><ellipse cx="-5" cy="-64" rx="5" ry="15" fill="#f3eee8"/><circle cx="-17" cy="-42" r="2.5" fill="#344359"/><circle cx="-24" cy="-38" r="2.5" fill="#f39b9c"/><circle cx="17" cy="-16" r="6" fill="#fff"/>' },
    { name: ['sheep', 'mouton'], art: '<g fill="#fff"><circle cx="-10" cy="-22" r="14"/><circle cx="8" cy="-24" r="15"/><circle cx="20" cy="-16" r="11"/><circle cx="0" cy="-12" r="13"/></g><ellipse cx="-24" cy="-30" rx="10" ry="12" fill="#5a5560"/><circle cx="-27" cy="-32" r="2.2" fill="#fff"/><path class="cg-wave" d="M-18 -40Q-6 -48 -10 -34Z" fill="#5a5560"/><path d="M-8 -4V6M12 -4V6" stroke="#5a5560" stroke-width="4"/>' }
];
const signArt = [
    '<circle cx="0" cy="-6" r="10" fill="#58a86a"/><rect x="-2" y="2" width="4" height="8" fill="#a87a58"/>',
    '<circle cx="0" cy="-4" r="9" fill="#ffd45e"/><path d="M-14 8q7 -6 14 0t14 0" stroke="#4fb6dc" stroke-width="4" fill="none"/>',
    '<circle cx="0" cy="0" r="10" fill="#fff6c8"/><circle cx="5" cy="-4" r="9" fill="#cf7658"/>'
];
function eventMarkup(ev) {
    switch (ev.type) {
        case 'puddle': return '<ellipse cy="334" rx="46" ry="11" fill="#5cb8e6" opacity=".9"/><ellipse cx="-12" cy="331" rx="16" ry="3" fill="#fff" opacity=".6"/>';
        case 'star': return `<g class="cg-floaty">${STAR}</g>`;
        case 'balloon': return `<g class="cg-floaty">${balloon(ev.color)}</g>`;
        case 'animal': return `<g class="cg-animal-in">${animals[ev.kind].art}</g>`;
        case 'light': return '<rect x="-4" y="236" width="8" height="58" fill="#4b5568"/><rect x="-17" y="168" width="34" height="76" rx="11" fill="#344359"/><circle class="cg-l-red" cy="185" r="9" fill="#ff5a5a"/><circle class="cg-l-yellow" cy="206" r="9" fill="#6b5a3a"/><circle class="cg-l-green" cy="227" r="9" fill="#2f4a3a"/><path d="M-110 300V352" stroke="#fff" stroke-width="6" opacity=".7"/>';
        case 'bumps': return '<path d="M-64 330q8 -12 16 0q8 -12 16 0q8 -12 16 0q8 -12 16 0q8 -12 16 0q8 -12 16 0q8 -12 16 0q8 -12 16 0Z" fill="#b39a7a"/>';
        case 'carwash': return '<rect x="-74" y="188" width="14" height="146" rx="5" fill="#5b9fe4"/><rect x="60" y="188" width="14" height="146" rx="5" fill="#5b9fe4"/><rect x="-86" y="172" width="172" height="32" rx="14" fill="#7cc8f0"/><g fill="#fff"><circle cx="-40" cy="188" r="9"/><circle cx="-16" cy="184" r="12"/><circle cx="10" cy="188" r="9"/><circle cx="34" cy="185" r="11"/><circle cx="56" cy="190" r="7"/></g>';
        case 'sign': return `<rect x="-4" y="230" width="8" height="64" fill="#a87a58"/><rect x="-28" y="196" width="56" height="42" rx="10" fill="#fff4de" stroke="#cf7658" stroke-width="4"/><g transform="translate(0 217)">${signArt[ev.next]}</g>`;
        default: return '';
    }
}
function frontMarkup(ev) {
    if (ev.type === 'tunnel') {
        return '<path d="M-160 334V236Q-130 120 0 112Q130 120 160 236V334Z" fill="#9a8270"/><path d="M-160 236Q-130 120 0 112Q130 120 160 236" fill="none" stroke="#7cbf6a" stroke-width="14" stroke-linecap="round"/><g fill="#86705f"><circle cx="-60" cy="190" r="12"/><circle cx="40" cy="160" r="9"/><circle cx="80" cy="220" r="14"/><circle cx="-20" cy="250" r="10"/></g><path d="M-160 334V262Q-160 236 -134 236Q-108 236 -108 262V334Z" fill="#3b3440"/><path d="M108 334V262Q108 236 134 236Q160 236 160 262V334Z" fill="#3b3440"/>';
    }
    if (ev.type === 'carwash') {
        return '<g opacity=".8"><rect class="cg-brush" x="-60" y="232" width="18" height="100" rx="9" fill="#ff8ab3"/><rect class="cg-brush" x="42" y="232" width="18" height="100" rx="9" fill="#ff8ab3"/></g><path class="cg-rain" d="M-40 206V226M-14 206V232M12 206V224M38 206V230" stroke="#bfe6f5" stroke-width="4" stroke-linecap="round"/>';
    }
    return '';
}
const course = ['star-low', 'puddle', 'balloon-high', 'animal', 'stars', 'bumps', 'light', 'balloon-low', 'tunnel', 'star-high', 'puddle', 'carwash', 'balloon-high', 'animal', 'sign'];
const BALLOON_COLORS = ['#ee6374', '#5b9fe4', '#ad79d1', '#f4ab45', '#58b98c'];

function driveScene() {
    svg(`<g id="cg-world">${worldMarkup(worlds[state.world])}</g><g id="cg-back"></g>
        <path id="cg-beam" d="M0 0L170 -26V30Z" fill="#fff6b0" opacity="0"/>
        <g id="cg-carwrap"><g id="car">${carMarkup()}</g></g>
        <g id="cg-front"></g><g id="cg-fx"></g>
        <g id="cg-jar" transform="translate(552 14)"><rect x="-27" y="4" width="54" height="66" rx="15" fill="#ffffff70" stroke="#fff" stroke-width="4"/><rect x="-22" y="-2" width="44" height="11" rx="5" fill="#cf7658"/><g id="cg-jar-items"></g></g>
        <rect id="cg-flash" width="600" height="380" fill="#fff" opacity="0" pointer-events="none"/>`);
    bindCar();
    drawJar();
}
function drawJar() {
    const g = stage.querySelector('#cg-jar-items');
    if (!g) return;
    g.innerHTML = Array.from({ length: state.jar }, (_, i) => `<g transform="translate(${-13 + (i % 3) * 13} ${58 - Math.floor(i / 3) * 13}) scale(.4)">${STAR}</g>`).join('');
}

// ---------- Drive phase: engine ----------
const GRAVITY = 1300;
const drive = { raf: 0, last: 0, dist: 0, speed: 0, jumpY: 0, vy: 0, jumps: 0, bumpY: 0, events: [], particles: [], nextX: 0, courseIndex: 0, waiting: null, waitButton: null, spokes: [], puffT: 0, flash: 0, time: 0 };
const cruise = () => reducedMotion() ? 60 : 115;
const $ = sel => stage.querySelector(sel);

function startDrive() {
    Object.assign(drive, { dist: 0, speed: 0, jumpY: 0, vy: 0, jumps: 0, bumpY: 0, events: [], particles: [], nextX: 560, courseIndex: 0, waiting: null, waitButton: null, flash: 0 });
    driveScene();
    cacheSpokes();
    startLoop();
}
function cacheSpokes() {
    drive.spokes = Array.from(stage.querySelectorAll('.cg-spokes')).map((el, i) => ({ el, cx: el.dataset.cx, cy: el.dataset.cy, r: vehicles[state.vehicle].wheels[i][1] }));
}
function startLoop() {
    cancelAnimationFrame(drive.raf);
    drive.last = 0;
    drive.raf = requestAnimationFrame(tick);
}
function stopLoop() {
    cancelAnimationFrame(drive.raf);
    drive.raf = 0;
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else if (state.phase === 'drive') startLoop();
});
function tick(t) {
    drive.raf = requestAnimationFrame(tick);
    const dt = drive.last ? Math.min(.05, (t - drive.last) / 1000) : 0;
    drive.last = t;
    drive.time += dt;
    update(dt);
    render();
}
function spawn(type, x, extra = {}) {
    const ev = { type, x, done: false, y: 0, ...extra };
    const back = eventMarkup(ev);
    if (back) { ev.el = node('g', {}, $('#cg-back')); ev.el.innerHTML = back; }
    const front = frontMarkup(ev);
    if (front) { ev.front = node('g', {}, $('#cg-front')); ev.front.innerHTML = front; }
    drive.events.push(ev);
    return ev;
}
function spawnNext() {
    const i = drive.courseIndex++;
    const kind = course[i % course.length];
    const x = drive.nextX;
    let gap = 330;
    if (kind === 'star-low') spawn('star', x, { y: 258 });
    else if (kind === 'star-high') spawn('star', x, { y: 180 });
    else if (kind === 'stars') { [250, 196, 250].forEach((y, k) => spawn('star', x + k * 58, { y })); gap = 420; }
    else if (kind === 'balloon-high') spawn('balloon', x, { y: 176, color: BALLOON_COLORS[i % 5] });
    else if (kind === 'balloon-low') spawn('balloon', x, { y: 252, color: BALLOON_COLORS[i % 5] });
    else if (kind === 'animal') { spawn('animal', x, { y: 300, kind: Math.floor(i / 3) % animals.length, phase: 'idle', hop: 0 }); gap = 400; }
    else if (kind === 'light') { spawn('light', x, { phase: 'red', blocking: true }); gap = 380; }
    else if (kind === 'tunnel') { spawn('tunnel', x + 120); gap = 520; }
    else if (kind === 'carwash') { spawn('carwash', x + 40); gap = 420; }
    else if (kind === 'sign') spawn('sign', x, { next: (state.world + 1) % worlds.length });
    else spawn(kind, x);
    drive.nextX += gap;
}
function particle(x, y, vx, vy, fill, r, g = 700, life = .8) {
    const fx = $('#cg-fx');
    if (!fx || drive.particles.length >= 40) return;
    if (reducedMotion() && Math.random() < .5) return;
    const el = node('circle', { r, fill }, fx);
    drive.particles.push({ el, x, y, vx, vy, g, life, max: life });
}
function splatMud() {
    const pts = bodyPoints();
    const p = pts[Math.floor(Math.random() * pts.length)];
    const m = { x: p[0], y: p[1], dirt: 1 };
    const layer = $('#mud');
    if (state.mud.length >= 9 || !layer) return;
    m.el = node('path', { d: mudPath(m.x, m.y), fill: '#9a7052', opacity: 1 }, layer);
    state.mud.push(m);
    state.shinyCheered = false;
}
function jump() {
    if (drive.jumps >= 2) return;
    drive.vy = drive.jumps ? 430 : 560;
    drive.jumps++;
    soundEffect('boing');
}
function honk() {
    honkSound();
    const car = $('#car');
    if (car) react(car, 'cg-bounce');
    let greeted = null;
    drive.events.forEach(ev => {
        if (ev.type !== 'animal' || ev.phase === 'leave') return;
        ev.hop = 1;
        if (ev.phase !== 'idle') { ev.phase = 'leave'; ev.blocking = false; greeted = ev; }
    });
    if (greeted) {
        const n = animals[greeted.kind].name;
        soundEffect('giggle');
        say([`Bye-bye, little ${n[0]}!`, `Au revoir, petit ${n[1]} !`], true);
        clearWait();
    } else say(['Beep beep!', 'Pouet pouet !']);
}
function setLight(ev) {
    const on = { red: '#ff5a5a', yellow: '#ffd45e', green: '#5fe08a' };
    const off = { red: '#5a2f35', yellow: '#6b5a3a', green: '#2f4a3a' };
    ['red', 'yellow', 'green'].forEach(c => ev.el?.querySelector(`.cg-l-${c}`)?.setAttribute('fill', ev.phase === c ? on[c] : off[c]));
}
function greenLight(ev) {
    if (ev.phase !== 'red') return;
    ev.phase = 'yellow';
    ev.t = .5;
    setLight(ev);
    chime();
    clearWait();
}
function resolve(ev) {
    if (ev.type === 'light') greenLight(ev);
    else honk();
}
function driveTap(x, y) {
    const hit = drive.events.find(ev => ev.blocking && Math.hypot(ev.x - drive.dist - x, (ev.type === 'light' ? 205 : ev.y - 30) - y) < 70);
    if (hit) resolve(hit);
    else if (drive.waiting) resolve(drive.waiting);
    else jump();
}
function showWaitButton(ev) {
    drive.waitButton?.remove();
    const sx = ev.x - drive.dist;
    drive.waitButton = ev.type === 'light'
        ? sceneButton('🚦', ['Make the light green', 'Passer au vert'], sx, 126, () => greenLight(ev))
        : sceneButton('📯', ['Honk hello', 'Klaxonner bonjour'], sx, 222, honk);
    drive.waitButton.classList.add('cg-wait-button');
}
function clearWait() {
    drive.waitButton?.remove();
    drive.waitButton = null;
}
function announce(ev) {
    ev.announced = true;
    ev.waitedAt = drive.time;
    if (ev.type === 'light') say(['Red light! Tap the light to make it green.', 'Feu rouge ! Touche le feu pour le passer au vert.'], true);
    else {
        const n = animals[ev.kind].name;
        say([`A little ${n[0]} is crossing! Honk hello!`, `Un petit ${n[1]} traverse ! Klaxonne bonjour !`], true);
    }
    showWaitButton(ev);
}
function switchWorld(index) {
    state.world = index;
    const world = $('#cg-world');
    if (world) world.innerHTML = worldMarkup(worlds[index]);
    drive.flash = reducedMotion() ? 0 : .8;
    soundEffect('sparkle');
    say(worlds[index].name, true);
    updateUI();
}
function addToJar() {
    state.jar++;
    if (state.jar >= 12) {
        drawJar();
        celebrate(420, 110);
        say(['Your jar is full of treasures! Hooray!', 'Ton pot est plein de trésors ! Youpi !'], true);
        state.jar = 0;
        setTimeout(drawJar, 1300);
    } else drawJar();
}

function update(dt) {
    const carWX = drive.dist + CAR_X;
    while (drive.nextX < drive.dist + 780) spawnNext();

    // Gentle speed control: slow down and wait for anything blocking the road.
    let target = cruise();
    let waiting = null;
    drive.events.forEach(ev => {
        if (ev.type === 'animal' && ev.phase === 'idle' && ev.x - carWX < 430) { ev.phase = 'walk'; ev.blocking = true; }
        if (!ev.blocking) return;
        const gap = ev.x - carWX - 118;
        if (gap < -60) return;
        target = Math.min(target, Math.max(0, gap * 1.3));
        if (gap < 30) waiting = ev;
    });
    drive.speed += (target - drive.speed) * Math.min(1, dt * 3.5);
    if (target < 1 && drive.speed < 4) drive.speed = 0;
    drive.dist += drive.speed * dt;
    drive.waiting = waiting;
    if (waiting && !waiting.announced && drive.speed < 25) announce(waiting);
    if (waiting?.announced && !waiting.hinted && drive.time - waiting.waitedAt > 9) {
        waiting.hinted = true;
        if (state.lastMessage) say(state.lastMessage, true);
    }

    // Jumping (up to a double jump, always lands softly).
    if (drive.jumps) {
        drive.vy -= GRAVITY * dt;
        drive.jumpY += drive.vy * dt;
        if (drive.jumpY <= 0) {
            drive.jumpY = 0;
            drive.vy = 0;
            drive.jumps = 0;
            for (let k = 0; k < 4; k++) particle(CAR_X - 50 + k * 30, ROAD - 4, rand(-50, 50), -50, '#ffffffaa', 4, 150, .4);
        }
    }
    const cy = ROAD - 42 - drive.jumpY;
    drive.bumpY = 0;
    drive.events.forEach(ev => {
        const dx = ev.x - carWX;
        if (ev.type === 'puddle' && !ev.done && Math.abs(dx) < 36) {
            ev.done = true;
            if (drive.jumpY < 8) {
                for (let k = 0; k < 14; k++) particle(CAR_X + rand(-30, 40), 330, rand(-120, 160), rand(-330, -160), k % 3 ? '#5cb8e6' : '#9a7052', rand(3, 6));
                soundEffect('splash');
                splatMud();
                splatMud();
                const car = $('#car');
                if (car) react(car, 'cg-bounce');
                say(['Splosh! A muddy puddle!', 'Plouf ! Une flaque de boue !']);
            } else {
                soundEffect('whoosh');
                say(['Whee! Over the puddle!', 'Youpi ! Par-dessus la flaque !']);
            }
        } else if (ev.type === 'star' || ev.type === 'balloon') {
            if (ev.fly != null) {
                ev.fly += dt / .6;
                if (ev.fly >= 1) { ev.gone = true; addToJar(); }
            } else if (Math.abs(dx) < 62 && Math.abs(ev.y - cy) < 60) {
                ev.fly = 0;
                ev.fx = dx + CAR_X;
                ev.fy = ev.y;
                soundEffect(ev.type === 'star' ? 'sparkle' : 'pop');
                for (let k = 0; k < 6; k++) particle(ev.fx, ev.y, rand(-150, 150), rand(-150, 60), ev.type === 'star' ? '#ffd34d' : ev.color, 4, 300, .6);
                say(ev.type === 'star' ? ['A star for your jar!', 'Une étoile pour ton pot !'] : ['Pop! A balloon for your jar!', 'Pop ! Un ballon pour ton pot !']);
            }
        } else if (ev.type === 'animal') {
            if (ev.hop > 0) ev.hop = Math.max(0, ev.hop - dt * 2.2);
            if (ev.phase === 'walk') {
                ev.y += 36 * dt;
                if (ev.y >= 330) { ev.y = 330; ev.phase = 'wait'; ev.el?.classList.add('cg-waving'); }
            } else if (ev.phase === 'leave') {
                ev.el?.classList.remove('cg-waving');
                ev.y += 80 * dt;
                if (!ev.hop) ev.hop = 1;
                if (ev.y > 440) ev.gone = true;
            }
        } else if (ev.type === 'light' && ev.phase === 'yellow') {
            ev.t -= dt;
            if (ev.t <= 0) {
                ev.phase = 'green';
                ev.blocking = false;
                setLight(ev);
                chime(true);
                say(['Green means go! Vroom!', 'Vert, on y va ! Vroum !'], true);
            }
        } else if (ev.type === 'bumps' && Math.abs(dx) < 64) {
            drive.bumpY = Math.abs(Math.sin((64 - dx) / 16 * Math.PI)) * 6;
            if (!ev.done) { ev.done = true; soundEffect('boing'); say(['Bumpy road! Boing boing!', 'Ça secoue ! Boing boing !']); }
        } else if (ev.type === 'tunnel') {
            if (!ev.entered && dx < 150) {
                ev.entered = true;
                tone([392, 330, 262], 'sine', 1);
                say(['Into the tunnel... where did we go?', 'Dans le tunnel... où est la voiture ?']);
            } else if (ev.entered && !ev.done && dx < -110) {
                ev.done = true;
                soundEffect('giggle');
                carHappy();
                say(['Peekaboo! Here we are!', 'Coucou ! Me revoilà !'], true);
            }
        } else if (ev.type === 'carwash') {
            if (Math.abs(dx) < 80) {
                if (!ev.entered) { ev.entered = true; soundEffect('splash'); say(['Car wash! Scrub-a-dub!', 'Lave-auto ! Frotte, frotte !']); }
                if (Math.random() < dt * 22) particle(CAR_X + rand(-70, 70), ROAD - rand(10, 80), rand(-30, 30), rand(-80, -30), '#ffffffdd', rand(4, 9), -40, 1);
                state.mud.forEach(m => { m.dirt = Math.max(0, m.dirt - dt * .9); m.el?.setAttribute('opacity', m.dirt.toFixed(2)); });
            } else if (ev.entered && !ev.done && dx < -80) {
                ev.done = true;
                state.mud.forEach(m => m.el?.remove());
                state.foam.forEach(f => f.el?.remove());
                state.mud = [];
                state.foam = [];
                state.shinyCheered = true;
                soundEffect('sparkle');
                carHappy(1600);
                say(['Squeaky clean! Shiny car!', 'Toute propre et brillante !']);
            }
        } else if (ev.type === 'sign' && !ev.done && dx < 0) {
            ev.done = true;
            switchWorld(ev.next);
        }
        if (ev.x - drive.dist < -240) ev.gone = true;
    });
    drive.events = drive.events.filter(ev => {
        if (!ev.gone) return true;
        ev.el?.remove();
        ev.front?.remove();
        return false;
    });

    // Exhaust puffs, particles, and the world-change flash.
    drive.puffT -= dt;
    if (drive.speed > 20 && drive.puffT <= 0 && !reducedMotion()) {
        drive.puffT = .4;
        particle(CAR_X - 82, ROAD - 16 - drive.jumpY, -50, -25, worlds[state.world].night ? '#8a90c6' : '#e3e7ee', 6, -20, .8);
    }
    drive.particles = drive.particles.filter(p => {
        p.life -= dt;
        if (p.life <= 0) { p.el.remove(); return false; }
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        p.el.setAttribute('opacity', (p.life / p.max).toFixed(2));
        return true;
    });
    if (drive.flash > 0) {
        drive.flash = Math.max(0, drive.flash - dt * 2);
        $('#cg-flash')?.setAttribute('opacity', drive.flash.toFixed(2));
    }
}
function cacheLayers() {
    const wrap = $('#cg-carwrap');
    let shadow = $('#cg-shadow');
    if (!shadow && wrap) {
        shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        Object.entries({ id: 'cg-shadow', cx: CAR_X, cy: ROAD, rx: 76, ry: 6, fill: '#1e2433', opacity: .25 }).forEach(([k, v]) => shadow.setAttribute(k, v));
        wrap.before(shadow);
    }
    drive.els = { clouds: $('#cg-clouds'), hills: $('#cg-hills'), trees: $('#cg-trees'), lines: $('#cg-lines'), wrap, shadow, beam: $('#cg-beam') };
}
function render() {
    if (!drive.els?.clouds?.isConnected || !drive.els.wrap?.isConnected) cacheLayers();
    const e = drive.els;
    const d = drive.dist;
    const rm = reducedMotion();
    const shift = (el, f, period = 600) => el?.setAttribute('transform', `translate(${(-(d * f) % period).toFixed(1)} 0)`);
    shift(e.clouds, rm ? 0 : .1);
    shift(e.hills, rm ? 0 : .3);
    shift(e.trees, rm ? .5 : .65);
    shift(e.lines, 1, 70);
    drive.events.forEach(ev => {
        const sx = (ev.x - d).toFixed(1);
        let tf = `translate(${sx} 0)`;
        if (ev.fly != null) {
            const k = Math.min(1, ev.fly);
            const ease = k * (2 - k);
            tf = `translate(${(ev.fx + (552 - ev.fx) * ease).toFixed(1)} ${(ev.fy + (44 - ev.fy) * ease).toFixed(1)}) scale(${(1 - .6 * ease).toFixed(2)})`;
        } else if (ev.type === 'star' || ev.type === 'balloon') tf = `translate(${sx} ${ev.y})`;
        else if (ev.type === 'animal') tf = `translate(${sx} ${(ev.y - Math.sin(ev.hop * Math.PI) * 22).toFixed(1)})`;
        ev.el?.setAttribute('transform', tf);
        ev.front?.setAttribute('transform', tf);
    });
    const tilt = rm ? 0 : Math.max(-10, Math.min(10, -drive.vy * .014));
    const bob = rm || drive.jumps ? 0 : Math.sin(drive.time * 14) * .8 * (drive.speed / 115);
    const ty = ROAD - FLOOR * CAR_S - drive.jumpY - drive.bumpY + bob;
    e.wrap?.setAttribute('transform', `translate(${(CAR_X - 305 * CAR_S).toFixed(1)} ${ty.toFixed(1)}) scale(${CAR_S}) rotate(${tilt.toFixed(1)} 305 230)`);
    const lift = Math.min(1, drive.jumpY / 160);
    e.shadow?.setAttribute('rx', (76 * (1 - lift * .5)).toFixed(1));
    e.shadow?.setAttribute('opacity', (.25 * (1 - lift * .6)).toFixed(2));
    drive.spokes.forEach(s => s.el.setAttribute('transform', `rotate(${((d / (s.r * CAR_S)) * 57.3 % 360).toFixed(1)} ${s.cx} ${s.cy})`));
    if (e.beam) {
        const v = vehicles[state.vehicle];
        const night = worlds[state.world].night;
        e.beam.setAttribute('opacity', night ? '.32' : '0');
        if (night) e.beam.setAttribute('transform', `translate(${(CAR_X + (v.light[0] - 305) * CAR_S).toFixed(1)} ${(ty + v.light[1] * CAR_S).toFixed(1)})`);
    }
}

// ---------- Words, toolbar and palette ----------
let paletteLabel = ['Garage choices', 'Choix du garage'];
function updateText() {
    setTitle(['Little Car Garage', 'Le petit garage']);
    let words;
    let label;
    if (state.phase === 'drive') {
        words = ['Tap to jump! Catch stars and balloons.', 'Touche pour sauter ! Attrape étoiles et ballons.'];
        label = ['Driving adventure. Tap or press Space to jump, honk hello, or turn the light green.', 'Balade en voiture. Touche ou appuie sur Espace pour sauter, klaxonner ou passer au vert.'];
    } else if (state.tool === 'wash') {
        words = state.mud.length
            ? (state.washTool === 'sponge' ? ['Rub the mud away with the sponge!', 'Frotte la boue avec l’éponge !'] : ['Spray the mud with the hose!', 'Arrose la boue avec le tuyau !'])
            : state.foam.length ? ['Rinse the bubbles with the hose!', 'Rince les bulles avec le tuyau !']
                : ['All clean! Paint it, or go for a drive!', 'Toute propre ! Peins-la ou pars en balade !'];
        label = ['Toy car. Rub to wash it. Press Space to scrub.', 'Voiture jouet. Frotte pour la laver. Appuie sur Espace pour frotter.'];
    } else if (state.tool === 'paint') {
        words = ['Pick a color, then rub to spray paint!', 'Choisis une couleur, puis frotte pour peindre !'];
        label = ['Toy car. Rub to spray paint. Press Space to spray.', 'Voiture jouet. Frotte pour peindre. Appuie sur Espace pour peindre.'];
    } else if (state.tool === 'sticker') {
        words = ['Tap the car to add stickers!', 'Touche la voiture pour coller des autocollants !'];
        label = ['Toy car. Tap to add a sticker. Press Space to stick one.', 'Voiture jouet. Touche pour coller un autocollant. Appuie sur Espace pour en coller un.'];
    } else {
        words = ['Pick a vehicle, then tap it to say hello!', 'Choisis un véhicule, puis touche-le pour dire bonjour !'];
        label = ['Toy vehicle. Tap or press Space to say hello.', 'Véhicule jouet. Touche ou appuie sur Espace pour dire bonjour.'];
    }
    instruction(words);
    stage.setAttribute('aria-label', text(label));
}
function refreshCursor() {
    const c = $('#cursor');
    if (!c) return;
    c.innerHTML = cursorMarkup();
    c.setAttribute('visibility', 'hidden');
}
function setTool(id) {
    state.tool = id;
    refreshCursor();
    soundEffect('pop');
    updateUI();
}
function setVehicle(i) {
    const wasMuddy = state.mud.length;
    state.vehicle = i;
    state.layers = [];
    state.foam = [];
    state.stickers = state.stickers.filter(s => inBody(s.x, s.y));
    if (wasMuddy) makeMuddy(Math.min(7, wasMuddy + 1)); else state.mud = [];
    garageScene();
    const car = $('#car');
    if (car) react(car, 'cg-bounce');
    honkSound();
    say(vehicles[i].label, true);
    updateUI();
}
function pressOnly(el) {
    palette.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === el)));
}
function garagePalette() {
    if (state.tool === 'vehicle') {
        paletteLabel = ['Choose a vehicle', 'Choisir un véhicule'];
        vehicles.forEach((v, i) => button(v.icon, v.label, () => setVehicle(i), palette).setAttribute('aria-pressed', String(state.vehicle === i)));
    } else if (state.tool === 'wash') {
        paletteLabel = ['Washing tools', 'Outils de lavage'];
        [['sponge', '🧽', ['Sponge', 'Éponge']], ['hose', '🚿', ['Hose', 'Tuyau']]].forEach(([id, icon, label]) => {
            button(icon, label, () => { state.washTool = id; refreshCursor(); soundEffect(id === 'hose' ? 'splash' : 'squeak'); updateUI(); }, palette).setAttribute('aria-pressed', String(state.washTool === id));
        });
        button('🟤', ['Muddy again!', 'Encore de la boue !'], () => {
            makeMuddy();
            state.foam = [];
            state.washTool = 'sponge';
            garageScene();
            soundEffect('splash');
            const car = $('#car');
            if (car) react(car, 'cg-bounce');
            say(['Splat! Mud everywhere! Hee hee!', 'Splatch ! De la boue partout ! Hi hi !'], true);
            updateUI();
        }, palette);
    } else if (state.tool === 'paint') {
        paletteLabel = ['Paint colors', 'Couleurs de peinture'];
        swatches(state.pending, c => { state.pending = c.value; refreshCursor(); say(c.name, true); });
        const rainbow = document.createElement('button');
        rainbow.type = 'button';
        rainbow.className = 'swatch cg-rainbow-swatch';
        rainbow.setAttribute('aria-label', text(['Rainbow', 'Arc-en-ciel']));
        rainbow.setAttribute('aria-pressed', String(state.pending === 'rainbow'));
        rainbow.addEventListener('click', () => { unlockAudio(); pressOnly(rainbow); state.pending = 'rainbow'; refreshCursor(); say(['Rainbow', 'Arc-en-ciel'], true); });
        palette.appendChild(rainbow);
    } else {
        paletteLabel = ['Stickers', 'Autocollants'];
        stickerKinds.forEach((s, i) => button(s.icon, s.label, () => { state.sticker = i; refreshCursor(); soundEffect('pop'); updateUI(); }, palette).setAttribute('aria-pressed', String(state.sticker === i)));
        button('🧼', ['Peel off', 'Décoller'], () => {
            state.stickers = [];
            const layer = $('#stickers');
            if (layer) layer.innerHTML = '';
            soundEffect('whoosh');
            say(['All peeled off!', 'Tout est décollé !']);
        }, palette);
    }
}
function updateUI() {
    updateText();
    controls.replaceChildren();
    palette.replaceChildren();
    palette.className = `palette cg-palette cg-palette-${state.phase === 'drive' ? 'worlds' : state.tool}`;
    if (state.phase === 'drive') {
        const home = button('🏠', ['Garage', 'Garage'], toGarage);
        home.classList.add('primary');
        home.dataset.focusKey = 'phase';
        button('⬆️', ['Jump!', 'Saute !'], () => jump());
        button('📯', ['Honk', 'Klaxon'], honk);
        paletteLabel = ['Choose a world', 'Choisir un monde'];
        worlds.forEach((w, i) => button(w.icon, w.name, () => { if (state.world !== i) switchWorld(i); }, palette).setAttribute('aria-pressed', String(state.world === i)));
    } else {
        [['vehicle', vehicles[state.vehicle].icon, ['Vehicles', 'Véhicules']], ['wash', '🧽', ['Wash', 'Laver']], ['paint', '🎨', ['Paint', 'Peindre']], ['sticker', '⭐', ['Stickers', 'Autocollants']]]
            .forEach(([id, icon, label]) => button(icon, label, () => setTool(id)).setAttribute('aria-pressed', String(state.tool === id)));
        const go = button('▶️', ['Drive!', 'En route !'], toDrive);
        go.classList.add('primary');
        go.dataset.focusKey = 'phase';
        garagePalette();
    }
    palette.setAttribute('aria-label', text(paletteLabel));
}
function toDrive() {
    state.phase = 'drive';
    activePointer = null;
    stage.classList.add('cg-driving');
    startDrive();
    soundEffect('vroom');
    say(['Vroom! Off we go!', 'Vroum ! En route !'], true);
    updateUI();
}
function toGarage() {
    stopLoop();
    clearWait();
    state.phase = 'garage';
    activePointer = null;
    stage.classList.remove('cg-driving');
    if (state.mud.length) { state.tool = 'wash'; state.washTool = 'sponge'; }
    garageScene();
    chime(true);
    say(state.mud.length ? ['Home again! Time to wash off that mud.', 'De retour ! On lave cette boue.'] : ['Home again in the garage!', 'De retour au garage !'], true);
    updateUI();
}

// ---------- Input ----------
let activePointer = null;
function toSvg(event) {
    const matrix = stage.querySelector('svg')?.getScreenCTM();
    if (!matrix) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return [p.x, p.y];
}
stage.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    unlockAudio();
    const p = toSvg(event);
    if (!p) return;
    activePointer = event.pointerId;
    try { stage.setPointerCapture(event.pointerId); } catch { /* capture is optional */ }
    if (state.phase === 'drive') { driveTap(p[0], p[1]); return; }
    moveCursor(p[0], p[1]);
    lookAt(p[0], p[1]);
    garageDown(p[0], p[1]);
});
stage.addEventListener('pointermove', event => {
    if (state.phase !== 'garage') return;
    const mine = event.pointerId === activePointer;
    if (!mine && event.pointerType !== 'mouse') return;
    const p = toSvg(event);
    if (!p) return;
    moveCursor(p[0], p[1]);
    lookAt(p[0], p[1]);
    if (mine) { event.preventDefault(); garageMove(p[0], p[1]); }
});
const endPointer = event => {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    lastRub = null;
    if (event.pointerType !== 'mouse') hideCursor();
};
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => stage.addEventListener(type, endPointer));
stage.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse' && activePointer === null) hideCursor(); });
stage.addEventListener('keydown', event => {
    if (event.target.closest('button') || (event.key !== ' ' && event.key !== 'Enter')) return;
    event.preventDefault();
    unlockAudio();
    if (state.phase === 'drive') { if (!event.repeat) driveTap(-999, -999); }
    else garageKey();
});

// ---------- Start ----------
stage.setAttribute('role', 'group');
stage.tabIndex = 0;
makeMuddy();
garageScene();
say(['Oh no, a muddy car! Let’s wash it.', 'Oh non, une voiture pleine de boue ! On la lave.']);
init(() => {
    updateUI();
    if (state.lastMessage) message(state.lastMessage);
    if (drive.waitButton && drive.waiting) showWaitButton(drive.waiting);
});
// Re-apply our palette label after the shared sound toggle resets it.
document.getElementById('sound').addEventListener('click', () => palette.setAttribute('aria-label', text(paletteLabel)));
