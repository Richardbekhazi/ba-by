import { stage, controls, palette, text, setTitle, instruction, message, button, svg, face, sky, swatches, mud, cleanMud, cleanNext, rub, bubble, celebrate, chime, init, sceneButton, playEffect, react, soundEffect } from './toddler-play.js?v=20261008-mobile1';

const vehicles = [
    { icon: '\ud83d\ude97', label: ['Car', 'Voiture'] },
    { icon: '\ud83d\ude8c', label: ['Bus', 'Bus'] },
    { icon: '\ud83d\ude9a', label: ['Truck', 'Camion'] }
];
let vehicle = 0;
let color = '#ee6374';
let patches = [];
let driving = false;
let destination = 0;
let lastRoadPlay = -Infinity;
let hasPainted = false;
let hasDriven = false;
const spots = [[190, 244], [240, 225], [294, 245], [350, 215], [395, 248], [446, 246]];
const places = [
    { name: ['Sunny meadow', 'Prairie ensoleillee'], icon: '\ud83c\udf33', ground: '#a0d796', sky: '#dff3f6' },
    { name: ['Rainbow beach', 'Plage arc-en-ciel'], icon: '\ud83c\udfd6\ufe0f', ground: '#f5d58b', sky: '#bfeafa' },
    { name: ['Twinkly evening', 'Soir etoile'], icon: '\ud83c\udf19', ground: '#9792c3', sky: '#555d9c' }
];

function roadPlay(kind) {
    if (kind === 'puddle') {
        react(stage.querySelector('#car-art'), 'hop');
        for (let i = 0; i < 6; i++) playEffect(170 + i * 48, 285, '\ud83d\udca6');
        message(['Splosh! A happy puddle jump!', 'Plouf ! Un saut dans la flaque !']);
    } else if (kind === 'friend') {
        playEffect(95, 170, '\ud83d\udc30');
        playEffect(450, 170, '\ud83d\udc4b');
        message(['Hello, little bunny! Beep beep!', 'Bonjour petit lapin ! Pouet !']);
    } else {
        for (let i = 0; i < 5; i++) playEffect(150 + i * 70, 125, ['\ud83c\udf88', '\u2b50', '\ud83d\udc97'][i % 3]);
        message(['Hooray! A rainbow parade!', 'Youpi ! Une parade coloree !']);
    }
    if (kind === 'puddle') soundEffect('splash');
    else if (kind === 'friend') soundEffect('horn');
    else chime(true);
}
function drawRoad() {
    stage.querySelectorAll('.scene-button').forEach(el => el.remove());
    const backdrop = stage.querySelector('.drive-backdrop');
    const place = places[destination];
    backdrop.innerHTML = `<rect width="600" height="285" fill="${place.sky}"/><g class="road-scenery"><path d="M-100 285Q100 135 210 280Q340 100 470 280Q550 180 700 250V380H-100Z" fill="${place.ground}"/><text x="65" y="220" font-size="65">${place.icon}</text><text x="470" y="215" font-size="65">${place.icon}</text><g class="rainbow-arch">${['#ee6374', '#f8d85b', '#58b98c', '#5b9fe4'].map((c, i) => `<path d="M${200 + i * 10} 140A${100 - i * 10} ${100 - i * 10} 0 0 1 ${400 - i * 10} 140" stroke="${c}"/>`).join('')}</g></g>`;
    if (driving) {
        sceneButton('\ud83d\udc30', ['Wave to bunny', 'Coucou lapin'], 85, 170, () => roadPlay('friend'));
        sceneButton('\ud83c\udf88', ['Balloon parade', 'Parade de ballons'], 500, 90, () => roadPlay('parade'));
        sceneButton('\ud83d\udca6', ['Splash puddle', 'Sauter dans la flaque'], 300, 337, () => roadPlay('puddle'));
    }
}

