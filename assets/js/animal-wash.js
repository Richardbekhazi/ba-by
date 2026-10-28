import { stage, controls, palette, text, setTitle, instruction, message, button, svg, node, rub, celebrate, chime, init, react, soundEffect, tone, reducedMotion, speak } from './toddler-play.js?v=20261028-lang';

// ---------- Friends (original vector art, drawn around a shared body layout) ----------
// Head centre (300,160), body centre (300,262), feet at y 318, eyes at (270|330, 152).
const friends = [
    {
        id: 'puppy', name: ['Puppy', 'Petit chien'], fur: '#dca46c', dark: '#8a5a3c', belly: '#fbe6c8',
        voice: [[330, 262], 'triangle', .8], sound: ['Woof!', 'Ouaf !'], nose: [300, 182], mouthY: 206, tailOrigin: [392, 258],
        tail: '<path d="M390 258 Q430 250 440 205" fill="none" stroke="#dca46c" stroke-width="22" stroke-linecap="round"/><circle cx="440" cy="203" r="12" fill="#8a5a3c"/>',
        decor: '<ellipse cx="330" cy="150" rx="28" ry="24" fill="#b47c52" opacity=".7"/>',
        ears: '<ellipse cx="216" cy="165" rx="28" ry="58" fill="#8a5a3c" transform="rotate(20 216 165)"/><ellipse cx="384" cy="165" rx="28" ry="58" fill="#8a5a3c" transform="rotate(-20 384 165)"/>',
        snout: '<ellipse cx="300" cy="190" rx="34" ry="22" fill="#f6dcc0"/><ellipse cx="300" cy="182" rx="13" ry="9" fill="#4a3530"/><path class="tongue" d="M292 210 Q300 232 308 210Z" fill="#ef7f8f"/>'
    },
    {
        id: 'piglet', name: ['Piglet', 'Petit cochon'], fur: '#f5a9bc', dark: '#e07f9b', belly: '#fcd6df',
        voice: [[196, 165], 'square', .85], sound: ['Oink oink!', 'Groin groin !'], nose: [300, 186], mouthY: 214, tailOrigin: [396, 258],
        tail: '<path d="M394 258 Q418 254 416 236 Q413 222 401 228 Q392 236 404 243 Q420 249 430 232" fill="none" stroke="#e07f9b" stroke-width="7" stroke-linecap="round"/>',
        backEars: '',
        ears: '<path d="M232 108 L222 52 L276 88Z" fill="#e88aa5" stroke="#f5a9bc" stroke-width="8" stroke-linejoin="round"/><path d="M368 108 L378 52 L324 88Z" fill="#e88aa5" stroke="#f5a9bc" stroke-width="8" stroke-linejoin="round"/>',
        snout: '<ellipse cx="300" cy="188" rx="27" ry="19" fill="#e9879f"/><ellipse cx="291" cy="188" rx="4" ry="6" fill="#a94f69"/><ellipse cx="309" cy="188" rx="4" ry="6" fill="#a94f69"/>'
    }
];
friends.push(
    {
        id: 'bunny', name: ['Bunny', 'Petit lapin'], fur: '#e6e1f3', dark: '#b9b0d6', belly: '#ffffff',
        voice: [[1100, 1320], 'sine', 1.1], sound: ['Squeak!', 'Couic !'], nose: [300, 180], mouthY: 200, tailOrigin: [396, 270],
        tail: '<g fill="#fff"><circle cx="404" cy="272" r="20"/><circle cx="416" cy="260" r="13"/><circle cx="414" cy="284" r="12"/></g>',
        backEars: '<g class="ears"><ellipse cx="262" cy="70" rx="23" ry="64" fill="#e6e1f3" transform="rotate(-10 262 70)"/><ellipse cx="262" cy="72" rx="10" ry="44" fill="#f6bfd0" transform="rotate(-10 262 72)"/><ellipse cx="338" cy="70" rx="23" ry="64" fill="#e6e1f3" transform="rotate(10 338 70)"/><ellipse cx="338" cy="72" rx="10" ry="44" fill="#f6bfd0" transform="rotate(10 338 72)"/></g>',
        snout: '<path d="M291 176 H309 L300 187Z" fill="#f18fac" stroke="#f18fac" stroke-width="4" stroke-linejoin="round"/><path d="M300 187 V198" stroke="#2f3b52" stroke-width="3.5"/><rect x="292" y="205" width="16" height="12" rx="3" fill="#fff" stroke="#c9c2df" stroke-width="2"/><path d="M300 205 V217" stroke="#c9c2df" stroke-width="2"/>'
    },
    {
        id: 'kitten', name: ['Kitten', 'Petit chat'], fur: '#f4b25e', dark: '#d9853a', belly: '#fff1dc',
        voice: [[700, 900, 640], 'sine', .9], sound: ['Meow!', 'Miaou !'], nose: [300, 180], mouthY: 196, tailOrigin: [394, 262],
        tail: '<path d="M392 262 C455 258 462 190 430 172" fill="none" stroke="#f4b25e" stroke-width="18" stroke-linecap="round"/><path d="M447 222 l14 4M452 196 l14 -2" stroke="#d9853a" stroke-width="7" stroke-linecap="round"/>',
        decor: '<g stroke="#d9853a" stroke-width="7" stroke-linecap="round"><path d="M300 84 V104M280 88 L284 106M320 88 L316 106"/><path d="M214 150 H232M216 170 H232M386 150 H368M384 170 H368"/></g>',
        ears: '<path d="M226 118 L230 56 L282 90Z" fill="#f4b25e" stroke="#f4b25e" stroke-width="8" stroke-linejoin="round"/><path d="M236 104 L238 72 L266 90Z" fill="#f7b9c6"/><path d="M374 118 L370 56 L318 90Z" fill="#f4b25e" stroke="#f4b25e" stroke-width="8" stroke-linejoin="round"/><path d="M364 104 L362 72 L334 90Z" fill="#f7b9c6"/>',
        snout: '<path d="M292 176 H308 L300 186Z" fill="#ec8aa3" stroke="#ec8aa3" stroke-width="4" stroke-linejoin="round"/><g stroke="#8a6b55" stroke-width="2.5" stroke-linecap="round"><path d="M262 186 L222 180M262 194 L224 198M338 186 L378 180M338 194 L376 198"/></g>'
    },
    {
        id: 'elephant', name: ['Baby elephant', 'Bébé éléphant'], fur: '#a9b9cf', dark: '#8596b0', belly: '#c9d5e4',
        voice: [[196, 262, 330], 'triangle', 1.3], sound: ['Toot toot!', 'Pouet pouet !'], nose: [338, 232], mouthY: 206, tailOrigin: [396, 262],
        tail: '<path d="M394 262 Q420 268 428 292" fill="none" stroke="#8596b0" stroke-width="7" stroke-linecap="round"/><path d="M422 288 l6 16 l9 -12Z" fill="#6f7f99"/>',
        backEars: '<g class="ears"><ellipse cx="208" cy="162" rx="62" ry="70" fill="#a9b9cf"/><ellipse cx="214" cy="164" rx="42" ry="50" fill="#ebbac8"/><ellipse cx="392" cy="162" rx="62" ry="70" fill="#a9b9cf"/><ellipse cx="386" cy="164" rx="42" ry="50" fill="#ebbac8"/></g>',
        snout: '<path class="trunk" d="M300 172 Q298 228 320 240 Q340 246 340 228" fill="none" stroke="#a9b9cf" stroke-width="26" stroke-linecap="round"/><path d="M290 196 h18M291 212 h18M298 228 h16" stroke="#8596b0" stroke-width="3" stroke-linecap="round"/>'
    }
);

