export const stage = document.getElementById('stage');
export const controls = document.getElementById('controls');
export const palette = document.getElementById('palette');
export const NS = 'http://www.w3.org/2000/svg';
export let language = 'en';
let soundEnabled = true;
let audio;
let updateLanguage;
let lastSound = -Infinity;
const reactionTimers = new WeakMap();
const ui = {
    home: ['Back to games', 'Retour aux jeux'],
    soundOn: ['Sound on', 'Son actif'],
    soundOff: ['Sound off', 'Son coup\u00e9'],
    help: ['Hear instructions', '\u00c9couter la consigne'],
    unavailable: ['Sound is unavailable here. You can still play!', 'Le son est indisponible. Tu peux jouer quand m\u00eame !']
};
export const text = pair => pair[language === 'fr' ? 1 : 0];
export const colors = [
    { value: '#ee6374', name: ['Red', 'Rouge'] },
    { value: '#f4ab45', name: ['Orange', 'Orange'] },
    { value: '#f8d85b', name: ['Yellow', 'Jaune'] },
    { value: '#58b98c', name: ['Green', 'Vert'] },
    { value: '#5b9fe4', name: ['Blue', 'Bleu'] },
    { value: '#ad79d1', name: ['Purple', 'Violet'] }
];
export function setTitle(pair) {
    document.getElementById('title').textContent = text(pair);
    document.title = text(pair) + ' - ba-by.ca';
}
export function instruction(pair) {
    document.getElementById('instruction').textContent = text(pair);
}
export function message(pair, say = false) {
    document.getElementById('message').textContent = text(pair);
    if (say) speak(text(pair));
}
export function button(icon, label, action, parent = controls) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'tool';
    el.innerHTML = `<span class="tool-icon" aria-hidden="true">${icon}</span><span class="tool-label"></span>`;
    el.querySelector('.tool-label').textContent = text(label);
    el.setAttribute('aria-label', text(label));
    el.dataset.focusKey = label[0];
    el.addEventListener('click', () => {
        unlockAudio();
        const focused = document.activeElement === el;
        const focusKey = el.dataset.focusKey;
        action(el);
        if (focused && !el.isConnected) {
            const replacement = Array.from(parent.children).find(child => child.dataset.focusKey === focusKey);
            if (replacement && !replacement.disabled) replacement.focus({ preventScroll: true });
        }
    });
    parent.appendChild(el);
    return el;
}
export function swatches(selected, action) {
    palette.replaceChildren();
    colors.forEach(color => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'swatch';
        el.style.setProperty('--swatch', color.value);
        el.setAttribute('aria-label', text(color.name));
        el.setAttribute('aria-pressed', String(selected === color.value));
        el.addEventListener('click', () => {
            unlockAudio();
            const focused = document.activeElement === el;
            const index = Array.from(palette.children).indexOf(el);
            palette.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === el)));
            action(color);
            if (focused && !el.isConnected) palette.children[index]?.focus({ preventScroll: true });
        });
        palette.appendChild(el);
    });
}
export function svg(content) {
    stage.innerHTML = `<svg viewBox="0 0 600 380" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${content}</svg>`;
}
export function node(tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, String(value)));
    parent.appendChild(el);
    return el;
}
export function react(element, animation = 'wiggle') {
    if (!element) throw new Error('The play character is missing from the scene.');
    const timers = reactionTimers.get(element) || new Map();
    reactionTimers.set(element, timers);
    clearTimeout(timers.get(animation));
    element.classList.remove(animation);
    void element.getBoundingClientRect();
    element.classList.add(animation);
    timers.set(animation, setTimeout(() => {
        element.classList.remove(animation);
        timers.delete(animation);
        if (!timers.size) reactionTimers.delete(element);
    }, 750));
}
export function playEffect(x, y, symbol = '\u2605') {
    if (stage.querySelectorAll('.play-effect').length >= 16) return;
    const el = document.createElement('span');
    el.className = 'play-effect';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = symbol;
    el.style.left = Math.max(5, Math.min(95, x / 6)) + '%';
    el.style.top = Math.max(8, Math.min(90, y / 3.8)) + '%';
    stage.appendChild(el);
    setTimeout(() => el.remove(), 1400);
}
export function sceneButton(icon, label, x, y, action) {
    const el = button(icon, label, action, stage);
    el.className = 'scene-button';
    el.style.left = `clamp(28px, ${x / 6}%, calc(100% - 28px))`;
    el.style.top = `clamp(28px, ${y / 3.8}%, calc(100% - 28px))`;
    return el;
}
export const face = (x, y) => `<g fill="#344359"><circle cx="${x - 22}" cy="${y}" r="6"/><circle cx="${x + 22}" cy="${y}" r="6"/><path d="M${x - 13} ${y + 23} Q${x} ${y + 38} ${x + 13} ${y + 23}" fill="none" stroke="#344359" stroke-width="5" stroke-linecap="round"/></g><g fill="#f39b9c" opacity=".65"><ellipse cx="${x - 38}" cy="${y + 15}" rx="12" ry="7"/><ellipse cx="${x + 38}" cy="${y + 15}" rx="12" ry="7"/></g>`;
export const sky = `<rect width="600" height="380" fill="#dff3f6"/><g fill="#fff" opacity=".85"><path d="M35 90 Q15 65 40 58 Q40 30 70 39 Q94 23 111 48 Q145 45 144 72 Q150 92 120 92Z"/><path d="M450 88 Q435 65 461 60 Q465 35 490 44 Q513 30 530 52 Q563 46 565 73 Q568 90 540 91Z"/></g>`;
export function celebrate(x = 300, y = 150) {
    chime(true);
    const root = stage.querySelector('svg');
    if (!root || root.querySelectorAll('.sparkle').length >= 40) return;
    for (let i = 0; i < 10; i++) {
        const el = node('text', { x: x - 90 + i * 20, y: y + Math.sin(i) * 35, fill: colors[i % colors.length].value, 'font-size': 28, class: 'sparkle' }, root);
        el.textContent = '\u2605';
        setTimeout(() => el.remove(), 1100);
    }
}
export function bubble(x, y) {
    const root = stage.querySelector('svg');
    if (!root || root.querySelectorAll('.bubble').length >= 18) return;
    const el = node('circle', { cx: x, cy: y, r: 10 + Math.random() * 10, fill: '#fff', 'fill-opacity': .55, stroke: '#8fcee6', 'stroke-width': 2, class: 'bubble' }, root);
    setTimeout(() => el.remove(), 1100);
}
export function rub(element, action, keyboardAction) {
    let pointer = null;
    const point = event => {
        const root = element.querySelector('svg');
        const matrix = root?.getScreenCTM();
        if (!matrix) return;
        const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
        action(p.x, p.y);
    };
    element.addEventListener('pointerdown', event => {
        if (event.target.closest('button')) return;
        if (pointer !== null || !event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        unlockAudio();
        pointer = event.pointerId;
        element.setPointerCapture(pointer);
        point(event);
    });
    element.addEventListener('pointermove', event => {
        if (event.pointerId === pointer) { event.preventDefault(); point(event); }
    });
    const finish = event => {
        if (event.pointerId !== pointer) return;
        const id = pointer;
        pointer = null;
        if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
    };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => element.addEventListener(type, finish));
    window.addEventListener('blur', () => {
        if (pointer !== null) finish({ pointerId: pointer });
    });
    window.addEventListener('resize', () => {
        if (pointer !== null) finish({ pointerId: pointer });
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && pointer !== null) finish({ pointerId: pointer });
    });
    element.addEventListener('keydown', event => {
        if (event.target.closest('button')) return;
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            unlockAudio();
            keyboardAction();
        }
    });
}
export function mud(group, positions) {
    return positions.map(([x, y], i) => {
        const el = node('path', { d: `M${x - 20} ${y} Q${x - 28} ${y - 24} ${x - 5} ${y - 18} Q${x + 22} ${y - 30} ${x + 26} ${y - 3} Q${x + 30} ${y + 21} ${x + 2} ${y + 18} Q${x - 24} ${y + 29} ${x - 20} ${y}`, fill: i % 2 ? '#987055' : '#b08b65' }, group);
        return { x, y, el, clean: false };
    });
}
export function cleanMud(patches, x, y, radius = 48) {
    let changed = false;
    patches.forEach(p => {
        if (!p.clean && Math.hypot(p.x - x, p.y - y) < radius) {
            p.clean = true;
            p.el.remove();
            changed = true;
        }
    });
    return changed;
}
export function cleanNext(patches, count = 1) {
    patches.filter(p => !p.clean).slice(0, count).forEach(p => { p.clean = true; p.el.remove(); });
}
function soundUnavailable(error) {
    console.warn('Toddler game audio unavailable:', error);
    soundEnabled = false;
    syncSettings();
    message(ui.unavailable);
}
export function unlockAudio() {
    if (!soundEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { soundUnavailable('Web Audio is not supported'); return; }
    if (!audio) {
        try { audio = new AudioContextClass(); } catch (error) { soundUnavailable(error); return; }
    }
    audio.resume().catch(soundUnavailable);
}
export function chime(success = false) {
    playNotes(success ? [523, 659, 784] : [440]);
}
export function soundEffect(kind) {
    const sounds = {
        pop: { notes: [880], wave: 'sine', bend: .4 },
        splash: { notes: [380, 520, 330], wave: 'sine', bend: .7 },
        giggle: { notes: [660, 880, 740], wave: 'sine', bend: 1.2 },
        horn: { notes: [294, 370], wave: 'triangle', bend: 1 },
        flutter: { notes: [880, 660, 990], wave: 'sine', bend: 1.1 }
    };
    const sound = sounds[kind];
    if (!sound) throw new Error(`Unknown play sound: ${kind}`);
    playNotes(sound.notes, sound.wave, sound.bend);
}
function playNotes(notes, wave = 'sine', bend = 1) {
    if (!soundEnabled || !audio || document.hidden || performance.now() - lastSound < 120) return;
    lastSound = performance.now();
    audio.resume().then(() => {
        if (!soundEnabled || document.hidden || audio.state !== 'running') return;
        notes.forEach((frequency, i) => {
            const osc = audio.createOscillator();
            const gain = audio.createGain();
            const start = audio.currentTime + i * .12;
            osc.type = wave;
            osc.frequency.setValueAtTime(frequency, start);
            osc.frequency.exponentialRampToValueAtTime(frequency * bend, start + .18);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(.055, start + .02);
            gain.gain.exponentialRampToValueAtTime(.001, start + .2);
            osc.connect(gain).connect(audio.destination);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
            osc.start(start);
            osc.stop(start + .22);
        });
    }).catch(soundUnavailable);
}
export function speak(words) {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(words);
    utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = .85;
    utterance.pitch = 1.1;
    utterance.volume = .65;
    utterance.onerror = event => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') console.warn('Game voice unavailable:', event.error);
    };
    window.speechSynthesis.speak(utterance);
}
function syncSettings() {
    document.documentElement.lang = language;
    document.querySelector('.topbar').setAttribute('aria-label', text(['Game settings', 'R\u00e9glages du jeu']));
    const labels = {
        wash: [['Washing tools', 'Outils de bain'], ['Animal choices', 'Choix des animaux']],
        garage: [['Garage tools', 'Outils du garage'], ['Car colors', 'Couleurs de voiture']],
        garden: [['Garden tools', 'Outils de jardin'], ['Seeds', 'Graines']],
        painting: [['Painting tools', 'Outils de peinture'], ['Paint colors', 'Couleurs de peinture']]
    };
    const [controlLabel, paletteLabel] = labels[document.body.dataset.game];
    controls.setAttribute('aria-label', text(controlLabel));
    palette.setAttribute('aria-label', text(document.body.dataset.game === 'garage' && palette.classList.contains('road-picker')
        ? ['Choose a road', 'Choisir une route'] : paletteLabel));
    document.getElementById('steps')?.setAttribute('aria-label', text(['Growing steps', '\u00c9tapes de croissance']));
    document.querySelector('.home').setAttribute('aria-label', text(ui.home));
    document.getElementById('help').setAttribute('aria-label', text(ui.help));
    const sound = document.getElementById('sound');
    sound.textContent = soundEnabled ? '\ud83d\udd0a' : '\ud83d\udd07';
    sound.setAttribute('aria-label', text(soundEnabled ? ui.soundOn : ui.soundOff));
    sound.setAttribute('aria-pressed', String(soundEnabled));
    document.querySelectorAll('[data-language]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.language === language)));
}
export function init(renderLanguage) {
    updateLanguage = renderLanguage;
    document.querySelectorAll('[data-language]').forEach(el => el.addEventListener('click', () => {
        language = el.dataset.language;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        syncSettings();
        updateLanguage();
    }));
    document.getElementById('sound').addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (!soundEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        if (!soundEnabled && audio) audio.suspend().catch(soundUnavailable);
        if (soundEnabled) { lastSound = -Infinity; unlockAudio(); chime(); }
        syncSettings();
    });
    document.getElementById('help').addEventListener('click', () => {
        unlockAudio();
        speak(document.getElementById('instruction').textContent);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        if (document.hidden && audio) audio.suspend().catch(soundUnavailable);
    });
    syncSettings();
    updateLanguage();
}
