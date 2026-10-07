import { stage, controls, palette, text, setTitle, instruction, message, button, svg, face, sky, celebrate, chime, init } from './toddler-play.js';

const seeds = [
    { icon: '\ud83c\udf3c', name: ['Flowers', 'Fleurs'], kind: 'flower', color: '#f7cf57' },
    { icon: '\ud83c\udf53', name: ['Strawberries', 'Fraises'], kind: 'berry', color: '#ec6377' },
    { icon: '\ud83c\udf3b', name: ['Sunflowers', 'Tournesols'], kind: 'sunflower', color: '#f4b644' }
];
const prompts = [
    ['Choose a seed to plant!', 'Choisis une graine !'],
    ['Give your seeds a little water!', 'Donne un peu d\'eau aux graines !'],
    ['Bring out the warm sunshine!', 'Fais venir le soleil !'],
    ['They grew! Tap Pick!', '\u00c7a pousse ! Touche Cueillir !']
];
let selected = 0;
let growth = 0;
let harvested = false;

function plant(x, y, i) {
    const seed = seeds[selected];
    if (growth === 0) return `<ellipse cx="${x}" cy="${y}" rx="32" ry="7" fill="#744d37" opacity=".4"/>`;
    if (growth === 1) return `<ellipse cx="${x}" cy="${y - 5}" rx="11" ry="7" fill="#eac89b" transform="rotate(-20 ${x} ${y - 5})"/>`;
    const height = growth === 2 ? 43 : 104 + (i === 1 ? 22 : 0);
    const top = y - height;
    const leaves = `<path d="M${x} ${y}V${top}" stroke="#548c52" stroke-width="9" stroke-linecap="round"/><path d="M${x} ${top + 35}Q${x - 52} ${top + 5} ${x - 44} ${top + 41}Q${x - 15} ${top + 63} ${x} ${top + 35}M${x} ${top + 50}Q${x + 49} ${top + 17} ${x + 46} ${top + 51}Q${x + 19} ${top + 75} ${x} ${top + 50}" fill="#77b365"/>`;
    if (growth === 2) return `<g class="plant-pop">${leaves}</g>`;
    const bloom = seed.kind === 'berry'
        ? `<path d="M${x - 29} ${top}Q${x} ${top - 21} ${x + 29} ${top}Q${x + 32} ${top + 32} ${x} ${top + 53}Q${x - 32} ${top + 32} ${x - 29} ${top}Z" fill="${seed.color}"/><path d="M${x - 23} ${top - 5}L${x - 10} ${top + 10}L${x} ${top}L${x + 11} ${top + 10}L${x + 24} ${top - 5}Z" fill="#548c52"/><g fill="#ffe6ac"><ellipse cx="${x - 13}" cy="${top + 19}" rx="2" ry="4"/><ellipse cx="${x + 12}" cy="${top + 19}" rx="2" ry="4"/><ellipse cx="${x}" cy="${top + 37}" rx="2" ry="4"/></g>`
        : `<g fill="${seed.color}">${Array.from({ length: 8 }, (_, j) => `<ellipse cx="${x}" cy="${top - 28}" rx="16" ry="26" transform="rotate(${j * 45} ${x} ${top})"/>`).join('')}</g><circle cx="${x}" cy="${top}" r="26" fill="${seed.kind === 'sunflower' ? '#9c6845' : '#fff3b3'}"/>`;
    return `<g class="plant-pop">${leaves}${bloom}</g>`;
}
function drawGarden() {
    svg(`${sky}<circle cx="495" cy="66" r="42" fill="${growth >= 3 ? '#ffd56a' : '#fff0b9'}"/>${face(495, 56)}
        <path d="M0 278Q135 196 270 269Q452 187 600 277V380H0Z" fill="#b0d893"/><rect y="305" width="600" height="75" fill="#91bb75"/>
        <path d="M25 287H575M25 310H575" stroke="#fff4dc" stroke-width="9"/><g stroke="#fff4dc" stroke-width="12"><path d="M40 260V330M100 260V330M500 260V330M560 260V330"/></g>
        ${[155, 300, 445].map((x, i) => `<ellipse cx="${x}" cy="353" rx="58" ry="10" fill="#69804d" opacity=".2"/><path d="M${x - 49} 292H${x + 49}L${x + 35} 351H${x - 35}Z" fill="#d98d65"/><rect x="${x - 54}" y="282" width="108" height="20" rx="8" fill="#e9a681"/><ellipse cx="${x}" cy="284" rx="46" ry="8" fill="#976c4b"/>${plant(x, 284, i)}`).join('')}
        ${growth === 2 ? '<g class="water" style="opacity:1" fill="#73b8df"><path d="M130 174Q115 195 130 202Q145 195 130 174M280 161Q265 184 280 190Q295 184 280 161M437 170Q422 193 437 199Q452 193 437 170"/></g>' : ''}
        ${growth === 3 ? '<g transform="translate(65 150)"><g class="butterfly"><ellipse cx="-12" cy="0" rx="16" ry="23" fill="#ad84d3"/><ellipse cx="12" cy="0" rx="16" ry="23" fill="#f2a9bb"/><rect x="-3" y="-15" width="6" height="35" rx="3" fill="#665479"/></g></g>' : ''}
        ${harvested ? `<rect x="242" y="229" width="116" height="40" rx="14" fill="#dfaa6f"/><path d="M255 238Q300 187 345 238" fill="none" stroke="#c09262" stroke-width="9"/><text x="300" y="255" text-anchor="middle" font-size="35">${seeds[selected].icon}${seeds[selected].icon}</text>` : ''}`);
    updateUI();
}
function advance(action) {
    if (growth === 0) { growth = 1; harvested = false; }
    else if (growth === 1 && action === 'water') growth = 2;
    else if (growth === 2 && action === 'sun') growth = 3;
    else if (growth === 3 && action === 'pick') {
        harvested = true;
        growth = 0;
    } else {
        message(prompts[growth], true);
        chime();
        return;
    }
    drawGarden();
    if (growth === 3 || harvested) {
        celebrate();
        message(harvested ? ['A lovely little harvest! Plant again?', 'Une jolie r\u00e9colte ! On replante ?'] : ['You helped them grow!', 'Tu les as fait pousser !'], true);
    } else chime();
}
function updateUI() {
    setTitle(['My Tiny Garden', 'Mon petit jardin']);
    instruction(prompts[growth]);
    stage.setAttribute('aria-label', text(growth === 0 ? ['Three empty pots in a garden', 'Trois pots vides dans un jardin']
        : growth === 1 ? ['Seeds planted in three pots', 'Des graines dans trois pots']
            : growth === 2 ? ['Three little green sprouts', 'Trois petites pousses vertes']
                : ['Three fully grown plants', 'Trois plantes ont pouss\u00e9']));
    controls.replaceChildren();
    palette.replaceChildren();
    seeds.forEach((seed, i) => {
        const el = button(seed.icon, seed.name, () => {
            selected = i;
            growth = 1;
            harvested = false;
            drawGarden();
            message(['Seeds tucked into the soil!', 'Les graines sont dans la terre !'], true);
        }, palette);
        el.setAttribute('aria-pressed', String(selected === i && growth > 0));
    });
    button('\ud83d\udca7', ['Water', 'Arroser'], () => advance('water')).classList.toggle('primary', growth === 1);
    button('\u2600\ufe0f', ['Sunshine', 'Soleil'], () => advance('sun')).classList.toggle('primary', growth === 2);
    button('\ud83e\uddfa', ['Pick!', 'Cueillir !'], () => advance('pick')).classList.toggle('primary', growth === 3);
    document.getElementById('steps').innerHTML = [
        ['Seed', 'Graine'], ['Water', 'Eau'], ['Sun', 'Soleil'], ['Pick', 'R\u00e9colte']
    ].map((label, i) => `<li class="${i < growth ? 'done' : ''} ${i === growth ? 'current' : ''}" ${i === growth ? 'aria-current="step"' : ''}>${text(label)}</li>`).join('');
    message(harvested ? ['A lovely little harvest! Plant again?', 'Une jolie r\u00e9colte ! On replante ?']
        : growth === 3 ? ['You helped them grow!', 'Tu les as fait pousser !'] : ['A little care makes lovely things grow.', 'Un peu de soin fait pousser de belles choses.']);
}
drawGarden();
init(updateUI);