const mudSpots = [[262, 118], [345, 132], [300, 248], [246, 282], [356, 270], [246, 320], [355, 320]];
const toolNames = { sponge: ['Sponge', 'Éponge'], shower: ['Shower', 'Douche'], towel: ['Towel', 'Serviette'] };
const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568];

// ---------- State ----------
const S = {
    friend: 0, tool: 'sponge', patches: [], foam: [], wet: 0, washed: false, clean: false, hat: 0,
    pointer: { x: 95, y: 290, seen: -Infinity }, cursor: { x: 95, y: 290, tilt: 0 }, cursorVisible: true,
    pressing: false, down: null, lastRub: null, lastReact: -Infinity, lastSquish: -Infinity, lastSplash: -Infinity,
    sneezeCharge: 0, lastSneeze: -Infinity, note: 0, lastMsg: null, mudRun: null, foamPeak: 0, meters: {}, coin: null,
    particles: [], floaters: [], nextFloater: 0, nextBlink: 0, duck: { x: 455, target: 455, dir: -1 }, pupil: { x: 0, y: 0 }
};
const COIN_KEY = 'ba-by.wash.coins';
try { S.coins = Number(localStorage.getItem(COIN_KEY)) || 0; } catch { S.coins = 0; }
const $ = id => stage.querySelector('#' + id);
const animal = () => $('animal');
const onHead = (x, y) => ((x - 300) / 92) ** 2 + ((y - 158) / 84) ** 2 < 1;
const onBody = (x, y) => ((x - 300) / 104) ** 2 + ((y - 264) / 72) ** 2 < 1;
const onAnimal = (x, y) => onHead(x, y) || onBody(x, y) || (y > 300 && y < 340 && Math.abs(x - 300) < 90);
function say(pair, speakIt = false) { S.lastMsg = pair; message(pair, speakIt); }
function voice() { const [notes, wave, bend] = friends[S.friend].voice; tone(notes, wave, bend); }

// Clean look: same body shape, plus shiny highlights, twinkles and a little bow.
function shine() {
    const twinkle = (x, y, r, delay) => `<path class="twinkle" style="animation-delay:${delay}s" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="#ffd45c" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`;
    return `<g class="shine"><ellipse cx="262" cy="110" rx="24" ry="10" fill="#fff" opacity=".45" transform="rotate(-28 262 110)"/><ellipse cx="246" cy="238" rx="16" ry="8" fill="#fff" opacity=".4" transform="rotate(-35 246 238)"/>
        ${twinkle(196, 108, 14, 0)}${twinkle(404, 150, 11, .5)}${twinkle(206, 290, 10, 1)}${twinkle(400, 300, 13, 1.4)}${twinkle(334, 70, 9, .8)}</g>
        <g class="bow" transform="translate(352 96) rotate(18)"><path d="M0 0L-22 -13Q-28 0 -22 13ZM0 0L22 -13Q28 0 22 13Z" fill="#f47fa8" stroke="#e05f8d" stroke-width="3" stroke-linejoin="round"/><circle r="7" fill="#e05f8d"/></g>`;
}

