import { stage, controls, palette, text, setTitle, instruction, message, button, svg, node, face, celebrate, chime, init, sceneButton, playEffect, react, soundEffect, tone, unlockAudio, reducedMotion } from './toddler-play.js?v=20261028-lang';

const seeds = [
    { kind: 'flower', icon: '🌷', name: ['Flowers', 'Fleurs'] },
    { kind: 'berry', icon: '🍓', name: ['Strawberries', 'Fraises'] },
    { kind: 'carrot', icon: '🥕', name: ['Carrots', 'Carottes'] },
    { kind: 'sunflower', icon: '🌻', name: ['Sunflowers', 'Tournesols'] }
];
const ripeWords = {
    flower: ['A flower opened! Tap it to pick it.', 'Une fleur s\'ouvre ! Touche-la pour la cueillir.'],
    berry: ['Yummy strawberries! Tap them to pick.', 'Des fraises ! Touche-les pour les cueillir.'],
    carrot: ['Carrots are ready! Pull them up, up, up!', 'Les carottes sont prêtes ! Tire vers le haut !'],
    sunflower: ['A big sunflower! It looks at the sun.', 'Un grand tournesol ! Il regarde le soleil.']
};
const tools = [
    { id: 'seed', icon: '🌱', label: ['Plant', 'Planter'] },
    { id: 'water', icon: '💧', label: ['Water', 'Arroser'] },
    { id: 'pick', icon: '🧺', label: ['Pick', 'Cueillir'] }
];
const flowerColors = ['#f47fa4', '#b98ae0', '#ff9f5a', '#6fb7f0'];
const SOIL = 292;
const BASKET = { x: 528, y: 334 };
const plots = [80, 198, 316, 434].map((x, i) => ({ x, i, kind: null, growth: 0, ripe: false, berries: [false, false, false], pull: 0, wobble: 0, color: flowerColors[i], lastWorm: -Infinity }));
let selected = 0;
let tool = 'seed';
let night = false;
let basket = [];
let bunnyBusy = false;
let sunX = 505;
let pointerAt = null;
let press = null;
let droplets = [];
let flyers = [];
let clouds = [{ x: 120, y: 70, rainUntil: 0, rainAt: 0 }, { x: 360, y: 52, rainUntil: 0, rainAt: 0 }];
let bee = { x: 300, y: 150, tx: 300, ty: 150, spin: 0, visit: 0 };
let fly = { x: 150, y: 120, tx: 150, ty: 120, next: 0 };
let snail = { x: -30, hiddenUntil: 0 };
let lastDrip = -Infinity;
let lastPour = 0;
let frame = 0;
let then = 0;
let clock = 0;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const ease = v => 1 - Math.pow(1 - clamp(v, 0, 1), 2);
const plantScale = plot => (0.14 + 0.86 * ease(plot.growth)) * (1 + Math.sin(clock * 22) * 0.07 * plot.wobble);
const plantHeight = { flower: 105, berry: 55, carrot: 55, sunflower: 165 };
const berrySpots = [[-22, -14], [2, -36], [24, -12]];

function leaf(x, y, flip, size = 1) {
    const s = flip ? -size : size;
    return `<path d="M0 ${y}Q${-34 * s} ${y - 18 * size} ${-38 * s} ${y + 8 * size}Q${-18 * s} ${y + 18 * size} 0 ${y}Z" fill="#77b365" transform="translate(${x} 0)"/>`;
}
const littleFace = (y, r = 1) => `<g fill="#3d3240"><circle cx="${-4 * r}" cy="${y - 2 * r}" r="${1.9 * r}"/><circle cx="${4 * r}" cy="${y - 2 * r}" r="${1.9 * r}"/></g><path d="M${-4 * r} ${y + 3 * r}Q0 ${y + 7 * r} ${4 * r} ${y + 3 * r}" stroke="#3d3240" stroke-width="${1.6 * r}" fill="none" stroke-linecap="round"/>`;

