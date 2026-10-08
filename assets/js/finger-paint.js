import { controls, text, setTitle, instruction, message, button, colors, swatches, chime, unlockAudio, init, playEffect } from './toddler-play.js?v=20261008-review1';

const paper = document.getElementById('paper');
const outline = document.getElementById('outline');
const ctx = paper.getContext('2d');
const base = document.createElement('canvas');
base.width = paper.width;
base.height = paper.height;
const baseCtx = base.getContext('2d');
const settled = document.createElement('canvas');
settled.width = paper.width;
settled.height = paper.height;
const settledCtx = settled.getContext('2d');
if (!ctx || !baseCtx || !settledCtx) throw new Error('This browser does not support the drawing canvas.');
let color = colors[0].value;
let tool = 'rainbow';
let rainbowHue = 0;
let picture = 0;
let pointer = null;
let current = null;
let commands = [];
let lastPoint;
let keyPoint = { x: 300, y: 190 };
let brushSize = 26;
const isStamp = value => ['star', 'flower', 'heart', 'glitter'].includes(value);
const stampIcons = { star: '\u2b50', flower: '\ud83c\udf38', heart: '\ud83d\udc97', glitter: '\u2728' };
const pictures = [
    '',
    '<path d="M300 310V185M300 253Q235 210 212 238Q220 280 300 253M300 276Q356 224 383 251Q368 291 300 276"/><g>' + Array.from({ length: 8 }, (_, i) => `<ellipse cx="300" cy="113" rx="28" ry="40" transform="rotate(${i * 45} 300 170)"/>`).join('') + '</g><circle cx="300" cy="170" r="34"/>',
    '<path d="M125 263L143 212L207 198L248 133H360L410 198L469 218V263Z"/><path d="M230 195L258 151H298V195ZM317 151H352L382 195H317Z"/><circle cx="212" cy="267" r="33"/><circle cx="411" cy="267" r="33"/>',
    '<path d="M300 192Q150 31 140 133Q135 208 277 204Q164 218 185 291Q217 344 300 213M300 192Q450 31 460 133Q465 208 323 204Q436 218 415 291Q383 344 300 213"/><ellipse cx="300" cy="204" rx="15" ry="74"/><path d="M297 139L279 115M303 139L321 115"/>'
];