function drawFriend() {
    const f = friends[S.friend];
    const eye = x => `<g class="eye"><circle cx="${x}" cy="152" r="14" fill="#fff"/><g class="pupil"><circle cx="${x}" cy="153" r="8.5" fill="#2f3b52"/><circle cx="${x + 3}" cy="149" r="3" fill="#fff"/></g>
        <ellipse class="lid" cx="${x}" cy="151" rx="16" ry="16" fill="${f.fur}"/></g>`;
    const my = f.mouthY;
    svg(`<defs><pattern id="wash-tiles" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="#e3f4f7"/><path d="M50 0V50H0" fill="none" stroke="#cbe6ec" stroke-width="3"/></pattern></defs>
        <rect width="600" height="380" fill="url(#wash-tiles)"/>
        <g opacity=".9"><rect x="26" y="70" width="104" height="10" rx="5" fill="#c9a77f"/><rect x="38" y="32" width="24" height="38" rx="8" fill="#ad79d1"/><rect x="44" y="24" width="12" height="10" rx="3" fill="#7d55a0"/>
        <rect x="72" y="42" width="22" height="28" rx="7" fill="#58b98c"/><circle cx="114" cy="58" r="12" fill="#f4ab45"/></g>
        <rect y="330" width="600" height="50" fill="#bfe4e3"/>
        <ellipse cx="300" cy="336" rx="186" ry="17" fill="#9ed8ec"/>
        <g id="puddle"><ellipse cx="522" cy="357" rx="54" ry="15" fill="#8f6649"/><ellipse cx="508" cy="353" rx="26" ry="5" fill="#a9805c"/><circle cx="546" cy="356" r="4" fill="#a9805c"/><circle cx="488" cy="360" r="3" fill="#a9805c"/></g>
        <g id="leap"><g id="animal"><g id="breath">
            <g id="tail" style="transform-origin:${f.tailOrigin[0]}px ${f.tailOrigin[1]}px">${f.tail}</g>
            <g class="back-ears">${f.backEars || ''}</g>
            <ellipse cx="300" cy="264" rx="100" ry="68" fill="${f.fur}"/>
            <ellipse cx="300" cy="274" rx="58" ry="44" fill="${f.belly}"/>
            <ellipse class="foot" cx="246" cy="320" rx="31" ry="17" fill="${f.fur}"/><ellipse class="foot" cx="354" cy="320" rx="31" ry="17" fill="${f.fur}"/>
            <g fill="${f.dark}" opacity=".45"><circle cx="234" cy="322" r="4"/><circle cx="246" cy="326" r="4"/><circle cx="258" cy="322" r="4"/><circle cx="342" cy="322" r="4"/><circle cx="354" cy="326" r="4"/><circle cx="366" cy="322" r="4"/></g>
            <ellipse cx="300" cy="158" rx="88" ry="78" fill="${f.fur}"/>
            ${f.decor || ''}
            <g class="ears">${f.ears || ''}</g>
            <g class="eyes-open">${eye(270)}${eye(330)}</g>
            <g class="eyes-happy" fill="none" stroke="#2f3b52" stroke-width="5" stroke-linecap="round"><path d="M257 155 Q270 141 283 155M317 155 Q330 141 343 155"/></g>
            <g fill="#f39b9c" opacity=".6"><ellipse cx="240" cy="182" rx="13" ry="8"/><ellipse cx="360" cy="182" rx="13" ry="8"/></g>
            <path class="mouth-closed" d="M286 ${my} Q300 ${my + 11} 314 ${my}" fill="none" stroke="#2f3b52" stroke-width="4.5" stroke-linecap="round"/>
            <path class="mouth-open" d="M283 ${my - 2} Q300 ${my + 26} 317 ${my - 2}Z" fill="#b84f63" stroke="#2f3b52" stroke-width="4" stroke-linejoin="round"/>
            ${f.snout || ''}
            ${shine()}
            <g id="mud"></g><g id="foam"></g>
            <g id="wet"><g fill="#7cc6ea" opacity=".8"><path d="M240 210 q6 12 0 16 q-6 -4 0 -16Z"/><path d="M362 120 q6 12 0 16 q-6 -4 0 -16Z"/><path d="M330 300 q6 12 0 16 q-6 -4 0 -16Z"/><path d="M262 260 q6 12 0 16 q-6 -4 0 -16Z"/><path d="M372 236 q6 12 0 16 q-6 -4 0 -16Z"/></g></g>
            <g id="hat"></g>
        </g></g></g>
        <g id="duck" class="duck"><g class="duck-body"><ellipse cx="0" cy="0" rx="30" ry="17" fill="#ffd45c"/><path d="M18 -6 Q38 -22 32 4Z" fill="#ffd45c"/><circle cx="-16" cy="-19" r="17" fill="#ffd45c"/>
            <path d="M-31 -19 L-46 -14 L-31 -10Z" fill="#f79a49"/><circle cx="-21" cy="-23" r="3.2" fill="#2f3b52"/><path d="M-4 -4 Q8 6 16 -4" fill="none" stroke="#f1b442" stroke-width="4" stroke-linecap="round"/></g></g>
        <path d="M108 330 Q300 354 492 330 L470 374 Q300 394 130 374Z" fill="#fff" stroke="#cde7ef" stroke-width="5"/>
        <path d="M150 352 Q300 368 450 352" fill="none" stroke="#e3f3f8" stroke-width="6" stroke-linecap="round"/>
        <g id="coin-bank" transform="translate(536 40)"><g class="bank-inner"><rect x="-48" y="-21" width="96" height="42" rx="21" fill="#fff" fill-opacity=".92" stroke="#f1b442" stroke-width="3"/><g transform="translate(-26 0)">${coinArt(14)}</g><text id="coin-count" x="-6" y="9" font-size="25" font-weight="700" fill="#8a5a1c">0</text></g></g>
        <g id="fx"></g><g id="cursor"></g>`);
    S.patches = mudSpots.map(([x, y], i) => {
        const el = node('path', { d: `M${x - 20} ${y} Q${x - 28} ${y - 24} ${x - 5} ${y - 18} Q${x + 22} ${y - 30} ${x + 26} ${y - 3} Q${x + 30} ${y + 21} ${x + 2} ${y + 18} Q${x - 24} ${y + 29} ${x - 20} ${y}Z`, fill: i % 2 ? '#8f6649' : '#a9805c', class: 'mud' }, $('mud'));
        return { x, y, el, dirt: 1 };
    });
    S.foam = []; S.foamPeak = 0; S.coin = null;
    S.wet = 0; S.washed = false; S.clean = false; S.hat = 0; S.sneezeCharge = 0;
    showCoins();
    S.particles = []; S.floaters = [];
    S.tool = 'sponge';
    S.duck = { x: 455, target: 455, dir: -1 };
    S.suggested = suggestion();
    drawCursor();
    renderWet();
    updateUI();
}
const cursorArt = {
    sponge: '<g class="tool-art"><rect x="-36" y="-26" width="72" height="52" rx="16" fill="#ffd45c" stroke="#e8a93a" stroke-width="4"/><rect x="-36" y="-26" width="72" height="15" rx="7" fill="#58b98c"/><g fill="#e8a93a"><circle cx="-16" cy="4" r="4"/><circle cx="6" cy="12" r="5"/><circle cx="20" cy="-1" r="3.5"/><circle cx="-22" cy="17" r="3"/></g></g>',
    shower: '<g class="tool-art"><path d="M14 -58 L40 -94" stroke="#8596b0" stroke-width="13" stroke-linecap="round"/><path d="M-26 -44 Q0 -76 26 -44Z" fill="#c8d4e2" stroke="#8596b0" stroke-width="4" stroke-linejoin="round"/><g fill="#5aa9d6"><circle cx="-14" cy="-47" r="3"/><circle cx="0" cy="-46" r="3"/><circle cx="14" cy="-47" r="3"/></g></g>',
    towel: '<g class="tool-art" transform="rotate(-8)"><rect x="-40" y="-26" width="80" height="52" rx="12" fill="#f59cc0" stroke="#e57aa5" stroke-width="4"/><path d="M-40 -6 H40M-40 8 H40" stroke="#fff" stroke-width="5"/><path d="M-30 26 v8M-15 26 v8M0 26 v8M15 26 v8M30 26 v8" stroke="#e57aa5" stroke-width="4" stroke-linecap="round"/></g>'
};
function drawCursor() {
    const c = $('cursor');
    if (!c) return;
    c.innerHTML = `<g>${cursorArt[S.tool]}</g>`;
    placeCursor();
}
function placeCursor() {
    const c = $('cursor');
    if (!c) return;
    c.setAttribute('transform', `translate(${S.cursor.x.toFixed(1)} ${S.cursor.y.toFixed(1)}) rotate(${S.cursor.tilt.toFixed(1)})`);
    c.style.opacity = S.cursorVisible && !S.mudRun ? '' : '0';
}
function renderWet() {
    const w = $('wet');
    if (w) w.setAttribute('opacity', (S.wet * .95).toFixed(2));
    animal()?.classList.toggle('soggy', S.wet > .25);
}
function renderPatch(p) {
    p.el.setAttribute('opacity', (p.dirt * .95).toFixed(2));
    p.el.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${(.55 + p.dirt * .45).toFixed(2)}) translate(${-p.x} ${-p.y})`);
}
function addFoam(x, y) {
    if (S.foam.length >= 40 || !onAnimal(x, y)) return;
    const g = node('g', { class: 'foam', transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})` }, $('foam'));
    const r = 9 + Math.random() * 7;
    node('circle', { cx: 0, cy: 0, r, fill: '#fff', stroke: '#bfe3f2', 'stroke-width': 2 }, g);
    node('circle', { cx: r * .9, cy: -r * .4, r: r * .65, fill: '#fff', stroke: '#bfe3f2', 'stroke-width': 2 }, g);
    node('circle', { cx: -r * .3, cy: -r * .35, r: r * .28, fill: '#e8f7ff' }, g);
    S.foam.push({ x, y, el: g });
    S.foamPeak = Math.max(S.foamPeak, S.foam.length);
    const [nx, ny] = friends[S.friend].nose;
    if (Math.hypot(x - nx, y - ny) < 55) S.sneezeCharge++;
}
function rinseFoam(cx, top, width, limit = 99) {
    let n = 0;
    S.foam = S.foam.filter(f => {
        if (n >= limit || Math.abs(f.x - cx) > width || f.y < top) return true;
        n++;
        f.el.remove();
        spawn('drop', f.x, f.y, (Math.random() - .5) * 40, 60, { g: 500, life: .7, r: 8, fill: '#fff' });
        return false;
    });
    return n;
}