function plantArt(plot) {
    if (plot.kind === 'flower') {
        return `<path d="M0 0V-82" stroke="#4f8f4c" stroke-width="7" stroke-linecap="round"/>${leaf(0, -30, false)}${leaf(0, -50, true)}
            <g transform="translate(0 -90)"><ellipse class="bud" rx="9" ry="13" fill="${plot.color}"/>
            <g class="bloom"><g fill="${plot.color}">${Array.from({ length: 6 }, (_, j) => `<ellipse cy="-16" rx="11" ry="17" transform="rotate(${j * 60})"/>`).join('')}</g><circle r="13" fill="#ffe58a"/>${littleFace(0)}</g></g>`;
    }
    if (plot.kind === 'berry') {
        const berries = berrySpots.map(([x, y], j) => `<g transform="translate(${x} ${y})"><circle class="bud" r="6" fill="#fff"/><g class="bloom berry ${plot.berries[j] ? 'picked' : ''}" data-berry="${j}"><path d="M0 -9Q12 -10 10 2Q6 14 0 16Q-6 14 -10 2Q-12 -10 0 -9Z" fill="#e9475e"/><path d="M-7 -9L0 -4L7 -9L3 -13H-3Z" fill="#4f8f4c"/><g fill="#ffe6ac"><circle cx="-4" cy="1" r="1.2"/><circle cx="4" cy="2" r="1.2"/><circle cx="0" cy="8" r="1.2"/></g></g></g>`).join('');
        return `<g fill="#6aa95c"><ellipse cx="-20" cy="-20" rx="22" ry="15"/><ellipse cx="20" cy="-22" rx="22" ry="15"/><ellipse cx="0" cy="-38" rx="22" ry="17"/></g><g fill="#83c46c"><ellipse cx="-6" cy="-14" rx="18" ry="12"/><ellipse cx="10" cy="-30" rx="14" ry="10"/></g>${berries}`;
    }
    if (plot.kind === 'carrot') {
        return `<g class="carrot-pull"><g stroke="#5aa04f" stroke-width="6" stroke-linecap="round" fill="none"><path d="M0 -2Q-14 -26 -22 -48"/><path d="M0 -2Q2 -30 2 -56"/><path d="M0 -2Q14 -26 24 -46"/></g>
            <g fill="#77b365"><ellipse cx="-22" cy="-48" rx="8" ry="5"/><ellipse cx="2" cy="-56" rx="8" ry="5"/><ellipse cx="24" cy="-46" rx="8" ry="5"/></g>
            <path d="M-15 -4Q0 -12 15 -4L4 62Q0 68 -4 62Z" fill="#f28a35"/><path d="M-9 14H-2M3 30H9M-6 44H0" stroke="#d26a22" stroke-width="3" stroke-linecap="round"/>${littleFace(6, 1.2)}</g>`;
    }
    const petals = Array.from({ length: 12 }, (_, j) => `<ellipse cy="-27" rx="9" ry="20" transform="rotate(${j * 30})"/>`).join('');
    return `<path d="M0 0V-140" stroke="#4f8f4c" stroke-width="9" stroke-linecap="round"/>${leaf(0, -45, false, 1.3)}${leaf(0, -85, true, 1.3)}
        <g class="sf-head" transform="translate(0 -145)"><circle class="bud" r="15" fill="#77b365"/>
        <g class="bloom"><g fill="#f7c531">${petals}</g><circle r="23" fill="#8a5a3c"/>${littleFace(0, 2)}<g fill="#f39b9c" opacity=".7"><circle cx="-13" cy="6" r="4"/><circle cx="13" cy="6" r="4"/></g></g></g>`;
}

const cloudArt = '<path d="M-58 18Q-78 -4 -48 -12Q-46 -40 -14 -32Q8 -50 30 -28Q62 -34 60 -6Q74 16 46 18Z" fill="#fff"/><g class="cloud-face">' + littleFace(0, 1.6) + '</g>';
const beeArt = `<g class="wings"><ellipse cx="-4" cy="-12" rx="7" ry="10" fill="#e8f6ff" opacity=".9"/><ellipse cx="6" cy="-13" rx="7" ry="10" fill="#e8f6ff" opacity=".9"/></g>
    <ellipse rx="15" ry="11" fill="#ffd23f"/><path d="M-5 -10V10M4 -10V10" stroke="#3b3b4f" stroke-width="4"/><circle cx="12" cy="-3" r="2.3" fill="#2d2d3a"/><path d="M9 4Q12 6 15 3" stroke="#2d2d3a" stroke-width="1.5" fill="none"/>`;
const butterflyArt = `<g class="wing-flap"><path d="M0 0Q-26 -30 -30 -8Q-30 6 0 0Q-24 10 -18 22Q-8 26 0 0" fill="#ad79d1"/><path d="M0 0Q26 -30 30 -8Q30 6 0 0Q24 10 18 22Q8 26 0 0" fill="#ad79d1"/><g fill="#f8d85b"><circle cx="-17" cy="-10" r="4"/><circle cx="17" cy="-10" r="4"/></g></g><ellipse rx="3" ry="11" fill="#3d3240"/><path d="M-1 -10Q-5 -20 -8 -21M1 -10Q5 -20 8 -21" stroke="#3d3240" stroke-width="1.5" fill="none"/>`;
const snailArt = `<g class="snail-body"><path d="M-30 0Q-34 -14 -22 -14Q-10 -14 22 0Z" fill="#c9b6a0"/><path d="M-26 -12L-32 -26M-20 -13L-22 -28" stroke="#c9b6a0" stroke-width="3" stroke-linecap="round"/><circle cx="-32" cy="-27" r="3" fill="#3d3240"/><circle cx="-22" cy="-29" r="3" fill="#3d3240"/></g>
    <circle cx="2" cy="-14" r="16" fill="#e7a35c"/><path d="M2 -14m-10 0a10 10 0 1 1 10 10a6 6 0 1 1 -6 -6a3 3 0 1 1 3 3" stroke="#b46e33" stroke-width="3" fill="none"/>`;
