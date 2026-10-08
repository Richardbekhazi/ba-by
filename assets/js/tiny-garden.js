import { stage, controls, palette, text, setTitle, instruction, message, button, svg, face, sky, celebrate, chime, init, sceneButton, playEffect, react, soundEffect } from './toddler-play.js?v=20261008-mobile1';

const seeds = [
    { icon: '\ud83c\udf3c', name: ['Flowers', 'Fleurs'], kind: 'flower', color: '#f7cf57' },
    { icon: '\ud83c\udf53', name: ['Strawberries', 'Fraises'], kind: 'berry', color: '#ec6377' },
    { icon: '\ud83c\udf3b', name: ['Sunflowers', 'Tournesols'], kind: 'sunflower', color: '#f4b644' }
];
const pots = Array.from({ length: 3 }, (_, i) => ({ seed: i, growth: 0 }));
const positions = [155, 300, 445];
let selected = 0;
let tool = 'seed';
let visitor = 0;
let harvest = [];
let rain = false;
const visitors = [
    { icon: '\ud83e\udd8b', words: ['Flutter, flutter! A butterfly says hello!', 'Un papillon te dit bonjour !'] },
    { icon: '\ud83d\udc1d', words: ['Buzzy bee loves your flowers!', 'L\'abeille adore tes fleurs !'] },
    { icon: '\ud83d\udc30', words: ['Hop, hop! A bunny came to visit!', 'Hop, hop ! Un lapin vient te voir !'] },
    { icon: '\ud83d\udc1e', words: ['A little ladybird is playing peekaboo!', 'Une coccinelle joue a coucou !'] }
];