// ---------- Tools ----------
function spongeAt(x, y, d) {
    if (!onAnimal(x, y)) return;
    S.washed = S.washed || S.wet > 0;
    let cleaned = false;
    S.patches.forEach(p => {
        if (p.dirt <= 0 || Math.hypot(p.x - x, p.y - y) > 48) return;
        p.dirt = Math.max(0, p.dirt - (d * .006 + .04));
        renderPatch(p);
        if (p.dirt === 0) { cleaned = true; spawnSparkles(p.x, p.y, 4); }
    });
    if (d > 0 || !S.lastRub) {
        S.foamTravel = (S.foamTravel || 0) + d + 6;
        if (S.foamTravel > 20) { S.foamTravel = 0; addFoam(x + (Math.random() - .5) * 26, y + (Math.random() - .5) * 26); }
    }
    const now = performance.now();
    if (cleaned) { tone([SCALE[(S.note++) % SCALE.length], SCALE[(S.note + 2) % SCALE.length]], 'sine', 1); progress(); }
    else if (now - S.lastSquish > 380) { S.lastSquish = now; tone([240 + Math.random() * 90], 'sine', 1.5); }
    if (S.sneezeCharge > 7 && now - S.lastSneeze > 9000) sneeze();
}
function showerFrame(dt) {
    const { x, y } = S.cursor;
    const reduced = reducedMotion();
    S.dropClock = (S.dropClock || 0) + dt;
    const every = reduced ? .09 : .025;
    while (S.dropClock > every) {
        S.dropClock -= every;
        spawn('drop', x + (Math.random() - .5) * 40, y - 42, (Math.random() - .5) * 30, 260, { g: 700, life: .55, r: 4, fill: '#5aa9d6' });
    }
    if (x < 190 || x > 415) return;
    const hit = onAnimal(x, y + 10) || (y < 130 && Math.abs(x - 300) < 90);
    if (!hit) return;
    const rinsed = rinseFoam(x, y - 40, 42, 2);
    S.patches.forEach(p => {
        if (p.dirt > 0 && Math.abs(p.x - x) < 40 && p.y > y - 40) { p.dirt = Math.max(0, p.dirt - dt * .35); renderPatch(p); }
    });
    S.wet = Math.min(1, S.wet + dt * 1.5);
    S.washed = true;
    renderWet();
    const now = performance.now();
    if (now - S.lastSplash > 650) { S.lastSplash = now; soundEffect(rinsed ? 'splash' : 'drip'); }
    if (rinsed) progress();
}
function towelAt(x, y, d) {
    if (!onAnimal(x, y)) return;
    if (S.wet > 0) {
        S.wet = Math.max(0, S.wet - (d * .0035 + .01));
        renderWet();
        if (Math.random() < .25) spawnSparkles(x, y, 1);
        const now = performance.now();
        if (now - S.lastSquish > 420) { S.lastSquish = now; tone([520 + Math.random() * 120], 'sine', .8); }
        if (S.wet === 0) progress();
    }
}
// Called whenever a step might be finished: re-renders hints, celebrates when all done.
function progress() {
    if (!S.clean && S.washed && S.wet === 0 && !S.foam.length && S.patches.every(p => p.dirt === 0)) return finish();
    const before = S.suggested;
    S.suggested = suggestion();
    if (before !== S.suggested) {
        if (S.suggested === 'shower' || S.suggested === 'towel') { chime(true); setTimeout(voice, 450); }
        if (S.suggested === 'shower') say(['All the mud is gone! Now rinse.', 'Plus de boue ! Maintenant on rince.']);
        else if (S.suggested === 'towel') say(['Bubbles all gone! Let\'s dry off.', 'Plus de bulles ! On se sèche.']);
        updateUI();
    }
}
function finish() {
    S.clean = true;
    S.suggested = null;
    const a = animal();
    a.classList.add('fluffy');
    if (!reducedMotion()) {
        react(a, 'shake');
        for (let i = 0; i < 22; i++) {
            const ang = Math.random() * Math.PI * 2;
            spawn('drop', 300 + Math.cos(ang) * 90, 220 + Math.sin(ang) * 80, Math.cos(ang) * 260, Math.sin(ang) * 220 - 80, { g: 500, life: .9, r: 5, fill: '#7cc6ea' });
        }
    }
    soundEffect('sparkle');
    S.coins++;
    try { localStorage.setItem(COIN_KEY, String(S.coins)); } catch { /* coins still count this visit */ }
    S.coin = { t: -1.4, el: null };
    setTimeout(() => {
        if (!S.clean) return;
        celebrate(300, 110);
        voice();
        say(['Thank you! I feel so pretty!', 'Merci ! Je suis tout beau !']);
    }, 650);
    updateUI();
}