const birdArt = `<path d="M-6 6Q-30 4 -30 -6L-10 -2Z" fill="#4b86c9"/><ellipse rx="18" ry="16" fill="#5b9fe4"/><circle cx="10" cy="-12" r="11" fill="#5b9fe4"/><ellipse cx="2" cy="4" rx="10" ry="8" fill="#a9d1f5"/>
    <path d="M20 -13L30 -10L20 -7Z" fill="#f4ab45"/><circle class="eye-open" cx="13" cy="-14" r="2.4" fill="#2d2d3a"/><path class="eye-closed" d="M10 -14Q13 -11 16 -14" stroke="#2d2d3a" stroke-width="2" fill="none"/>
    <path d="M-4 15V22M4 15V22" stroke="#f4ab45" stroke-width="3"/><text class="zzz" x="18" y="-26" font-size="16" fill="#fff">z z</text>`;
const bunnyArt = `<ellipse cx="-10" cy="-58" rx="7" ry="22" fill="#e9e3f3" transform="rotate(-10 -10 -58)"/><ellipse cx="10" cy="-58" rx="7" ry="22" fill="#e9e3f3" transform="rotate(10 10 -58)"/>
    <ellipse cx="0" cy="-8" rx="24" ry="22" fill="#e9e3f3"/><circle cx="0" cy="-36" r="19" fill="#e9e3f3"/>${littleFace(-36, 1.5)}<ellipse cx="0" cy="-30" rx="3" ry="2" fill="#f39b9c"/><circle cx="22" cy="-4" r="7" fill="#fff"/>`;
const canArt = '<g class="can"><path d="M-14 -6L-44 -18L-46 -12L-16 4Z" fill="#5b9fe4"/><rect x="-18" y="-22" width="44" height="36" rx="9" fill="#6fb7e8"/><path d="M-6 -22Q8 -44 22 -22" stroke="#5b9fe4" stroke-width="6" fill="none"/><ellipse cx="-46" cy="-15" rx="4" ry="7" fill="#4b86c9"/></g>';
const sackArt = '<path d="M-18 -14Q-22 18 0 18Q22 18 18 -14Q10 -20 0 -18Q-10 -20 -18 -14Z" fill="#d9b382"/><path d="M-12 -16Q0 -26 12 -16" stroke="#a87a4c" stroke-width="4" fill="none"/><g fill="#7a5233"><ellipse cx="-6" cy="2" rx="3" ry="4"/><ellipse cx="6" cy="6" rx="3" ry="4"/><ellipse cx="0" cy="-4" rx="3" ry="4"/></g>';
const handArt = '<text x="0" y="12" font-size="40" text-anchor="middle">🖐️</text>';

function drawGarden() {
    const stars = Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 97) % 600 + 10}" cy="${20 + (i * 53) % 150}" r="${1.5 + i % 3}"/>`).join('');
    const fireflies = Array.from({ length: 9 }, (_, i) => `<circle class="firefly" cx="${40 + i * 64}" cy="${150 + (i * 37) % 110}" r="4" style="animation-delay:${(i * .37) % 2}s"/>`).join('');
    svg(`<defs><clipPath id="above-soil"><rect x="0" y="-200" width="600" height="${SOIL + 200}"/></clipPath>
            <radialGradient id="sun-glow"><stop offset="0" stop-color="#fff3a8" stop-opacity=".9"/><stop offset="1" stop-color="#fff3a8" stop-opacity="0"/></radialGradient></defs>
        <rect class="sky-fill" width="600" height="380"/><g class="stars" fill="#fff8d6">${stars}</g>
        <g id="sun"><circle class="sun-glow" r="80" fill="url(#sun-glow)"/><g class="sun-rays" stroke="#ffcf4a" stroke-width="7" stroke-linecap="round">${Array.from({ length: 10 }, (_, i) => `<path d="M0 -52V-64" transform="rotate(${i * 36})"/>`).join('')}</g><circle r="42" fill="#ffd56a"/>${face(0, -10)}</g>
        <g id="moon"><circle r="34" fill="#fff4c4"/><circle cx="14" cy="-8" r="30" class="moon-bite"/><g fill="#3d3240"><path d="M-22 -4Q-17 0 -12 -4" stroke="#3d3240" stroke-width="2.5" fill="none"/></g></g>
        ${clouds.map((_, i) => `<g id="cloud-${i}" class="cloud">${cloudArt}</g>`).join('')}
        <path class="hill-back" d="M0 230Q120 170 260 220Q420 160 600 215V380H0Z"/>
        <g class="fence"><path d="M0 238H600M0 258H600" stroke-width="7"/>${Array.from({ length: 11 }, (_, i) => `<path d="M${10 + i * 60} 222V270" stroke-width="12" stroke-linecap="round"/>`).join('')}</g>
        <g id="bird" transform="translate(32 216)"><g class="bird-inner">${birdArt}</g></g>
        <rect class="grass" y="262" width="600" height="118"/>
        <g id="plots">${plots.map(p => `<g class="plot" id="plot-${p.i}"><ellipse cx="${p.x}" cy="${SOIL}" rx="54" ry="15" fill="#7a5233"/>
            <g clip-path="url(#above-soil)"><g class="plant"></g></g><path d="M${p.x - 54} ${SOIL}Q${p.x} ${SOIL + 30} ${p.x + 54} ${SOIL}Q${p.x} ${SOIL + 12} ${p.x - 54} ${SOIL}Z" fill="#9c6b48"/></g>`).join('')}</g>
        <g id="worms"></g>
        <g id="basket" transform="translate(${BASKET.x} ${BASKET.y})"><g class="basket-inner"><text class="basket-row" y="-14" text-anchor="middle" font-size="20"></text><text class="basket-row" y="2" text-anchor="middle" font-size="20"></text>
            <path d="M-46 -4H46L36 34H-36Z" fill="#dfaa6f"/><path d="M-40 8H40M-36 20H36" stroke="#c88d52" stroke-width="4"/><path d="M-38 -4Q0 -56 38 -4" stroke="#c88d52" stroke-width="6" fill="none"/></g></g>
        <g id="bunny" transform="translate(588 352)"><g class="bunny-inner">${bunnyArt}</g></g>
        <g id="snail" transform="translate(-30 368)"><g class="snail-inner">${snailArt}</g></g>
        <g id="drops" fill="#5fb3e6"></g>
        <g id="butterfly" transform="translate(150 120)">${butterflyArt}</g>
        <g id="bee" transform="translate(300 150)"><g class="bee-inner">${beeArt}</g></g>
        <g class="fireflies" fill="#fff59a">${fireflies}</g>
        <g id="flyers"></g>
        <g id="cursor" opacity="0"></g>`);
    plots.forEach(renderPlant);
    renderBasket();
    drawCursor();
    stage.classList.toggle('night', night);
    keyButtons();
}
function renderPlant(plot) {
    const el = stage.querySelector(`#plot-${plot.i} .plant`);
    el.innerHTML = plot.kind ? plantArt(plot) : '';
    el.classList.toggle('ripe', plot.ripe);
    el.classList.toggle('budding', plot.growth >= .65);
}
function renderBasket() {
    const rows = stage.querySelectorAll('.basket-row');
    rows[0].textContent = basket.slice(0, 3).join('');
    rows[1].textContent = basket.slice(3, 6).join('');
}
function drawCursor() {
    const el = stage.querySelector('#cursor');
    if (el) el.innerHTML = tool === 'water' ? canArt : tool === 'seed' ? sackArt : handArt;
}