function drawCommand(context, command) {
    context.save();
    context.setTransform(2, 0, 0, 2, 0, 0);
    if (command.tool === 'clear') {
        context.clearRect(0, 0, 600, 380);
        context.restore();
        return;
    }
    context.globalCompositeOperation = command.tool === 'eraser' ? 'destination-out' : 'source-over';
    context.fillStyle = command.color;
    context.strokeStyle = command.color;
    context.lineWidth = command.size;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (command.tool === 'rainbow') {
        command.points.forEach((p, i) => {
            context.fillStyle = `hsl(${p.hue}, 85%, 65%)`;
            if (i === 0) {
                context.beginPath();
                context.arc(p.x, p.y, command.size / 2, 0, Math.PI * 2);
                context.fill();
            } else {
                const previous = command.points[i - 1];
                const gradient = context.createLinearGradient(previous.x, previous.y, p.x, p.y);
                gradient.addColorStop(0, `hsl(${previous.hue}, 85%, 65%)`);
                gradient.addColorStop(1, `hsl(${p.hue}, 85%, 65%)`);
                context.strokeStyle = gradient;
                context.beginPath();
                context.moveTo(previous.x, previous.y);
                context.lineTo(p.x, p.y);
                context.stroke();
            }
        });
    } else if (isStamp(command.tool)) {
        command.points.forEach(p => {
            context.save();
            context.translate(p.x, p.y);
            if (command.tool === 'star') {
                context.beginPath();
                for (let i = 0; i < 10; i++) {
                    const a = i * Math.PI / 5 - Math.PI / 2;
                    const r = i % 2 ? 12 : 29;
                    const x = Math.cos(a) * r;
                    const y = Math.sin(a) * r;
                    if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
                }
                context.closePath();
                context.fill();
            } else if (command.tool === 'heart') {
                context.beginPath();
                context.moveTo(0, 26);
                context.bezierCurveTo(-52, -5, -20, -40, 0, -15);
                context.bezierCurveTo(20, -40, 52, -5, 0, 26);
                context.fill();
            } else if (command.tool === 'glitter') {
                for (let i = 0; i < 7; i++) {
                    context.fillStyle = colors[i % colors.length].value;
                    context.beginPath();
                    context.arc(Math.cos(i * 2.4) * i * 4, Math.sin(i * 2.4) * i * 4, 3 + i % 3, 0, Math.PI * 2);
                    context.fill();
                }
            } else {
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    context.beginPath();
                    context.ellipse(Math.cos(angle) * 16, Math.sin(angle) * 16, 13, 13, 0, 0, Math.PI * 2);
                    context.fill();
                }
                context.fillStyle = '#ffe79a';
                context.beginPath();
                context.arc(0, 0, 9, 0, Math.PI * 2);
                context.fill();
                context.fillStyle = command.color;
            }
            context.restore();
        });
    } else {
        context.beginPath();
        command.points.forEach((p, i) => { if (i === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y); });
        if (command.points.length === 1) {
            const p = command.points[0];
            context.arc(p.x, p.y, command.size / 2, 0, Math.PI * 2);
            context.fill();
        } else context.stroke();
    }
    context.restore();
}
function repaint() {
    ctx.clearRect(0, 0, paper.width, paper.height);
    ctx.drawImage(settled, 0, 0);
    if (current) drawCommand(ctx, current);
}
function commit(command) {
    commands.push(command);
    drawCommand(settledCtx, command);
    if (commands.length > 50) drawCommand(baseCtx, commands.shift());
}
function position(event) {
    const rect = paper.getBoundingClientRect();
    return {
        x: Math.max(0, Math.min(600, (event.clientX - rect.left) / rect.width * 600)),
        y: Math.max(0, Math.min(380, (event.clientY - rect.top) / rect.height * 380))
    };
}
function newCommand(p) {
    const first = { ...p, hue: rainbowHue };
    rainbowHue = (rainbowHue + 18) % 360;
    return { tool, color, size: tool === 'eraser' ? 48 : brushSize, points: [first] };
}
function stampReaction(p) {
    if (isStamp(tool)) playEffect(p.x, p.y, stampIcons[tool]);
}
paper.addEventListener('pointerdown', event => {
    if (pointer !== null || !event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    unlockAudio();
    pointer = event.pointerId;
    paper.setPointerCapture(pointer);
    lastPoint = position(event);
    current = newCommand(lastPoint);
    stampReaction(lastPoint);
    repaint();
    chime();
});
paper.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer || !current) return;
    event.preventDefault();
    const p = position(event);
    const distance = Math.hypot(p.x - lastPoint.x, p.y - lastPoint.y);
    if (distance < (isStamp(tool) ? 38 : 2)) return;
    p.hue = rainbowHue;
    rainbowHue = (rainbowHue + 6) % 360;
    current.points.push(p);
    stampReaction(p);
    lastPoint = p;
    if (current.points.length >= 1000) {
        commit(current);
        current = newCommand(p);
    }
    repaint();
});
function finish(event) {
    if (event.pointerId !== pointer) return;
    if (current) commit(current);
    current = null;
    const id = pointer;
    pointer = null;
    if (paper.hasPointerCapture(id)) paper.releasePointerCapture(id);
    updateUI();
}
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => paper.addEventListener(type, finish));
window.addEventListener('blur', () => { if (pointer !== null) finish({ pointerId: pointer }); });
window.addEventListener('resize', () => { if (pointer !== null) finish({ pointerId: pointer }); });
document.addEventListener('visibilitychange', () => {
    if (document.hidden && pointer !== null) finish({ pointerId: pointer });
});
function finishStroke() {
    if (pointer !== null) finish({ pointerId: pointer });
}
function drawOutline() {
    outline.innerHTML = `<g fill="none" stroke="#526179" stroke-opacity=".5" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${pictures[picture]}</g>`;
    if (paper.matches(':focus-visible')) {
        outline.innerHTML += `<circle cx="${keyPoint.x}" cy="${keyPoint.y}" r="18" fill="none" stroke="#284f9e" stroke-width="3" stroke-dasharray="4 4"/>`;
    }
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
        unlockAudio();
        commit(newCommand({ ...keyPoint }));
        stampReaction(keyPoint);
        repaint();
        chime();
        updateUI();
    }
});
paper.addEventListener('focus', drawOutline);
paper.addEventListener('blur', drawOutline);
function selectTool(next) {
    finishStroke();
    tool = next;
    updateUI();
}
function updateUI() {
    setTitle(['Magic Finger Painting', 'Peinture magique']);
    instruction(isStamp(tool) ? ['Tap or slide for bouncy little stamps!', 'Touche ou glisse pour des tampons rigolos !']
        : tool === 'rainbow' ? ['Slide your finger to make a rainbow!', 'Glisse ton doigt pour faire un arc-en-ciel !']
        : tool === 'eraser' ? ['Rub to erase. Your colors are waiting!', 'Frotte pour effacer. Tes couleurs t\'attendent !']
            : ['Pick a color. Paint with your finger!', 'Choisis une couleur. Peins avec ton doigt !']);
    paper.setAttribute('aria-label', text(['Drawing paper. Arrow keys move; space paints.', 'Papier \u00e0 dessin. Les fl\u00e8ches d\u00e9placent ; espace peint.']));
    controls.replaceChildren();
    [
        ['\ud83c\udf08', ['Rainbow', 'Arc-en-ciel'], 'rainbow'],
        ['\ud83d\udd8c\ufe0f', ['Brush', 'Pinceau'], 'brush'],
        ['\u2b50', ['Stars', '\u00c9toiles'], 'star'],
        ['\ud83c\udf38', ['Flowers', 'Fleurs'], 'flower'],
        ['\ud83d\udc97', ['Hearts', 'Coeurs'], 'heart'],
        ['\u2728', ['Glitter', 'Paillettes'], 'glitter'],
        ['\ud83e\uddfd', ['Eraser', 'Gomme'], 'eraser']
    ].forEach(([icon, label, value]) => {
        const el = button(icon, label, () => selectTool(value));
        el.setAttribute('aria-pressed', String(tool === value));
    });
    button('\ud83c\udfb6', ['Dance!', 'Danse !'], () => {
        finishStroke();
        const stamps = commands.filter(command => isStamp(command.tool)).flatMap(command =>
            command.points.map(p => ({ ...p, icon: stampIcons[command.tool] }))).slice(-12);
        if (stamps.length) stamps.forEach(p => playEffect(p.x, p.y, p.icon));
        else for (let i = 0; i < 8; i++) playEffect(60 + i * 65, 150 + (i % 3) * 50, ['\u2b50', '\ud83c\udf38', '\ud83d\udc97'][i % 3]);
        chime(true);
        message(['A little dance! Your picture stays safe.', 'Une petite danse ! Ton dessin reste intact.']);
    });
    button(brushSize === 26 ? '\u25cf' : '\u2b24', ['Brush size', 'Taille'], () => {
        finishStroke();
        brushSize = brushSize === 26 ? 44 : 26;
        updateUI();
        message(brushSize === 44 ? ['A big soft brush!', 'Un gros pinceau doux !'] : ['A little soft brush!', 'Un petit pinceau doux !']);
    });
    button('\ud83d\uddbc\ufe0f', ['Picture', 'Image'], () => {
        picture = (picture + 1) % pictures.length;
        drawOutline();
        chime();
        message(['A new outline. Your painting stays!', 'Un nouveau contour. Ta peinture reste !']);
    });
    const undo = button('\u21a9\ufe0f', ['Undo', 'Annuler'], () => {
        finishStroke();
        commands.pop();
        settledCtx.clearRect(0, 0, settled.width, settled.height);
        settledCtx.drawImage(base, 0, 0);
        commands.forEach(command => drawCommand(settledCtx, command));
        repaint();
        updateUI();
        message(['Back one little step!', 'Un petit pas en arri\u00e8re !']);
    });
    undo.disabled = commands.length === 0;
    button('\ud83d\udcc4', ['New paper', 'Papier neuf'], () => {
        finishStroke();
        commit({ tool: 'clear' });
        repaint();
        updateUI();
        message(['Fresh paper! Undo brings your picture back.', 'Papier neuf ! Annuler retrouve ton dessin.']);
    });
    swatches(color, selected => {
        finishStroke();
        color = selected.value;
        if (tool === 'eraser' || tool === 'rainbow') tool = 'brush';
        updateUI();
        message(selected.name, true);
    });
    drawOutline();
}
init(() => {
    updateUI();
    message(['Your paper, your imagination!', 'Ton papier, ton imagination !']);
});