// ---------- UI ----------
function suggestion() {
    if (S.clean) return null;
    if (S.patches.some(p => p.dirt > 0)) return 'sponge';
    if (S.foam.length) return 'shower';
    return 'towel';
}
const instructions = {
    sponge: ['Use the sponge. Rub off the mud!', 'Prends l\'éponge. Frotte la boue !'],
    shower: ['Now the shower! Rinse the bubbles away.', 'Maintenant la douche ! Rince les bulles.'],
    towel: ['Rub with the towel to dry!', 'Frotte avec la serviette pour sécher !'],
    clean: ['All clean! Tap my head, or jump in the puddle!', 'Tout propre ! Touche ma tête ou saute dans la flaque !'],
    puddle: ['Watch! Jump... SPLAT!', 'Regarde ! Hop... SPLATCH !']
};
function updateUI() {
    setTitle(['Wash the Animals', 'Le bain des animaux']);
    const next = S.mudRun ? null : suggestion();
    instruction(instructions[S.mudRun ? 'puddle' : next || 'clean']);
    stage.setAttribute('aria-label', text(['Bath time! Rub the animal. Space or Enter uses the ', 'C\'est le bain ! Frotte l\'animal. Espace ou Entrée utilise : ']) + text(toolNames[S.tool]).toLowerCase());
    controls.replaceChildren();
    palette.replaceChildren();
    [['sponge', '🧽'], ['shower', '🚿'], ['towel', '🧣']].forEach(([id, icon]) => {
        const el = button(icon, toolNames[id], () => pickTool(id));
        el.setAttribute('aria-pressed', String(S.tool === id));
        el.classList.toggle('suggest', next === id && S.tool !== id);
        el.insertAdjacentHTML('beforeend', '<span class="wash-meter" aria-hidden="true"><span class="wash-meter-fill"></span><span class="wash-pct"></span></span>');
        el.classList.add('meter-' + id);
        S.meters[id] = { el, last: -1 };
    });
    updateMeters();
    // One-tap actions live in their own row so they never look like a held tool.
    const friend = button('🐾', ['Next friend', 'Autre ami'], nextFriend, palette);
    friend.classList.add('wash-action');
    friend.classList.toggle('suggest', S.clean);
    button('💩', ['Mud puddle!', 'Flaque !'], puddle, palette).classList.add('wash-action');
    say(S.lastMsg || friends[S.friend].name);
}
function pickTool(id) {
    S.tool = id;
    soundEffect('whoosh');
    drawCursor();
    const c = $('cursor');
    if (c) react(c.firstElementChild, 'tool-pop');
    say(toolNames[id]);
    updateUI();
}
function nextFriend() {
    if (S.mudRun) return;
    S.friend = (S.friend + 1) % friends.length;
    S.lastMsg = null;
    drawFriend();
    voice();
    say(friends[S.friend].name);
    react(animal(), 'hop');
}
// ---------- Particles & floating bubbles ----------
function spawn(kind, x, y, vx, vy, { g = 0, life = 1, r = 5, fill = '#fff' } = {}) {
    const fx = $('fx');
    if (!fx || S.particles.length >= 90) return;
    const el = kind === 'drop'
        ? node('ellipse', { rx: r * .75, ry: r, fill }, fx)
        : node('path', { d: `M0 ${-r}L${r * .3} ${-r * .3}L${r} 0L${r * .3} ${r * .3}L0 ${r}L${-r * .3} ${r * .3}L${-r} 0L${-r * .3} ${-r * .3}Z`, fill }, fx);
    S.particles.push({ el, x, y, vx, vy, g, life, max: life });
}
function spawnSparkles(x, y, n) {
    const tints = ['#f8d85b', '#ad79d1', '#5b9fe4', '#ee6374'];
    for (let i = 0; i < n; i++) spawn('star', x + (Math.random() - .5) * 30, y + (Math.random() - .5) * 20, (Math.random() - .5) * 80, -60 - Math.random() * 60, { life: .8, r: 8, fill: tints[i % 4] });
}
function addFloater(x, y, vx = 0, vy = -30, r = 10 + Math.random() * 12) {
    const fx = $('fx');
    if (!fx || S.floaters.length >= 14) return;
    const el = node('g', { class: 'floater' }, fx);
    node('circle', { r, fill: '#fff', 'fill-opacity': .35, stroke: ['#8fcee6', '#f4a6d7', '#b9a7ef'][S.floaters.length % 3], 'stroke-width': 3 }, el);
    node('ellipse', { cx: -r * .35, cy: -r * .4, rx: r * .28, ry: r * .18, fill: '#fff', transform: `rotate(-30 ${-r * .35} ${-r * .4})` }, el);
    S.floaters.push({ el, x, y, vx, vy, r, phase: Math.random() * 6, age: 0 });
}
function popFloatersNear(x, y) {
    S.floaters = S.floaters.filter(b => {
        if (Math.hypot(b.x - x, b.y - y) > b.r + 22) return true;
        b.el.remove();
        tone([SCALE[S.note % SCALE.length]], 'sine', 1.03);
        S.note = (S.note + 1) % SCALE.length;
        for (let i = 0; i < 5; i++) {
            const a = i / 5 * Math.PI * 2;
            spawn('drop', b.x + Math.cos(a) * b.r, b.y + Math.sin(a) * b.r, Math.cos(a) * 90, Math.sin(a) * 90, { life: .35, r: 3, fill: '#bfe3f2' });
        }
        return false;
    });
}

