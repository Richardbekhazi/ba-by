import { stage, controls, palette, text, setTitle, instruction, message, button, svg, node, face, sky, mud, cleanMud, cleanNext, rub, bubble, celebrate, chime, init } from './toddler-play.js';

const friends = [
    { name: ['Puppy', 'Petit chien'], color: '#dba16d', ears: 'dog' },
    { name: ['Piglet', 'Petit cochon'], color: '#f5a6ba', ears: 'pig' },
    { name: ['Bunny', 'Petit lapin'], color: '#ddd9ee', ears: 'bunny' }
];
const dirtySpots = [[235, 150], [300, 135], [360, 155], [230, 205], [305, 200], [370, 208], [235, 255], [305, 255], [367, 265]];
let friendIndex = 0;
let tool = 'sponge';
let patches = [];
let clean = false;

function drawFriend() {
    const friend = friends[friendIndex];
    const ears = friend.ears === 'bunny'
        ? `<ellipse cx="255" cy="88" rx="24" ry="65" fill="${friend.color}" transform="rotate(-12 255 88)"/><ellipse cx="345" cy="88" rx="24" ry="65" fill="${friend.color}" transform="rotate(12 345 88)"/><ellipse cx="255" cy="83" rx="10" ry="43" fill="#f5bdce"/><ellipse cx="345" cy="83" rx="10" ry="43" fill="#f5bdce"/>`
        : friend.ears === 'dog'
            ? '<ellipse cx="215" cy="160" rx="37" ry="70" fill="#936a52" transform="rotate(15 215 160)"/><ellipse cx="385" cy="160" rx="37" ry="70" fill="#936a52" transform="rotate(-15 385 160)"/>'
            : '<path d="M215 142 L200 73 Q250 66 269 129M331 129 Q355 66 400 73 L385 142" fill="#e88ca7" stroke="#f5a6ba" stroke-width="14" stroke-linejoin="round"/>';
    svg(`${sky}<rect y="300" width="600" height="80" fill="#b5e0df"/><ellipse cx="300" cy="324" rx="178" ry="22" fill="#86bcc8" opacity=".35"/>
        ${ears}<ellipse cx="300" cy="258" rx="102" ry="77" fill="${friend.color}"/><ellipse cx="300" cy="264" rx="58" ry="48" fill="#fff3e3"/>
        <ellipse cx="232" cy="299" rx="31" ry="22" fill="${friend.color}"/><ellipse cx="368" cy="299" rx="31" ry="22" fill="${friend.color}"/>
        <rect x="207" y="110" width="186" height="147" rx="72" fill="${friend.color}"/>
        ${face(300, 170)}${friend.ears === 'pig' ? '<ellipse cx="300" cy="195" rx="25" ry="18" fill="#e784a2"/><circle cx="290" cy="193" r="4" fill="#ad526e"/><circle cx="310" cy="193" r="4" fill="#ad526e"/>' : '<ellipse cx="300" cy="188" rx="10" ry="7" fill="#6f5360"/>'}
        <g id="mud"></g><g id="suds" fill="#fff" opacity=".8"></g>
        <path d="M136 308 Q300 350 464 308 L445 357 Q300 385 155 357Z" fill="#7fc5d8" stroke="white" stroke-width="6"/>
        <g class="water" stroke="#67b8e1" stroke-width="8" stroke-linecap="round"><path d="M220 35L245 115M275 24L290 105M332 24L327 105M389 35L370 115"/></g>`);
    patches = mud(stage.querySelector('#mud'), dirtySpots);
    clean = false;
    stage.classList.remove('rinsing');
    updateUI();
}
function rinseEffect() {
    stage.classList.remove('rinsing');
    void stage.offsetWidth;
    stage.classList.add('rinsing');
}
function scrub(x, y) {
    if (clean) { bubble(x, y); return; }
    const changed = cleanMud(patches, x, y);
    if (!changed) return;
    bubble(x, y);
    if (tool === 'sponge') node('circle', { cx: x, cy: y, r: 19, fill: '#fff', opacity: .65 }, stage.querySelector('#suds'));
    else rinseEffect();
    chime();
    finishIfReady();
}
function finishIfReady() {
    if (patches.every(p => p.clean) && tool === 'water') {
        stage.querySelector('#suds').replaceChildren();
        clean = true;
        celebrate();
        message(['Sparkly clean! Thank you!', 'Tout propre ! Merci !'], true);
    }
    updateUI();
}
function washTap() {
    cleanNext(patches, 2);
    if (tool === 'water') rinseEffect();
    else bubble(300, 210);
    chime();
    finishIfReady();
}
function updateUI() {
    setTitle(['Wash the Animals', 'Le bain des animaux']);
    const ready = !clean && patches.every(p => p.clean);
    instruction(clean ? ['All clean! Meet another friend!', 'Tout propre ! Un autre ami ?']
        : ready ? ['Tap the shower to rinse the bubbles!', 'Touche la douche pour rincer !']
            : ['Rub the muddy spots, or tap the sponge!', 'Frotte la boue ou touche l\'\u00e9ponge !']);
    stage.setAttribute('aria-label', text(clean ? ['Clean animal. Tap for bubbles.', 'Animal propre. Touche pour des bulles.'] : ['Rub to wash. Press space to clean a muddy spot.', 'Frotte pour laver. Espace nettoie une tache.']));
    controls.replaceChildren();
    palette.replaceChildren();
    const sponge = button('\ud83e\uddfd', ['Sponge', '\u00c9ponge'], () => { tool = 'sponge'; if (!clean) washTap(); else updateUI(); });
    sponge.setAttribute('aria-pressed', String(tool === 'sponge'));
    const water = button('\ud83d\udebf', ['Rinse', 'Rincer'], () => { tool = 'water'; if (!clean) washTap(); else { rinseEffect(); updateUI(); } });
    water.setAttribute('aria-pressed', String(tool === 'water'));
    if (ready) water.classList.add('primary');
    button('\ud83d\udc3e', ['Next friend', 'Autre ami'], () => {
        friendIndex = (friendIndex + 1) % friends.length;
        tool = 'sponge';
        drawFriend();
        message(friends[friendIndex].name, true);
    }).classList.toggle('primary', clean);
    button('\ud83d\udd04', ['More mud', 'Encore'], () => { tool = 'sponge'; drawFriend(); message(['Splash! Let\'s wash again!', 'Plouf ! On lave encore !'], true); });
    message(clean ? ['Sparkly clean! Thank you!', 'Tout propre ! Merci !']
        : ready ? ['Lovely bubbles! Time for a rinse.', 'De jolies bulles ! On rince.'] : friends[friendIndex].name);
}
rub(stage, scrub, washTap);
drawFriend();
init(updateUI);
