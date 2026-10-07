import { stage, controls, text, setTitle, instruction, message, button, svg, face, sky, swatches, mud, cleanMud, cleanNext, rub, bubble, celebrate, chime, init } from './toddler-play.js';

const vehicles = [
    { icon: '\ud83d\ude97', label: ['Car', 'Voiture'] },
    { icon: '\ud83d\ude8c', label: ['Bus', 'Bus'] },
    { icon: '\ud83d\ude9a', label: ['Truck', 'Camion'] }
];
let vehicle = 0;
let color = '#ee6374';
let patches = [];
let driving = false;
let tripTimer;
let hasPainted = false;
let hasDriven = false;
const spots = [[190, 244], [240, 225], [294, 245], [350, 215], [395, 248], [446, 246]];

function drawCar() {
    const body = vehicle === 0
        ? `<path d="M135 266 L150 217 L207 205 L243 146 Q255 130 283 130 L355 130 Q376 130 391 151 L424 205 L464 215 Q482 222 482 243 L482 266Z" fill="${color}"/><path d="M229 202L257 151H305V202ZM321 151H352Q364 151 373 165L396 202H321Z" fill="#e4f8ff"/>`
        : vehicle === 1
            ? `<rect x="130" y="124" width="355" height="145" rx="28" fill="${color}"/><g fill="#e4f8ff"><rect x="151" y="144" width="60" height="56" rx="9"/><rect x="228" y="144" width="60" height="56" rx="9"/><rect x="305" y="144" width="60" height="56" rx="9"/><rect x="382" y="144" width="76" height="56" rx="9"/></g>`
            : `<rect x="125" y="143" width="220" height="122" rx="15" fill="${color}"/><path d="M356 170H426L479 221V265H356Z" fill="${color}"/><path d="M372 184H416L447 218H372Z" fill="#e4f8ff"/><path d="M143 165H325M143 192H325" stroke="#ffffff50" stroke-width="8"/>`;
    svg(`${sky}<g class="garage-backdrop"><rect x="65" y="30" width="470" height="274" rx="20" fill="#f5d6ae"/><rect x="91" y="65" width="418" height="228" rx="12" fill="#fff4de"/><path d="M91 104H509M91 142H509" stroke="#ead6ba" stroke-width="4"/><rect x="180" y="25" width="240" height="42" rx="16" fill="#cf7658"/><text x="300" y="55" text-anchor="middle" font-size="26" fill="white">\u2605 \u2605 \u2605</text></g>
        <g class="drive-backdrop"><path d="M0 285Q100 135 210 280Q340 100 470 280Q550 180 600 250V380H0Z" fill="#a0d796"/><g fill="#568f61"><circle cx="70" cy="206" r="36"/><circle cx="540" cy="198" r="40"/></g><path d="M70 208V286M540 200V286" stroke="#af8060" stroke-width="12"/></g>
        <rect y="285" width="600" height="95" fill="#858f9f"/><path d="M0 342H600" stroke="#fff7df" stroke-width="7" stroke-dasharray="40 30"/>
        <g id="car-art"><ellipse cx="303" cy="289" rx="190" ry="18" fill="#465065" opacity=".25"/>${body}
        <path d="M141 267H475" stroke="#ffffff80" stroke-width="7" stroke-linecap="round"/>
        <g fill="#354056" stroke="#222f45" stroke-width="4"><circle cx="209" cy="272" r="34"/><circle cx="417" cy="272" r="34"/></g><g fill="#dfe7ef"><circle cx="209" cy="272" r="17"/><circle cx="417" cy="272" r="17"/></g>
        <g id="mud"></g><circle cx="467" cy="232" r="10" fill="#fff2aa"/>${face(308, 221)}</g>`);
    patches = mud(stage.querySelector('#mud'), spots);
    hasPainted = false;
    hasDriven = false;
    updateUI();
}
function progress() {
    const dirty = patches.some(p => !p.clean);
    instruction(driving ? ['Off on a little adventure!', 'En route pour une balade !']
        : dirty ? ['Rub the car, or tap Wash!', 'Frotte la voiture ou touche Laver !']
            : !hasPainted ? ['Pick a color for your car!', 'Choisis une couleur !']
                : ['Tap Go for a happy little drive!', 'Touche Aller pour une balade !']);
    stage.setAttribute('aria-label', text(['Toy car. Rub or press space to wash it.', 'Voiture jouet. Frotte ou appuie sur espace pour laver.']));
    message(driving ? ['Wheee! A gentle ride.', 'Youpi ! Une douce balade.']
        : hasDriven ? ['Welcome back! Another ride?', 'Bon retour ! Une autre balade ?']
            : dirty ? ['Every little rub helps!', 'Chaque petit geste aide !']
                : ['Shiny and ready to play!', 'Toute propre et pr\u00eate \u00e0 jouer !']);
}
function wash(x, y) {
    if (driving) return;
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
    if (driving) return;
    driving = true;
    stage.classList.add('driving');
    chime(true);
    updateUI();
    tripTimer = setTimeout(() => {
        driving = false;
        hasDriven = true;
        stage.classList.remove('driving');
        updateUI();
        celebrate();
    }, 3000);
}
function updateUI() {
    setTitle(['Little Car Garage', 'Le petit garage']);
    progress();
    controls.replaceChildren();
    vehicles.forEach((item, i) => {
        const el = button(item.icon, item.label, () => {
            vehicle = i;
            clearTimeout(tripTimer);
            driving = false;
            stage.classList.remove('driving');
            drawCar();
            message(item.label, true);
        });
        el.setAttribute('aria-pressed', String(vehicle === i));
        el.disabled = driving;
    });
    const washButton = button('\ud83e\uddfd', ['Wash', 'Laver'], washTap);
    washButton.disabled = driving;
    button('\ud83d\udcef', ['Beep beep!', 'Pouet !'], () => { chime(true); bubble(305, 165); });
    const go = button('\u25b6\ufe0f', ['Go!', 'Aller !'], drive);
    go.classList.add('primary');
    go.disabled = driving;
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
    document.querySelectorAll('#palette button').forEach(el => { el.disabled = driving; });
}
rub(stage, wash, washTap);
drawCar();
init(updateUI);