// ---------- Surprises ----------
function sneeze() {
    S.lastSneeze = performance.now();
    S.sneezeCharge = 0;
    const a = animal();
    const [nx, ny] = friends[S.friend].nose;
    react(a, 'happy');
    setTimeout(() => {
        if (!a.isConnected) return;
        react(a, 'sneeze');
        tone([900, 380], 'triangle', .6);
        say(['Ah... ah... ACHOO! Bubbles everywhere!', 'Ah... ah... ATCHOUM ! Des bulles partout !']);
        rinseFoam(nx, ny - 60, 60, 4);
        for (let i = 0; i < 9; i++) addFloater(nx, ny, (Math.random() - .5) * 260, -60 - Math.random() * 160);
        if (friends[S.friend].id === 'elephant') trunkSpray();
    }, 420);
}
function trunkSpray() {
    const [nx, ny] = friends[S.friend].nose;
    const n = reducedMotion() ? 6 : 26;
    for (let i = 0; i < n; i++) spawn('drop', nx, ny - 8, -40 - Math.random() * 160, -300 - Math.random() * 120, { g: 650, life: 1.1, r: 5, fill: '#5aa9d6' });
    soundEffect('splash');
    if (S.foam.length) { rinseFoam(260, 0, 100, 6); S.wet = Math.min(1, S.wet + .5); S.washed = true; renderWet(); progress(); }
}
function duckTap() {
    const d = S.duck;
    d.target = Math.max(150, Math.min(460, d.x + d.dir * (70 + Math.random() * 60)));
    if (d.target === 150 || d.target === 460) d.dir *= -1;
    soundEffect('squeak');
    react($('duck').firstElementChild, 'duck-hop');
    say(['Squeak squeak! Paddle, paddle!', 'Couic couic ! Barbote, barbote !']);
    addFloater(d.x, 316, 0, -40, 9);
}
// ---------- Progress meters & coin reward ----------
function updateMeters() {
    const mud = S.patches.length ? 1 - S.patches.reduce((sum, p) => sum + p.dirt, 0) / S.patches.length : 0;
    const values = S.clean ? { sponge: 1, shower: 1, towel: 1 } : {
        sponge: mud,
        shower: S.foamPeak ? 1 - S.foam.length / S.foamPeak : S.washed ? 1 : 0,
        towel: S.washed ? 1 - S.wet : 0
    };
    Object.entries(S.meters).forEach(([id, m]) => {
        const v = Math.round(values[id] * 100);
        if (v === m.last || !m.el.isConnected) return;
        m.last = v;
        m.el.style.setProperty('--fill', v + '%');
        m.el.querySelector('.wash-pct').textContent = v === 100 ? '✓' : v + '%';
        m.el.classList.toggle('full', v === 100);
    });
}
const coinArt = r => `<circle r="${r}" fill="#ffd45c" stroke="#e8a93a" stroke-width="${r / 5}"/><circle r="${r * .62}" fill="none" stroke="#f1b442" stroke-width="${r / 8}"/><path d="M0 ${-r * .38}L${r * .12} ${-r * .12}L${r * .38} ${-r * .1}L${r * .18} ${r * .08}L${r * .24} ${r * .36}L0 ${r * .22}L${-r * .24} ${r * .36}L${-r * .18} ${r * .08}L${-r * .38} ${-r * .1}L${-r * .12} ${-r * .12}Z" fill="#f1b442"/><ellipse cx="${-r * .4}" cy="${-r * .45}" rx="${r * .22}" ry="${r * .12}" fill="#fff" opacity=".7" transform="rotate(-35 ${-r * .4} ${-r * .45})"/>`;
function showCoins() {
    const el = $('coin-count');
    if (el) el.textContent = String(S.coins - (S.coin ? 1 : 0));
}
function coinLanded() {
    S.coin?.el?.remove();
    S.coin = null;
    showCoins();
    react(stage.querySelector('.bank-inner'), 'hop');
    tone([988, 1319], 'square', 1);
    spawnSparkles(510, 40, 5);
    say(['Ding! A shiny coin for you!', 'Ding ! Une pièce brillante pour toi !']);
}
// The coin pops out above the friend, spins, then flies into the bank.
function coinFrame(dt) {
    const c = S.coin;
    c.t += dt;
    const t = c.t;
    if (t < 0) return;
    if (reducedMotion()) { coinLanded(); return; }
    if (!c.el) {
        c.el = node('g', { class: 'flying-coin' }, $('fx'));
        c.el.innerHTML = coinArt(40);
        soundEffect('sparkle');
    }
    let x = 300, y, s, spin = Math.cos(t * 9);
    if (t < .45) { s = ease(t / .45) * 1.1; y = 120 - 50 * ease(t / .45); }
    else if (t < 1.2) { s = 1.1; y = 70 + Math.sin((t - .45) * 8) * 4; }
    else {
        const p = ease(Math.min(1, (t - 1.2) / .6));
        x = 300 + 210 * p; y = 70 - 30 * p - Math.sin(Math.PI * p) * 40; s = 1.1 - .65 * p; spin = 1;
    }
    c.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s * Math.max(.12, Math.abs(spin))).toFixed(3)} ${s.toFixed(3)})`);
    if (t >= 1.8) coinLanded();
}
// ---------- Mud puddle adventure: crouch, leap, splat, get muddy, hop back ----------
const PUDDLE = { x: 520, y: 356 };
function puddle() {
    if (S.mudRun) return;
    S.mudRun = { t: 0, fired: new Set(), splats: 0 };
    S.clean = false; S.washed = false; S.hat = 0; S.sneezeCharge = 0; S.lastMsg = null;
    $('hat').replaceChildren();
    S.foam.forEach(f => f.el.remove());
    S.foam = []; S.foamPeak = 0;
    S.tool = 'sponge';
    drawCursor();
    $('puddle').classList.add('show');
    S.duck.target = 170; S.duck.dir = 1; // the duck paddles out of the way
    soundEffect('drip');
    say(['Ooh! A big mud puddle!', 'Oh ! Une grosse flaque de boue !']);
    updateUI();
}
const ease = p => p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
function leapTo(p, squash = 0) {
    const s = 1 - .45 * p;
    const x = (PUDDLE.x - 300) * p;
    const y = 20 * p - Math.sin(Math.PI * p) * 110;
    $('leap')?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) translate(300 336) scale(${(s * (1 + squash)).toFixed(3)} ${(s * (1 - squash)).toFixed(3)}) translate(-300 -336)`);
}
function mudBurst(x, y, n, fills = ['#8f6649', '#a9805c']) {
    for (let i = 0; i < n; i++) spawn('drop', x + (Math.random() - .5) * 60, y - 6, (Math.random() - .5) * 320, -180 - Math.random() * 240, { g: 800, life: 1, r: 5 + Math.random() * 4, fill: fills[i % fills.length] });
}
function mudFrame(dt) {
    const run = S.mudRun;
    run.t += dt;
    const t = run.t;
    const once = (key, at, fn) => { if (t >= at && !run.fired.has(key)) { run.fired.add(key); fn(); } };
    const still = reducedMotion();
    // 0–0.7s: puddle grows, the friend spots it and crouches.
    if (t < .7) leapTo(0, still ? 0 : Math.max(0, (t - .35) / .35) * .12);
    once('leap', .7, () => { soundEffect('boing'); voice(); });
    // 0.7–1.3s: big jump into the puddle.
    if (t >= .7 && t < 1.3) leapTo(still ? 0 : ease((t - .7) / .6));
    once('splat', 1.3, () => {
        $('puddle').classList.add('splat');
        animal().classList.remove('fluffy', 'hatted');
        S.wet = 0;
        renderWet();
        soundEffect('splash');
        if (!still) mudBurst(PUDDLE.x, PUDDLE.y, 18);
        react(animal(), 'happy');
        say(['SPLAT! Mud everywhere! Hee hee!', 'SPLATCH ! De la boue partout ! Hi hi !']);
    });
    // 1.3–2.5s: wiggle in the mud while splotches land one by one.
    if (t >= 1.3 && t < 2.6) leapTo(still ? 0 : 1, still ? 0 : Math.sin((t - 1.3) * 18) * .08 * Math.max(0, 1 - (t - 1.3) / 1.2));
    const due = Math.min(S.patches.length, Math.floor((t - 1.4) / .15) + 1);
    while (t >= 1.4 && run.splats < due) {
        const p = S.patches[run.splats++];
        p.dirt = 1;
        renderPatch(p);
        p.el.classList.remove('mud-pop');
        void p.el.getBoundingClientRect();
        p.el.classList.add('mud-pop');
        tone([180 + run.splats * 25], 'sine', .6);
    }
    once('giggle', 2.0, () => { soundEffect('giggle'); react(animal(), 'happy'); });
    // 2.6–3.2s: hop back into the bath.
    once('back', 2.6, () => soundEffect('boing'));
    if (t >= 2.6 && t < 3.2) leapTo(still ? 0 : 1 - ease((t - 2.6) / .6));
    once('land', 3.2, () => {
        leapTo(0);
        $('puddle').classList.remove('show', 'splat');
        soundEffect('splash');
        if (!still) mudBurst(300, 336, 12, ['#9ed8ec', '#7cc6ea']);
    });
    once('end', 3.6, () => {
        S.mudRun = null;
        S.suggested = suggestion();
        say(['Uh oh, so muddy! Wash me again!', 'Oh là là, plein de boue ! Lave-moi encore !']);
        updateUI();
    });
}
const hats = [
    '',
    '<path d="M244 98L300 14L356 98Z" fill="#ad79d1"/><path d="M270 64L322 48M256 88L340 70" stroke="#f8d85b" stroke-width="9"/><circle cx="300" cy="14" r="13" fill="#ee6374"/>',
    '<path d="M246 94L240 42L271 64L300 28L329 64L360 42L354 94Z" fill="#ffd45c" stroke="#f1b442" stroke-width="5" stroke-linejoin="round"/><circle cx="300" cy="70" r="9" fill="#ee6374"/>',
    '<path d="M232 96 Q300 30 368 96Z" fill="#fff"/><g fill="#bfe3f2"><circle cx="262" cy="70" r="16"/><circle cx="300" cy="52" r="20"/><circle cx="338" cy="70" r="16"/></g><circle cx="300" cy="34" r="10" fill="#fff"/>'
];
function nextHat() {
    S.hat = (S.hat + 1) % hats.length;
    $('hat').innerHTML = hats[S.hat];
    animal().classList.toggle('hatted', S.hat > 0);
    soundEffect('boing');
    react(animal(), 'wiggle');
    say(S.hat ? ['A silly hat! Tap again!', 'Un chapeau rigolo ! Encore !'] : ['No hat! Tap for another!', 'Plus de chapeau ! Encore ?']);
}