function plant(plot) {
    const seed = seeds[selected];
    plot.kind = seed.kind;
    plot.growth = .02;
    plot.ripe = false;
    plot.berries = [false, false, false];
    plot.pull = 0;
    plot.wobble = 1;
    plot.color = flowerColors[(flowerColors.indexOf(plot.color) + 1) % flowerColors.length];
    renderPlant(plot);
    playEffect(plot.x, SOIL - 40, '🌱');
    soundEffect('pop');
    message(['A tiny seed! Give it some water.', 'Une petite graine ! Donne-lui de l\'eau.']);
    suggest();
}
function grow(plot, amount) {
    if (!plot.kind || plot.ripe) return;
    const before = plot.growth;
    plot.growth = Math.min(1, plot.growth + amount);
    plot.wobble = Math.max(plot.wobble, .5);
    if (before < .65 && plot.growth >= .65) renderPlant(plot);
    if (plot.growth >= 1) ripen(plot);
}
function ripen(plot) {
    plot.ripe = true;
    plot.wobble = 1;
    renderPlant(plot);
    soundEffect('sparkle');
    celebrate(plot.x, SOIL - plantHeight[plot.kind] - 10);
    message(ripeWords[plot.kind], true);
    suggest();
}
function emptyPlot(plot) {
    plot.kind = null;
    plot.growth = 0;
    plot.ripe = false;
    plot.pull = 0;
    renderPlant(plot);
    suggest();
}
function flyToBasket(icon, x, y) {
    const el = node('text', { 'font-size': 30, 'text-anchor': 'middle' }, stage.querySelector('#flyers'));
    el.textContent = icon;
    flyers.push({ el, icon, x, y, t: 0 });
    soundEffect('whoosh');
}
function harvest(plot, x, y) {
    if (plot.kind === 'berry') {
        let j = plot.berries.findIndex(b => !b);
        if (x !== undefined) {
            const open = berrySpots.map((spot, k) => ({ k, d: Math.hypot(plot.x + spot[0] - x, SOIL + spot[1] - y) })).filter(b => !plot.berries[b.k]);
            if (open.length) j = open.sort((a, b) => a.d - b.d)[0].k;
        }
        plot.berries[j] = true;
        stage.querySelector(`#plot-${plot.i} [data-berry="${j}"]`)?.classList.add('picked');
        flyToBasket('🍓', plot.x + berrySpots[j][0], SOIL + berrySpots[j][1]);
        if (plot.berries.every(Boolean)) {
            plot.ripe = false;
            plot.growth = .7;
            plot.berries = [false, false, false];
            setTimeout(() => renderPlant(plot), 500);
            message(['All picked! Water the bush for more berries.', 'Tout cueilli ! Arrose pour d\'autres fraises.']);
            suggest();
        } else message(['Pick, pick! Into the basket!', 'Hop ! Dans le panier !']);
        return;
    }
    const top = SOIL - plantHeight[plot.kind];
    flyToBasket(seeds.find(s => s.kind === plot.kind).icon, plot.x, plot.kind === 'carrot' ? SOIL - 30 : top);
    if (plot.kind === 'flower') for (let k = 0; k < 3; k++) playEffect(plot.x - 30 + k * 30, top, '🌸');
    if (plot.kind === 'carrot') { soundEffect('boing'); playEffect(plot.x, SOIL - 50, '💥'); message(['POP! What a big carrot!', 'POP ! Quelle grosse carotte !'], true); }
    else message(['Into the basket! Plant another seed!', 'Dans le panier ! Plante une autre graine !']);
    emptyPlot(plot);
}
function addToBasket(icon) {
    basket.push(icon);
    renderBasket();
    react(stage.querySelector('.basket-inner'), 'hop');
    soundEffect('pop');
    if (basket.length >= 6 && !bunnyBusy) bunnyVisit();
}
function bunnyVisit() {
    bunnyBusy = true;
    const bunny = stage.querySelector('.bunny-inner');
    bunny.classList.add('visiting');
    message(['Hop, hop! Bunny is hungry!', 'Hop, hop ! Le lapin a faim !'], true);
    [1300, 1900, 2500, 3100].forEach((delay, k) => setTimeout(() => {
        soundEffect('munch');
        basket.splice(0, k === 3 ? basket.length : 2);
        renderBasket();
        playEffect(570, 290, k === 3 ? '💗' : '😋');
    }, delay));
    setTimeout(() => {
        stage.querySelector('.bunny-inner')?.classList.remove('visiting');
        bunnyBusy = false;
        message(['Thank you! Bunny is full and happy.', 'Merci ! Le lapin est content.'], true);
    }, 4600);
}
function wormPeek(x) {
    const plot = plots.find(p => Math.abs(p.x - x) < 56);
    if (plot) {
        if (clock - plot.lastWorm < 2.5) return;
        plot.lastWorm = clock;
    }
    if (stage.querySelectorAll('.worm').length >= 3) return;
    const el = node('g', { class: 'worm', transform: `translate(${clamp(x, 20, 580)} ${SOIL + 6})` }, stage.querySelector('#worms'));
    el.innerHTML = `<g class="worm-inner"><path d="M0 0Q-4 -20 4 -34" stroke="#f2a0a8" stroke-width="13" fill="none" stroke-linecap="round"/><g transform="translate(5 -34)">${littleFace(0, 1.1)}</g></g>`;
    soundEffect('giggle');
    message(['A wiggly worm says hello!', 'Un petit ver dit bonjour !']);
    setTimeout(() => el.remove(), 2200);
}
function sunshine() {
    if (night) { toggleNight(); return; }
    const sun = stage.querySelector('#sun');
    sun.classList.remove('beaming');
    void sun.getBoundingClientRect();
    sun.classList.add('beaming');
    plots.forEach(p => grow(p, .2));
    soundEffect('sparkle');
    message(['Warm sunshine! The plants stretch up.', 'Un beau soleil ! Les plantes s\'étirent.']);
}
function rain(cloud) {
    cloud.rainUntil = clock + 3;
    soundEffect('splash');
    message(['Pitter-patter, little rain!', 'Ploc, ploc, petite pluie !']);
}
function sing() {
    const bird = stage.querySelector('.bird-inner');
    react(bird, 'hop');
    if (night) { message(['Shh... the bird is sleeping.', 'Chut... l\'oiseau dort.']); playEffect(50, 180, '💤'); return; }
    tone([784, 988, 1175, 988, 1319], 'sine', 1.05);
    playEffect(55, 170, '🎵');
    playEffect(85, 150, '🎶');
    message(['Tweet tweet! A song for your garden!', 'Cui-cui ! Une chanson pour ton jardin !']);
}
function buzz() {
    bee.spin = 1;
    soundEffect('flutter');
    message(['Bzzz! Busy bee does a loop!', 'Bzzz ! L\'abeille fait un looping !']);
}
function flutterAway() {
    fly.next = 0;
    soundEffect('flutter');
    message(['Flutter, flutter! Off it goes!', 'Flap, flap ! Le papillon s\'envole !']);
}
function snailHide() {
    snail.hiddenUntil = clock + 2.5;
    stage.querySelector('.snail-inner').classList.add('hiding');
    soundEffect('squeak');
    message(['Peekaboo, little snail!', 'Coucou, petit escargot !']);
}
function toggleNight() {
    night = !night;
    stage.classList.toggle('night', night);
    tone(night ? [784, 659, 523] : [523, 659, 784]);
    message(night ? ['Goodnight, garden! Look at the fireflies.', 'Bonne nuit, jardin ! Regarde les lucioles.'] : ['Good morning, garden!', 'Bonjour, jardin !'], true);
    updateUI();
}