function drawCar() {
    const body = vehicle === 0
        ? `<path d="M135 266 L150 217 L207 205 L243 146 Q255 130 283 130 L355 130 Q376 130 391 151 L424 205 L464 215 Q482 222 482 243 L482 266Z" fill="${color}"/><path d="M229 202L257 151H305V202ZM321 151H352Q364 151 373 165L396 202H321Z" fill="#e4f8ff"/>`
        : vehicle === 1
            ? `<rect x="130" y="124" width="355" height="145" rx="28" fill="${color}"/><g fill="#e4f8ff"><rect x="151" y="144" width="60" height="56" rx="9"/><rect x="228" y="144" width="60" height="56" rx="9"/><rect x="305" y="144" width="60" height="56" rx="9"/><rect x="382" y="144" width="76" height="56" rx="9"/></g>`
            : `<rect x="125" y="143" width="220" height="122" rx="15" fill="${color}"/><path d="M356 170H426L479 221V265H356Z" fill="${color}"/><path d="M372 184H416L447 218H372Z" fill="#e4f8ff"/><path d="M143 165H325M143 192H325" stroke="#ffffff50" stroke-width="8"/>`;
    svg(`${sky}<g class="garage-backdrop"><rect x="65" y="30" width="470" height="274" rx="20" fill="#f5d6ae"/><rect x="91" y="65" width="418" height="228" rx="12" fill="#fff4de"/><path d="M91 104H509M91 142H509" stroke="#ead6ba" stroke-width="4"/><rect x="180" y="25" width="240" height="42" rx="16" fill="#cf7658"/><text x="300" y="55" text-anchor="middle" font-size="26" fill="white">\u2605 \u2605 \u2605</text></g>
        <g class="drive-backdrop"><path d="M0 285Q100 135 210 280Q340 100 470 280Q550 180 600 250V380H0Z" fill="#a0d796"/><g fill="#568f61"><circle cx="70" cy="206" r="36"/><circle cx="540" cy="198" r="40"/></g><path d="M70 208V286M540 200V286" stroke="#af8060" stroke-width="12"/></g>
        <rect y="285" width="600" height="95" fill="#858f9f"/><path class="road-lines" d="M0 342H600" stroke="#fff7df" stroke-width="7" stroke-dasharray="40 30"/>
        <g id="car-art"><ellipse cx="303" cy="289" rx="190" ry="18" fill="#465065" opacity=".25"/>${body}
        <path d="M141 267H475" stroke="#ffffff80" stroke-width="7" stroke-linecap="round"/>
        <g fill="#354056" stroke="#222f45" stroke-width="4"><circle cx="209" cy="272" r="34"/><circle cx="417" cy="272" r="34"/></g><g fill="#dfe7ef"><circle cx="209" cy="272" r="17"/><circle cx="417" cy="272" r="17"/></g>
        <g id="mud"></g><circle cx="467" cy="232" r="10" fill="#fff2aa"/>${face(308, 221)}</g>`);
    patches = mud(stage.querySelector('#mud'), spots);
    hasPainted = false;
    hasDriven = false;
    drawRoad();
    updateUI();
}
function progress() {
    const dirty = patches.some(p => !p.clean);
    instruction(driving ? ['Tap the bunny, balloons, and puddle!', 'Touche le lapin, les ballons et la flaque !']
        : dirty ? ['Rub the car, or tap Wash!', 'Frotte la voiture ou touche Laver !']
            : !hasPainted ? ['Pick a color for your car!', 'Choisis une couleur !']
                : ['Tap Go for a happy little drive!', 'Touche Aller pour une balade !']);
    stage.setAttribute('aria-label', text(driving ? ['Interactive road with a bunny, balloons, and puddle.', 'Route avec un lapin, des ballons et une flaque.'] : ['Toy car. Rub to wash it.', 'Voiture jouet. Frotte pour laver.']));
    message(driving ? places[destination].name
        : hasDriven ? ['Welcome back! Another ride?', 'Bon retour ! Une autre balade ?']
            : dirty ? ['Every little rub helps!', 'Chaque petit geste aide !']
                : ['Shiny and ready to play!', 'Toute propre et pr\u00eate \u00e0 jouer !']);
}
function wash(x, y) {
    if (driving) {
        if (performance.now() - lastRoadPlay > 650) {
            lastRoadPlay = performance.now();
            roadPlay(y > 285 ? 'puddle' : x < 160 ? 'friend' : 'parade');
        }
        return;
    }
    if (cleanMud(patches, x, y, 55)) { bubble(x, y); chime(); updateUI(); }
}
function washTap() {
    if (driving) return;
    cleanNext(patches, 2);
    bubble(300, 195);
    chime();
    updateUI();
}
function drive() {
    driving = !driving;
    stage.classList.toggle('driving', driving);
    if (!driving) hasDriven = true;
    drawRoad();
    chime(true);
    updateUI();
    if (!driving) celebrate();
}
function updateUI() {
    setTitle(['Little Car Garage', 'Le petit garage']);
    progress();
    controls.replaceChildren();
    palette.classList.toggle('road-picker', driving);
    if (!driving) vehicles.forEach((item, i) => {
        const el = button(item.icon, item.label, () => {
            vehicle = i;
            driving = false;
            stage.classList.remove('driving');
            drawCar();
            message(item.label, true);
        });
        el.setAttribute('aria-pressed', String(vehicle === i));
    });
    if (!driving) button('\ud83e\uddfd', ['Wash', 'Laver'], washTap);
    button('\ud83d\udcef', ['Beep beep!', 'Pouet !'], () => {
        if (driving) roadPlay('friend');
        else { soundEffect('horn'); react(stage.querySelector('#car-art')); playEffect(305, 165, '\ud83c\udfb5'); }
    });
    const go = button(driving ? '\ud83c\udfe0' : '\u25b6\ufe0f', driving ? ['Garage', 'Garage'] : ['Go!', 'Aller !'], drive);
    go.dataset.focusKey = 'drive-toggle';
    go.classList.add('primary');
    if (driving) {
        button('\ud83c\udf08', ['New road', 'Autre route'], () => { destination = (destination + 1) % places.length; drawRoad(); updateUI(); chime(true); });
        button('\ud83d\udca6', ['Splash!', 'Plouf !'], () => roadPlay('puddle'));
        button('\ud83c\udf88', ['Parade', 'Parade'], () => roadPlay('parade'));
    }
    if (driving) {
        palette.replaceChildren();
        palette.setAttribute('aria-label', text(['Choose a road', 'Choisir une route']));
        places.forEach((place, i) => {
            const el = button(place.icon, place.name, () => {
                destination = i;
                drawRoad();
                updateUI();
                chime(true);
            }, palette);
            el.setAttribute('aria-pressed', String(destination === i));
        });
    } else {
        palette.setAttribute('aria-label', text(['Car colors', 'Couleurs de voiture']));
        swatches(color, chosen => {
            color = chosen.value;
            const saved = patches.map(p => p.clean);
            const driven = hasDriven;
            drawCar();
            patches.forEach((p, i) => { if (saved[i]) { p.clean = true; p.el.remove(); } });
            hasPainted = true;
            hasDriven = driven;
            updateUI();
            message(chosen.name, true);
        });
    }
}
stage.setAttribute('role', 'group');
stage.removeAttribute('tabindex');
rub(stage, wash, () => driving ? roadPlay('parade') : washTap());
drawCar();
init(() => { drawRoad(); updateUI(); });