// ---------- Body reactions ----------
function region(x, y) {
    const f = friends[S.friend];
    if (Math.hypot(x - f.nose[0], y - f.nose[1]) < 26) return 'nose';
    if (onHead(x, y)) return y < 112 || Math.abs(x - 300) > 70 ? 'ears' : 'head';
    if (y > 304 && Math.abs(x - 300) > 20 && Math.abs(x - 300) < 90) return 'feet';
    if (x > 385 && y > 170 && y < 300) return 'tail';
    if (onBody(x, y)) return 'belly';
    return null;
}
function reactAt(x, y, force = false) {
    const now = performance.now();
    if (!force && now - S.lastReact < 1300) return;
    const where = region(x, y);
    if (!where) return;
    S.lastReact = now;
    const a = animal();
    const f = friends[S.friend];
    if (where === 'belly') { react(a, 'squirm'); react(a, 'happy'); soundEffect('giggle'); say(['Hee hee! My tummy tickles!', 'Hi hi ! Mon ventre chatouille !']); }
    else if (where === 'ears') { react(a, 'ears-wiggle'); soundEffect('boing'); say(['Boing! Wiggly ears!', 'Boing ! Les oreilles bougent !']); }
    else if (where === 'feet') { react(a, 'kick'); react(a, 'happy'); soundEffect('giggle'); say(['My toes! Hee hee!', 'Mes orteils ! Hi hi !']); }
    else if (where === 'tail') { react(a, 'tail-fast'); soundEffect('flutter'); say(['Wag, wag, wag!', 'Remue, remue !']); }
    else if (where === 'nose') { react(a, 'happy'); voice(); say(f.sound); if (f.id === 'elephant') trunkSpray(); }
    else { react(a, 'happy'); voice(); say(['Mmm, that feels nice!', 'Mmm, c\'est agréable !']); }
}
// ---------- Input ----------
function toSvg(event) {
    const matrix = stage.querySelector('svg')?.getScreenCTM();
    if (!matrix) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: p.x, y: p.y };
}
function aim(x, y) {
    S.pointer = { x, y, seen: performance.now() };
    S.cursorVisible = true;
}
// Registered before rub() so a new press starts fresh before the first scrub call.
stage.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || !event.isPrimary || event.button !== 0) return;
    const p = toSvg(event);
    if (!p) return;
    aim(p.x, p.y);
    S.cursor.x = p.x; S.cursor.y = p.y;
    S.pressing = true;
    S.lastRub = null;
    S.down = { x: p.x, y: p.y, t: performance.now(), moved: 0, duck: Math.hypot(p.x - S.duck.x, p.y - 316) < 48 };
    if (S.down.duck) duckTap();
});
stage.addEventListener('pointermove', event => {
    if (S.pressing || !event.isPrimary) return;
    const p = toSvg(event);
    if (p) aim(p.x, p.y);
});
stage.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !S.pressing) S.cursorVisible = false;
});
const release = event => {
    if (!S.pressing || !event.isPrimary) return;
    S.pressing = false;
    const d = S.down;
    S.down = null;
    if (d && !d.duck && d.moved < 14 && performance.now() - d.t < 450) tapAt(d.x, d.y);
};
['pointerup', 'pointercancel'].forEach(type => stage.addEventListener(type, release));
window.addEventListener('blur', () => { S.pressing = false; S.down = null; });