function plotAt(x, y) {
    return plots.find(p => Math.abs(p.x - x) < 56 && y < SOIL + 30
        && y > SOIL - (p.kind ? plantHeight[p.kind] * plantScale(p) + 35 : 45));
}
function tapPlot(plot, x, y, canPull) {
    if (!plot.kind) { plant(plot); return; }
    if (plot.ripe) {
        if (plot.kind === 'carrot' && canPull) {
            press.carrot = plot;
            message(['Hold on and pull up, up, up!', 'Tiens bien et tire vers le haut !']);
            return;
        }
        harvest(plot, x, y);
        return;
    }
    react(stage.querySelector(`#plot-${plot.i}`), 'wiggle');
    soundEffect('giggle');
    message(['Water me, please! I want to grow!', 'Arrose-moi ! Je veux grandir !']);
}
function keyAct(plot) {
    if (tool !== 'water') { tapPlot(plot); return; }
    if (!plot.kind) { wormPeek(plot.x); return; }
    for (let k = 0; k < 8; k++) droplets.push(makeDrop(plot.x - 28 + k * 8, SOIL - 150 - k * 6, true));
    grow(plot, .3);
    soundEffect('drip');
    message(['Glug, glug! A big drink!', 'Glou, glou ! Une bonne gorgée !']);
}
function makeDrop(x, y, quiet = false) {
    const el = node('path', { d: 'M0 -6Q5 2 0 5Q-5 2 0 -6Z' }, stage.querySelector('#drops'));
    return { x, y, vy: 60, el, quiet };
}
function down(p) {
    if (Math.hypot(p.x - bee.x, p.y - bee.y) < 30) { buzz(); return; }
    if (Math.hypot(p.x - fly.x, p.y - fly.y) < 30) { flutterAway(); return; }
    if (Math.hypot(p.x - 32, p.y - 216) < 36) { sing(); return; }
    if (Math.hypot(p.x - snail.x, p.y - 355) < 30) { snailHide(); return; }
    if (Math.hypot(p.x - sunX, p.y - 62) < 50) {
        if (night) { stage.classList.add('twinkle'); setTimeout(() => stage.classList.remove('twinkle'), 1200); soundEffect('sparkle'); message(['Twinkle, twinkle, little stars!', 'Brille, brille, petites étoiles !']); return; }
        press.sun = true;
        return;
    }
    const cloud = clouds.find(c => Math.abs(p.x - c.x) < 62 && Math.abs(p.y - c.y) < 36);
    if (cloud) { rain(cloud); return; }
    if (Math.hypot(p.x - BASKET.x, p.y - BASKET.y) < 48) {
        react(stage.querySelector('.basket-inner'), 'hop');
        soundEffect('boing');
        message(basket.length ? ['Look at your yummy basket!', 'Regarde ton joli panier !'] : ['An empty basket. Let\'s fill it up!', 'Un panier vide. Remplissons-le !']);
        return;
    }
    if (tool === 'water') return;
    const plot = plotAt(p.x, p.y);
    if (plot) tapPlot(plot, p.x, p.y, true);
    else if (p.y > SOIL - 5) wormPeek(p.x);
    else { playEffect(p.x, p.y, '✨'); soundEffect('pop'); }
}
function move(p) {
    press.moved = Math.max(press.moved, Math.hypot(p.x - press.x, p.y - press.y));
    if (press.sun) sunX = clamp(p.x, 50, 550);
    const plot = press.carrot;
    if (!plot) return;
    const before = plot.pull;
    plot.pull = clamp(press.y - p.y, 0, 70);
    if (before < 25 && plot.pull >= 25) soundEffect('squeak');
    if (plot.pull > 52) { press.carrot = null; harvest(plot); }
}
function up() {
    if (press.sun && press.moved < 10) sunshine();
    else if (press.sun) message(['The sunflowers follow the sun!', 'Les tournesols suivent le soleil !']);
    if (press.carrot) { soundEffect('boing'); message(['Boing! Pull harder, up, up!', 'Boing ! Tire plus fort vers le haut !']); }
    press = null;
}
function scenePoint(event) {
    const matrix = stage.querySelector('svg')?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
}
stage.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || press || !event.isPrimary || event.button !== 0) return;
    const p = scenePoint(event);
    if (!p) return;
    event.preventDefault();
    unlockAudio();
    press = { id: event.pointerId, x: p.x, y: p.y, moved: 0, carrot: null, sun: false };
    pointerAt = { x: p.x, y: p.y, type: event.pointerType };
    stage.setPointerCapture(event.pointerId);
    down(p);
});
stage.addEventListener('pointermove', event => {
    const p = scenePoint(event);
    if (!p) return;
    pointerAt = { x: p.x, y: p.y, type: event.pointerType };
    if (press && event.pointerId === press.id) { event.preventDefault(); move(p); }
});
const release = event => {
    if (!press || event.pointerId !== press.id) return;
    if (stage.hasPointerCapture(press.id)) stage.releasePointerCapture(press.id);
    up();
    if (event.pointerType !== 'mouse') pointerAt = null;
};
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => stage.addEventListener(type, release));
stage.addEventListener('pointerleave', event => { if (!press && event.pointerType === 'mouse') pointerAt = null; });
window.addEventListener('blur', () => { if (press) release({ pointerId: press.id }); });