function plant(x, pot) {
    const seed = seeds[pot.seed];
    const y = 284;
    if (pot.growth === 0) return `<ellipse cx="${x}" cy="${y}" rx="32" ry="7" fill="#744d37" opacity=".4"/>`;
    if (pot.growth === 1) return `<ellipse cx="${x}" cy="${y - 5}" rx="11" ry="7" fill="#eac89b"/><path d="M${x} ${y - 8}q-7 -19 6 -23" stroke="#77b365" stroke-width="5" fill="none"/>`;
    const top = y - (pot.growth === 2 ? 50 : 110);
    const leaves = `<path d="M${x} ${y}V${top}" stroke="#548c52" stroke-width="9" stroke-linecap="round"/><path d="M${x} ${top + 35}Q${x - 52} ${top + 5} ${x - 44} ${top + 41}Q${x - 15} ${top + 63} ${x} ${top + 35}M${x} ${top + 50}Q${x + 49} ${top + 17} ${x + 46} ${top + 51}Q${x + 19} ${top + 75} ${x} ${top + 50}" fill="#77b365"/>`;
    if (pot.growth === 2) return leaves;
    const bloom = seed.kind === 'berry'
        ? `<path d="M${x - 29} ${top}Q${x} ${top - 21} ${x + 29} ${top}Q${x + 32} ${top + 32} ${x} ${top + 53}Q${x - 32} ${top + 32} ${x - 29} ${top}Z" fill="${seed.color}"/><path d="M${x - 23} ${top - 5}L${x - 10} ${top + 10}L${x} ${top}L${x + 11} ${top + 10}L${x + 24} ${top - 5}Z" fill="#548c52"/><g fill="#ffe6ac"><ellipse cx="${x - 13}" cy="${top + 19}" rx="2" ry="4"/><ellipse cx="${x + 12}" cy="${top + 19}" rx="2" ry="4"/><ellipse cx="${x}" cy="${top + 37}" rx="2" ry="4"/></g>`
        : `<g fill="${seed.color}">${Array.from({ length: 8 }, (_, j) => `<ellipse cx="${x}" cy="${top - 28}" rx="16" ry="26" transform="rotate(${j * 45} ${x} ${top})"/>`).join('')}</g><circle cx="${x}" cy="${top}" r="26" fill="${seed.kind === 'sunflower' ? '#9c6845' : '#fff3b3'}"/>`;
    return leaves + bloom;
}
function drawGarden() {
    svg(`${sky}<g id="garden-sun"><circle cx="495" cy="66" r="42" fill="#ffd56a"/>${face(495, 56)}</g>
        <path d="M0 278Q135 196 270 269Q452 187 600 277V380H0Z" fill="#b0d893"/><rect y="305" width="600" height="75" fill="#91bb75"/>
        <path d="M25 287H575M25 310H575" stroke="#fff4dc" stroke-width="9"/><g stroke="#fff4dc" stroke-width="12"><path d="M40 260V330M100 260V330M500 260V330M560 260V330"/></g>
        ${pots.map((pot, i) => `<g id="plant-${i}"><ellipse cx="${positions[i]}" cy="353" rx="58" ry="10" fill="#69804d" opacity=".2"/><path d="M${positions[i] - 49} 292H${positions[i] + 49}L${positions[i] + 35} 351H${positions[i] - 35}Z" fill="#d98d65"/><rect x="${positions[i] - 54}" y="282" width="108" height="20" rx="8" fill="#e9a681"/><ellipse cx="${positions[i]}" cy="284" rx="46" ry="8" fill="#976c4b"/>${plant(positions[i], pot)}</g>`).join('')}
        ${rain ? '<g class="rain-drops" fill="#73b8df"><path d="M130 105Q115 127 130 134Q145 127 130 105M280 94Q265 117 280 123Q295 117 280 94M437 102Q422 125 437 131Q452 125 437 102"/></g>' : ''}
        <rect x="241" y="337" width="118" height="37" rx="12" fill="#dfaa6f"/><text x="300" y="366" text-anchor="middle" font-size="25">${harvest.join('')}</text>`);
    positions.forEach((x, i) => sceneButton(pots[i].growth === 3 ? seeds[pots[i].seed].icon : '\ud83e\udeb4',
        [['Play with left pot', 'Jouer avec le pot gauche'], ['Play with middle pot', 'Jouer avec le pot du milieu'], ['Play with right pot', 'Jouer avec le pot droit']][i],
        x, 310, () => careFor(i)));
    sceneButton(visitors[visitor].icon, ['Say hello to visitor', 'Dire bonjour au visiteur'], 65, 155, visit);
    sceneButton('\u2600\ufe0f', ['Tap the sunshine', 'Toucher le soleil'], 495, 66, sunshine);
    updateUI();
}
function visit() {
    const friend = visitors[visitor];
    playEffect(90, 150, friend.icon);
    playEffect(180, 130, '\ud83d\udc97');
    message(friend.words, true);
    visitor = (visitor + 1) % visitors.length;
    const el = stage.querySelectorAll('.scene-button')[3];
    el.querySelector('.tool-icon').textContent = visitors[visitor].icon;
    soundEffect('flutter');
}
function careFor(i) {
    const pot = pots[i];
    if (pot.growth === 0) {
        pot.seed = selected;
        pot.growth = 1;
    } else if (pot.growth === 3) {
        harvest.push(seeds[pot.seed].icon);
        harvest = harvest.slice(-4);
        pot.growth = 0;
    } else pot.growth++;
    drawGarden();
    react(stage.querySelector(`#plant-${i}`), 'hop');
    playEffect(positions[i], 190, pot.growth === 0 ? '\ud83e\uddfa' : pot.growth === 2 ? '\ud83d\udca7' : '\u2728');
    chime(true);
    if (pot.growth === 3) {
        celebrate(positions[i], 150);
        message(['A lovely bloom! Who will visit?', 'Une jolie plante ! Qui vient la voir ?'], true);
    } else message(pot.growth === 0 ? ['Into your basket! Grow something new!', 'Dans ton panier ! Plante encore !']
        : pot.growth === 1 ? ['A tiny seed! Tap again to help it grow.', 'Une petite graine ! Touche pour la faire pousser.']
            : ['A little sprout! Tap again for a flower.', 'Une petite pousse ! Touche pour une fleur.']);
}
function water() {
    tool = 'water';
    rain = true;
    pots.forEach(pot => {
        if (pot.growth === 0) { pot.seed = selected; pot.growth = 1; }
        else if (pot.growth < 2) pot.growth++;
    });
    drawGarden();
    positions.forEach(x => playEffect(x, 140, '\ud83d\udca7'));
    message(['Pitter-patter! The sprouts love a drink.', 'Ploc, ploc ! Les pousses aiment l\'eau.']);
    soundEffect('splash');
}
function sunshine() {
    tool = 'sun';
    rain = false;
    pots.forEach(pot => { if (pot.growth === 2) pot.growth = 3; });
    drawGarden();
    react(stage.querySelector('#garden-sun'));
    celebrate();
    message(['Sunshine and smiles! Tap a plant or a visitor.', 'Du soleil et des sourires ! Touche une plante ou un ami.']);
}
function pick() {
    const ripe = pots.findIndex(p => p.growth === 3);
    if (ripe >= 0) careFor(ripe);
    else { visit(); message(['Your visitor is keeping the plants company!', 'Ton ami tient compagnie aux plantes !']); }
}
function updateUI() {
    setTitle(['My Tiny Garden', 'Mon petit jardin']);
    instruction(['Tap the pots to grow, pick, and grow again!', 'Touche les pots pour planter, grandir et cueillir !']);
    stage.setAttribute('aria-label', text(['Interactive garden. Play with the pots, sun, and visitors.', 'Jardin interactif. Joue avec les pots, le soleil et les amis.']));
    controls.replaceChildren();
    palette.replaceChildren();
    seeds.forEach((seed, i) => {
        const el = button(seed.icon, seed.name, () => {
            selected = i;
            tool = 'seed';
            const empty = pots.findIndex(p => p.growth === 0);
            if (empty >= 0) careFor(empty);
            else { updateUI(); message(['Pick a bloom, then plant your new seed!', 'Cueille une plante puis plante ta graine !']); }
        }, palette);
        el.setAttribute('aria-pressed', String(selected === i));
    });
    button('\ud83d\udca7', ['Water', 'Arroser'], water).setAttribute('aria-pressed', String(tool === 'water'));
    button('\u2600\ufe0f', ['Sunshine', 'Soleil'], sunshine).setAttribute('aria-pressed', String(tool === 'sun'));
    button('\ud83e\uddfa', ['Pick!', 'Cueillir !'], pick);
    button('\ud83e\udd8b', ['Visitors', 'Les amis'], visit);
    button('\ud83c\udf27\ufe0f', ['Rain shower', 'Petite pluie'], water);
    const growth = Math.min(...pots.map(p => p.growth));
    document.getElementById('steps').innerHTML = [
        ['Seed', 'Graine'], ['Water', 'Eau'], ['Sun', 'Soleil'], ['Pick', 'R\u00e9colte']
    ].map((label, i) => `<li class="${i < growth ? 'done' : ''} ${i === growth ? 'current' : ''}">${text(label)}</li>`).join('');
}
stage.setAttribute('role', 'group');
drawGarden();
init(() => { drawGarden(); message(['A garden full of little surprises!', 'Un jardin plein de petites surprises !']); });