function scrub(x, y) {
    if (!S.down || S.down.duck || S.mudRun) return;
    const d = S.lastRub ? Math.hypot(x - S.lastRub.x, y - S.lastRub.y) : 0;
    S.lastRub = { x, y };
    S.down.moved += d;
    aim(x, y);
    popFloatersNear(x, y);
    if (S.tool === 'sponge') spongeAt(x, y, d);
    else if (S.tool === 'towel') towelAt(x, y, d);
    if (d > 2 && S.down.moved > 30) reactAt(x, y);
}
function tapAt(x, y) {
    if (S.mudRun) return;
    const where = region(x, y);
    if (S.clean && (where === 'head' || where === 'ears')) { nextHat(); return; }
    if (S.tool === 'sponge') spongeAt(x, y, 25);
    if (S.tool === 'towel') towelAt(x, y, 40);
    reactAt(x, y, true);
}
function keyAction() {
    if (S.mudRun) return;
    if (S.clean) {
        aim(300, 270);
        reactAt(300, 270, true);
        for (let i = 0; i < 3; i++) addFloater(220 + i * 80, 320, 0, -40);
        return;
    }
    if (S.tool === 'sponge') {
        const p = S.patches.find(q => q.dirt > 0);
        const [x, y] = p ? [p.x, p.y] : [300, 260];
        aim(x, y);
        S.lastRub = { x, y };
        if (p) { p.dirt = Math.max(0, p.dirt - .36); renderPatch(p); }
        addFoam(x - 10, y - 6); addFoam(x + 12, y + 8);
        spongeAt(x, y, 0);
        if (p && p.dirt === 0) { spawnSparkles(x, y, 4); progress(); }
        if (!p) react(animal(), 'happy');
    } else if (S.tool === 'shower') {
        const f = S.foam[0];
        const [x, y] = f ? [f.x, f.y] : [300, 200];
        aim(x, y);
        for (let i = 0; i < 14; i++) spawn('drop', x + (Math.random() - .5) * 40, y - 50 + Math.random() * 20, 0, 260, { g: 700, life: .4, r: 4, fill: '#5aa9d6' });
        rinseFoam(x, y - 40, 45, 5);
        S.patches.forEach(p => { if (p.dirt > 0 && Math.hypot(p.x - x, p.y - y) < 50) { p.dirt = Math.max(0, p.dirt - .2); renderPatch(p); } });
        S.wet = 1; S.washed = true;
        renderWet();
        soundEffect('splash');
        progress();
    } else {
        aim(300 + (Math.random() - .5) * 120, 230 + (Math.random() - .5) * 80);
        towelAt(S.pointer.x, S.pointer.y, 90);
        if (S.wet === 0) reactAt(300, 270, true);
    }
}
rub(stage, scrub, keyAction);

// ---------- Animation loop ----------
let raf = 0;
let last = 0;
function frame(t) {
    const dt = Math.min(.05, Math.max(0, (t - last) / 1000));
    last = t;
    const reduced = reducedMotion();
    const k = reduced ? 1 : Math.min(1, dt * 20);
    const dx = S.pointer.x - S.cursor.x;
    S.cursor.x += dx * k;
    S.cursor.y += (S.pointer.y - S.cursor.y) * k;
    const wobble = S.pressing && S.tool !== 'shower' && !reduced ? Math.max(-16, Math.min(16, dx * .8)) : 0;
    S.cursor.tilt += (wobble - S.cursor.tilt) * Math.min(1, dt * 10);
    placeCursor();
    if (S.coin) coinFrame(dt);
    updateMeters();
    if (S.mudRun) mudFrame(dt);
    else if (S.pressing && S.tool === 'shower' && S.down && !S.down.duck) showerFrame(dt);
    lookAndBlink(t);
    stepParticles(dt);
    stepFloaters(dt, t, reduced);
    stepDuck(dt);
    raf = requestAnimationFrame(frame);
}
function lookAndBlink(t) {
    const recent = t - S.pointer.seen < 4000;
    const tx = S.mudRun ? PUDDLE.x : recent ? S.pointer.x : S.duck.x;
    const ty = S.mudRun ? PUDDLE.y : recent ? S.pointer.y : 320;
    const vx = tx - 300, vy = ty - 152;
    const len = Math.hypot(vx, vy) || 1;
    const reach = Math.min(5.5, len / 25);
    S.pupil.x += (vx / len * reach - S.pupil.x) * .2;
    S.pupil.y += (vy / len * reach - S.pupil.y) * .2;
    stage.querySelectorAll('.pupil').forEach(p => p.setAttribute('transform', `translate(${S.pupil.x.toFixed(2)} ${S.pupil.y.toFixed(2)})`));
    if (t > S.nextBlink) {
        const a = animal();
        a?.classList.add('blink');
        setTimeout(() => a?.classList.remove('blink'), 150);
        S.nextBlink = t + (Math.random() < .2 ? 300 : 2200 + Math.random() * 3500);
    }
}
function stepParticles(dt) {
    S.particles = S.particles.filter(p => {
        p.life -= dt;
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life <= 0 || p.y > 395) { p.el.remove(); return false; }
        p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        p.el.setAttribute('opacity', Math.min(1, p.life / p.max * 2).toFixed(2));
        return true;
    });
}
function stepFloaters(dt, t, reduced) {
    const cap = reduced ? 3 : 6;
    if (t > S.nextFloater) {
        S.nextFloater = t + (reduced ? 5000 : 1300 + Math.random() * 1600);
        if (S.floaters.length < cap) addFloater(150 + Math.random() * 300, reduced ? 60 + Math.random() * 200 : 330, 0, reduced ? 0 : -24 - Math.random() * 18);
    }
    S.floaters = S.floaters.filter(b => {
        b.age += dt;
        if (!reduced) {
            b.vx *= Math.pow(.15, dt);
            b.vy += ((b.vy < -20 ? b.vy : -28) - b.vy) * Math.min(1, dt * 1.2);
            b.x = Math.max(20, Math.min(580, b.x + b.vx * dt + Math.sin(b.phase + b.age * 2) * .35));
            b.y += b.vy * dt;
        }
        if (b.y < -30 || b.age > (reduced ? 9 : 16)) { b.el.remove(); return false; }
        b.el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
        return true;
    });
}
function stepDuck(dt) {
    const d = S.duck;
    const el = $('duck');
    if (!el) return;
    const move = d.target - d.x;
    d.x += move * Math.min(1, dt * 2.2);
    if (Math.abs(move) > 2) d.facing = move > 0 ? -1 : 1;
    el.setAttribute('transform', `translate(${d.x.toFixed(1)} 322) scale(${d.facing || 1} 1)`);
    if (Math.abs(move) > 12 && Math.random() < .15) spawn('drop', d.x + (d.facing || 1) * 28, 334, (d.facing || 1) * 30, -40, { g: 200, life: .4, r: 3, fill: '#9ed8ec' });
}
function startLoop() {
    if (raf || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; S.pressing = false; S.down = null; }
    else startLoop();
});

stage.classList.add('wash-stage');
drawFriend();
init(updateUI);
startLoop();