function bloomSpot(plot) {
    const s = plantScale(plot);
    return { x: plot.x, y: SOIL - (plot.kind === 'sunflower' ? 145 : plot.kind === 'flower' ? 90 : 40) * s - 18 };
}
function loop(now) {
    frame = requestAnimationFrame(loop);
    const dt = Math.min(.05, then ? (now - then) / 1000 : 0);
    then = now;
    clock += dt;
    const calm = reducedMotion();
    if (!stage.querySelector('#drops')) return;
    const pouring = press && tool === 'water' && !press.sun && pointerAt;
    if (pouring && clock - lastPour > .05 && droplets.length < 60) {
        lastPour = clock;
        droplets.push(makeDrop(pointerAt.x - 23 + (Math.random() - .5) * 10, pointerAt.y - 31));
    }
    clouds.forEach((cloud, i) => {
        if (!calm) cloud.x += dt * (4 + i * 2);
        if (cloud.x > 690) cloud.x = -90;
        const raining = cloud.rainUntil > clock;
        if (raining && clock - cloud.rainAt > .07 && droplets.length < 60) {
            cloud.rainAt = clock;
            droplets.push(makeDrop(cloud.x + (Math.random() - .5) * 90, cloud.y + 18));
        }
        const el = stage.querySelector(`#cloud-${i}`);
        el.setAttribute('transform', `translate(${cloud.x.toFixed(1)} ${cloud.y})`);
        el.classList.toggle('raining', raining);
    });
    droplets = droplets.filter(drop => {
        drop.vy += 700 * dt;
        drop.y += drop.vy * dt;
        if (drop.y < SOIL) { drop.el.setAttribute('transform', `translate(${drop.x.toFixed(1)} ${drop.y.toFixed(1)})`); return true; }
        drop.el.remove();
        const plot = plots.find(p => Math.abs(p.x - drop.x) < 56);
        if (plot && plot.kind) grow(plot, drop.quiet ? 0 : .013);
        else if (plot && pouring && Math.random() < .08) wormPeek(plot.x);
        return false;
    });
    if (pouring && clock - lastDrip > .4) { lastDrip = clock; soundEffect('drip'); }
    plots.forEach(plot => {
        if (!plot.kind) return;
        const el = stage.querySelector(`#plot-${plot.i} .plant`);
        const sway = calm ? 0 : Math.sin(clock * 1.6 + plot.i) * 2.5 * plot.growth;
        plot.wobble = Math.max(0, plot.wobble - dt * 1.5);
        el.setAttribute('transform', `translate(${plot.x} ${SOIL}) rotate(${sway.toFixed(2)}) scale(${plantScale(plot).toFixed(3)})`);
        if (plot.kind === 'carrot') {
            if (!press || press.carrot !== plot) plot.pull -= plot.pull * Math.min(1, dt * 12);
            el.querySelector('.carrot-pull')?.setAttribute('transform', `translate(0 ${(-plot.pull).toFixed(1)})`);
        }
        if (plot.kind === 'sunflower') {
            const angle = clamp((sunX - plot.x) / 10, -30, 30);
            el.querySelector('.sf-head')?.setAttribute('transform', `translate(0 -145) rotate(${angle.toFixed(1)})`);
        }
    });
    stage.querySelector('#sun').setAttribute('transform', `translate(${sunX} 62)`);
    stage.querySelector('#moon').setAttribute('transform', `translate(${sunX} 62)`);
    const blooms = plots.filter(p => p.ripe && (p.kind === 'flower' || p.kind === 'sunflower'));
    if (clock > bee.visit) {
        bee.visit = clock + 3.5;
        bee.target = blooms.length ? bloomSpot(blooms[Math.floor(Math.random() * blooms.length)]) : null;
    }
    const goal = bee.target || { x: 300 + Math.sin(clock * .45) * 220, y: 150 + Math.sin(clock * 1.3) * 45 };
    const speed = calm ? 0 : Math.min(1, dt * 2);
    const beeDx = goal.x - bee.x;
    bee.x += beeDx * speed;
    bee.y += (goal.y + Math.sin(clock * 6) * 6 - bee.y) * speed;
    bee.spin = Math.max(0, bee.spin - dt);
    stage.querySelector('#bee').setAttribute('transform', `translate(${bee.x.toFixed(1)} ${bee.y.toFixed(1)}) rotate(${(bee.spin * 720).toFixed(0)}) scale(${beeDx < -2 ? -1 : 1} 1)`);
    if (clock > fly.next) {
        fly.next = clock + 5;
        const flowers = blooms.filter(p => p.kind === 'flower');
        const target = flowers.length && Math.random() < .7 ? bloomSpot(flowers[Math.floor(Math.random() * flowers.length)]) : { x: 60 + Math.random() * 480, y: 90 + Math.random() * 100 };
        fly.tx = target.x;
        fly.ty = target.y - 6;
    }
    fly.x += (fly.tx - fly.x) * speed * .8;
    fly.y += (fly.ty + Math.sin(clock * 3) * 10 - fly.y) * speed * .8;
    stage.querySelector('#butterfly').setAttribute('transform', `translate(${fly.x.toFixed(1)} ${fly.y.toFixed(1)})`);
    if (snail.hiddenUntil < clock) {
        stage.querySelector('.snail-inner').classList.remove('hiding');
        if (!calm) snail.x += dt * 7;
    }
    if (snail.x > 640) snail.x = -40;
    stage.querySelector('#snail').setAttribute('transform', `translate(${snail.x.toFixed(1)} 368)`);
    flyers = flyers.filter(f => {
        f.t += dt / .75;
        const t = Math.min(1, f.t);
        const cx = (f.x + BASKET.x) / 2;
        const cy = Math.min(f.y, BASKET.y) - 110;
        f.el.setAttribute('x', ((1 - t) * (1 - t) * f.x + 2 * (1 - t) * t * cx + t * t * BASKET.x).toFixed(1));
        f.el.setAttribute('y', ((1 - t) * (1 - t) * f.y + 2 * (1 - t) * t * cy + t * t * (BASKET.y - 10)).toFixed(1));
        if (t < 1) return true;
        f.el.remove();
        addToBasket(f.icon);
        return false;
    });
    const cursor = stage.querySelector('#cursor');
    const showCursor = pointerAt && (press || pointerAt.type === 'mouse');
    cursor.setAttribute('opacity', showCursor ? 1 : 0);
    if (showCursor) {
        const offset = tool === 'water' ? [20, -40] : [0, -34];
        cursor.setAttribute('transform', `translate(${(pointerAt.x + offset[0]).toFixed(1)} ${(pointerAt.y + offset[1]).toFixed(1)}) rotate(${pouring ? -30 : 0})`);
    }
}
function suggest() {
    const next = plots.some(p => p.ripe) ? 'pick' : plots.some(p => p.kind) ? 'water' : 'seed';
    controls.querySelectorAll('[data-tool]').forEach(el => el.classList.toggle('suggest', el.dataset.tool === next && next !== tool));
}
function keyButtons() {
    stage.querySelectorAll('.scene-button').forEach(el => el.remove());
    const names = [['left', 'gauche'], ['second', 'deuxième'], ['third', 'troisième'], ['right', 'droit']];
    plots.forEach((plot, i) => sceneButton('🪴', [`Garden bed: ${names[i][0]}`, `Carré de jardin ${names[i][1]}`], plot.x, 322, () => keyAct(plot)).classList.add('garden-key'));
    sceneButton('🌧️', ['Make it rain', 'Faire pleuvoir'], 150, 60, () => rain(clouds.reduce((a, b) => Math.abs(a.x - 300) < Math.abs(b.x - 300) ? a : b))).classList.add('garden-key');
    sceneButton('🐦', ['Bird song', 'Chant d\'oiseau'], 32, 216, sing).classList.add('garden-key');
    sceneButton('🐌', ['Say hi to the snail', 'Coucou l\'escargot'], 300, 350, snailHide).classList.add('garden-key');
}
function updateUI() {
    setTitle(['My Tiny Garden', 'Mon petit jardin']);
    instruction(tool === 'water' ? ['Hold the watering can over a plant!', 'Tiens l\'arrosoir au-dessus d\'une plante !']
        : tool === 'pick' ? ['Tap the fruit to pick it. Pull carrots up!', 'Touche les fruits. Tire les carottes vers le haut !']
            : ['Tap the soil to plant a seed!', 'Touche la terre pour planter une graine !']);
    stage.setAttribute('aria-label', text(['Garden with four beds, a sun, clouds, a bird, a bee, and a snail.', 'Jardin avec quatre carrés, un soleil, des nuages, un oiseau, une abeille et un escargot.']));
    controls.replaceChildren();
    palette.replaceChildren();
    tools.forEach(item => {
        const el = button(item.icon, item.label, () => { tool = item.id; drawCursor(); updateUI(); chime(); });
        el.dataset.tool = item.id;
        el.setAttribute('aria-pressed', String(tool === item.id));
    });
    button('☀️', ['Sunshine', 'Soleil'], () => { if (night) toggleNight(); sunshine(); });
    button(night ? '🌅' : '🌙', night ? ['Morning', 'Matin'] : ['Night', 'Nuit'], toggleNight).dataset.focusKey = 'night-toggle';
    seeds.forEach((seed, i) => {
        const el = button(seed.icon, seed.name, () => {
            selected = i;
            tool = 'seed';
            drawCursor();
            updateUI();
            const empty = plots.find(p => !p.kind);
            if (empty) plant(empty);
            else message(['The beds are full! Pick something to make room.', 'Tout est planté ! Cueille pour faire de la place.']);
        }, palette);
        el.setAttribute('aria-pressed', String(selected === i));
    });
    keyButtons();
    suggest();
}
stage.setAttribute('role', 'group');
drawGarden();
document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else if (!frame) { then = 0; frame = requestAnimationFrame(loop); }
});
frame = requestAnimationFrame(loop);
init(() => { updateUI(); message(['A garden full of little surprises!', 'Un jardin plein de petites surprises !']); });
