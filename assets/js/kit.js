/**
 * ba-by.ca toy kit: shared sound, voice, screens, celebrations and effects for every game.
 * Load after site-lang.js. Everything lives on window.Kit.
 *
 *   Kit.topbar()                 home + back + sound + EN/FR buttons
 *   Kit.show(screen)             switch screens (cancels that screen's timers and speech)
 *   Kit.later(fn, ms)            a timer that is dropped when the screen changes
 *   Kit.say(en, fr)              speak in the site language
 *   Kit.sfx.pop() / boing(f) …   friendly synth sounds
 *   Kit.burst(x, y, colors, n)   sparkles, Kit.confetti(), Kit.cheer(text)
 */
(function () {
    'use strict';
    const lang = window.BabyLang;
    const T = (en, fr) => lang.t(en, fr);
    const $ = (sel, root) => (root || document).querySelector(sel);
    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Storage that never throws ----------
    const store = {
        get(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; } },
        set(key, value) { try { localStorage.setItem(key, String(value)); } catch (e) { /* not saved */ } },
        json(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } },
        setJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* not saved */ } }
    };
    // A saved level number between 0 and max - 1.
    function levelStore(key, max) {
        return {
            get() { const n = Number(store.get(key, 0)); return Number.isInteger(n) && n >= 0 && n < max ? n : 0; },
            set(n) { store.set(key, Math.max(0, Math.min(max - 1, n))); }
        };
    }

    // ---------- Sound ----------
    let ac = null;
    let muted = store.get('baby-muted', '0') === '1';
    const muteListeners = [];
    function audio() {
        if (muted) return null;
        try {
            ac = ac || new (window.AudioContext || window.webkitAudioContext)();
            if (ac.state === 'suspended') ac.resume();
            return ac;
        } catch (e) { return null; }
    }
    function tone(freq, opts) {
        const a = audio();
        if (!a) return;
        const o = Object.assign({ at: 0, dur: 0.3, vol: 0.16, type: 'sine', to: null, vibrato: 0 }, opts);
        const t0 = a.currentTime + o.at;
        const osc = a.createOscillator();
        const gain = a.createGain();
        osc.type = o.type;
        osc.frequency.setValueAtTime(freq, t0);
        if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
        if (o.vibrato) {
            const lfo = a.createOscillator();
            const depth = a.createGain();
            lfo.frequency.value = 6;
            depth.gain.value = o.vibrato;
            lfo.connect(depth).connect(osc.frequency);
            lfo.start(t0);
            lfo.stop(t0 + o.dur + 0.05);
        }
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(o.vol, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
        osc.connect(gain).connect(a.destination);
        osc.start(t0);
        osc.stop(t0 + o.dur + 0.05);
    }
    // Soft noise burst for splashes, whooshes and drums.
    function noise(opts) {
        const a = audio();
        if (!a) return;
        const o = Object.assign({ at: 0, dur: 0.25, vol: 0.12, freq: 1200, q: 0.8, type: 'bandpass' }, opts);
        const t0 = a.currentTime + o.at;
        const len = Math.ceil(a.sampleRate * o.dur);
        const buffer = a.createBuffer(1, len, a.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = a.createBufferSource();
        src.buffer = buffer;
        const filter = a.createBiquadFilter();
        filter.type = o.type;
        filter.frequency.value = o.freq;
        filter.Q.value = o.q;
        const gain = a.createGain();
        gain.gain.value = o.vol;
        src.connect(filter).connect(gain).connect(a.destination);
        src.start(t0);
    }
    const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const note = i => PENTA[((i % PENTA.length) + PENTA.length) % PENTA.length];
    const sfx = {
        pop: () => { tone(520, { to: 1040, dur: 0.12, vol: 0.18 }); tone(1560, { at: 0.03, dur: 0.06, vol: 0.05, type: 'triangle' }); },
        boing: (f = 440) => { tone(f, { dur: 0.32, vol: 0.18 }); tone(f / 2, { to: f, dur: 0.16, vol: 0.12, type: 'triangle' }); },
        plink: i => tone(note(i), { dur: 0.22, vol: 0.13, type: 'triangle' }),
        cheer: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, { at: i * 0.08, dur: 0.32, vol: 0.14, type: 'triangle' })),
        fanfare: () => [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, { at: i * 0.1, dur: 0.34, vol: 0.13, type: 'triangle' })),
        oops: () => tone(300, { to: 220, dur: 0.18, vol: 0.1, type: 'triangle' }),
        whoosh: () => noise({ dur: 0.35, freq: 900, q: 0.6, vol: 0.1 }),
        splash: () => { noise({ dur: 0.4, freq: 1800, q: 0.5, vol: 0.12 }); tone(380, { to: 520, dur: 0.15, vol: 0.06 }); },
        sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, { at: i * 0.06, dur: 0.18, vol: 0.06 })),
        drum: (f = 110) => { tone(f, { to: f / 2, dur: 0.25, vol: 0.3 }); noise({ dur: 0.08, freq: 3000, vol: 0.05 }); },
        click: () => tone(900, { dur: 0.05, vol: 0.06, type: 'square' }),
        munch: () => [0, 0.12, 0.24].forEach(at => noise({ at, dur: 0.07, freq: 700, q: 1.5, vol: 0.12 })),
        honk: () => { tone(392, { dur: 0.16, vol: 0.07, type: 'square' }); tone(494, { dur: 0.16, vol: 0.06, type: 'square' }); tone(392, { at: 0.2, dur: 0.2, vol: 0.07, type: 'square' }); tone(494, { at: 0.2, dur: 0.2, vol: 0.06, type: 'square' }); },
        squeak: () => { tone(1300, { to: 1900, dur: 0.09, vol: 0.08, type: 'triangle' }); tone(1500, { at: 0.1, to: 2100, dur: 0.09, vol: 0.08, type: 'triangle' }); },
        grow: () => [0, 2, 4, 5, 7].forEach((n, i) => tone(note(n + 3), { at: i * 0.07, dur: 0.2, vol: 0.08 }))
    };
    function setMuted(v) {
        muted = v;
        store.set('baby-muted', v ? '1' : '0');
        if (v) hush();
        muteListeners.forEach(fn => fn(v));
    }

    // ---------- Voice ----------
    function say(en, fr, opts) {
        if (muted) return null;
        return lang.speak(en, fr, Object.assign({ pitch: 1.15, rate: 0.95 }, opts));
    }
    function hush() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }

    // ---------- Timers tied to the current screen ----------
    let session = 0;
    function later(fn, ms) {
        const mine = session;
        return setTimeout(() => { if (mine === session) fn(); }, ms);
    }
    function newSession() { session++; }

    // ---------- Top bar ----------
    const HOME_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="23" fill="#FF7A45"/><path d="M2 26 A22 22 0 0 0 46 26 A23 20 0 0 1 2 26 Z" fill="#E85A28" opacity="0.55"/><path d="M24 12.5 L35.5 22 V33.5 a2.5 2.5 0 0 1 -2.5 2.5 H28 V29 a4 4 0 0 0 -8 0 V36 H15 a2.5 2.5 0 0 1 -2.5 -2.5 V22 Z" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>';
    const BACK_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="23" fill="#3D9BF0"/><path d="M2 26 A22 22 0 0 0 46 26 A23 20 0 0 1 2 26 Z" fill="#2177C9" opacity="0.55"/><path d="M25 14 L15 24 L25 34 M16 24 H34" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    let backBtn = null;
    let onBack = null;
    function topbar(options) {
        const opts = Object.assign({ sound: true, lang: true }, options);
        onBack = opts.onBack || null;
        const bar = document.createElement('nav');
        bar.className = 'kit-top';
        bar.setAttribute('aria-label', T('Game buttons', 'Boutons du jeu'));
        bar.innerHTML = `<a class="kit-round" href="/" aria-label="${T('Back to games', 'Retour aux jeux')}">${HOME_SVG}</a>`
            + `<button type="button" class="kit-round" id="kit-back" hidden aria-label="${T('Back', 'Retour')}">${BACK_SVG}</button>`
            + '<span class="kit-spacer"></span>'
            + (opts.sound ? '<button type="button" class="kit-round" id="kit-sound"></button>' : '')
            + (opts.lang ? '<span id="kit-lang"></span>' : '');
        document.body.prepend(bar);
        backBtn = $('#kit-back', bar);
        backBtn.addEventListener('click', () => { sfx.click(); if (onBack) onBack(); });
        const soundBtn = $('#kit-sound', bar);
        if (soundBtn) {
            const paint = () => {
                soundBtn.textContent = muted ? '🔇' : '🔊';
                soundBtn.setAttribute('aria-label', muted ? T('Turn sound on', 'Activer le son') : T('Turn sound off', 'Couper le son'));
                soundBtn.setAttribute('aria-pressed', String(!muted));
            };
            soundBtn.addEventListener('click', () => { setMuted(!muted); paint(); if (!muted) sfx.pop(); });
            paint();
            lang.onChange(paint);
        }
        if (opts.lang) lang.mountToggle($('#kit-lang', bar));
        lang.onChange(() => {
            bar.querySelector('a').setAttribute('aria-label', T('Back to games', 'Retour aux jeux'));
            backBtn.setAttribute('aria-label', T('Back', 'Retour'));
        });
        return bar;
    }
    function setBack(fn) { onBack = fn; }

    // ---------- Screens ----------
    const leaveHooks = new Map();
    let current = null;
    function show(screen, options) {
        const opts = Object.assign({ back: true }, options);
        if (current && current !== screen && leaveHooks.has(current)) leaveHooks.get(current)();
        newSession();
        hush();
        document.querySelectorAll('.kit-screen').forEach(s => { s.hidden = s !== screen; });
        current = screen;
        if (backBtn) backBtn.hidden = !opts.back;
        window.scrollTo(0, 0);
    }
    function onLeave(screen, fn) { leaveHooks.set(screen, fn); }

    // ---------- Little helpers ----------
    const shuffle = list => list.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
    const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const pick = list => list[Math.floor(Math.random() * list.length)];
    function bounce(el, cls) {
        if (!el) return;
        el.classList.remove('squish', 'wobble', 'dance');
        void el.offsetWidth;
        el.classList.add(cls || 'squish');
        el.addEventListener('animationend', () => el.classList.remove(cls || 'squish'), { once: true });
    }
    function centerOf(el) {
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
    }
    function tint(color) { document.documentElement.style.setProperty('--tint', color); }
    function stars(el, total, won, popIndex) {
        el.innerHTML = Array.from({ length: total }, (_, i) => `<span class="${i < won ? '' : 'off'}${i === popIndex ? ' pop' : ''}">⭐</span>`).join('');
        el.setAttribute('aria-label', T(`${won} of ${total} stars`, `${won} étoiles sur ${total}`));
    }
    let cheerEl = null, cheerTimer = 0;
    function cheer(text, ms) {
        if (!cheerEl) {
            cheerEl = document.createElement('div');
            cheerEl.className = 'kit-cheer';
            cheerEl.setAttribute('role', 'status');
            document.body.appendChild(cheerEl);
        }
        cheerEl.textContent = text;
        cheerEl.classList.add('show');
        clearTimeout(cheerTimer);
        cheerTimer = setTimeout(() => cheerEl.classList.remove('show'), ms || 1600);
    }
    function hideCheer() { if (cheerEl) cheerEl.classList.remove('show'); }

    // A numbered level grid: open(n) says if it can be picked, onPick(n) starts it.
    function picker(container, opts) {
        const colors = ['#FF7A7A', '#FF9F2E', '#F5C518', '#4CC26A', '#2EC4B6', '#4DA3F2', '#8C6CF0', '#F06CB4'];
        container.classList.add('kit-picker');
        container.innerHTML = Array.from({ length: opts.count }, (_, n) => {
            const open = opts.open(n);
            return `<button type="button" class="kit-tile${open ? '' : ' locked'}" data-n="${n}" style="--c:${colors[n % colors.length]};animation-delay:${n * 0.03}s"
                aria-label="${T(`Level ${n + 1}`, `Niveau ${n + 1}`)}${open ? '' : ', ' + T('locked', 'verrouillé')}">${n + 1}</button>`;
        }).join('');
        container.onclick = event => {
            const tile = event.target.closest('.kit-tile');
            if (!tile) return;
            const n = Number(tile.dataset.n);
            if (!opts.open(n)) { bounce(tile, 'wobble'); sfx.oops(); return; }
            sfx.pop();
            opts.onPick(n);
        };
    }

    // ---------- Effects canvas ----------
    let fx = null, fxCtx = null, parts = [], running = false, lastT = 0;
    function ensureFx() {
        if (fx) return;
        fx = document.createElement('canvas');
        fx.id = 'kit-fx';
        fx.setAttribute('aria-hidden', 'true');
        document.body.appendChild(fx);
        fxCtx = fx.getContext('2d');
        const resize = () => {
            const d = Math.min(window.devicePixelRatio || 1, 2);
            fx.width = Math.round(innerWidth * d);
            fx.height = Math.round(innerHeight * d);
            fxCtx.setTransform(d, 0, 0, d, 0, 0);
        };
        window.addEventListener('resize', resize);
        resize();
    }
    const COLORS = ['#FF6B8B', '#FFD54A', '#3FC9C0', '#A66BFF', '#4FB8FF', '#FF9F43', '#4CC26A'];
    function addPart(p) {
        if (parts.length > 420) return;
        parts.push(p);
        if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(tickFx); }
    }
    function burst(x, y, colors, n, power) {
        if (reduceMotion()) return;
        ensureFx();
        const list = colors && colors.length ? colors : COLORS;
        const pw = power || 1;
        for (let i = 0; i < (n || 24); i++) {
            const a = Math.random() * Math.PI * 2, s = (2 + Math.random() * 6) * pw;
            addPart({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2.5 * pw, g: 0.22, life: 1, decay: 0.018 + Math.random() * 0.012,
                r: 4 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
                shape: Math.random() < 0.45 ? 'star' : 'dot', color: list[i % list.length] });
        }
    }
    function burstFrom(el, colors, n, power) { const [x, y] = centerOf(el); burst(x, y, colors, n, power); }
    function confetti(n) {
        if (reduceMotion()) return;
        ensureFx();
        for (let i = 0; i < (n || 120); i++) {
            addPart({ x: Math.random() * innerWidth, y: -20 - Math.random() * 120, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3,
                g: 0.05, life: 1.6, decay: 0.006, r: 5 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25,
                shape: Math.random() < 0.3 ? 'star' : 'paper', color: COLORS[i % COLORS.length] });
        }
    }
    function starPath(c, r) {
        c.beginPath();
        for (let i = 0; i < 10; i++) {
            const rr = i % 2 ? r * 0.45 : r, a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        c.closePath();
    }
    function tickFx(now) {
        const k = Math.min(3, (now - lastT) / 16.67);
        lastT = now;
        fxCtx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.vy += p.g * k; p.x += p.vx * k; p.y += p.vy * k; p.rot += p.vr * k;
            p.vx *= Math.pow(0.985, k);
            p.life -= p.decay * k;
            if (p.life <= 0 || p.y > innerHeight + 40) { parts.splice(i, 1); continue; }
            fxCtx.globalAlpha = Math.min(1, p.life * 1.4);
            fxCtx.fillStyle = p.color;
            fxCtx.save();
            fxCtx.translate(p.x, p.y);
            fxCtx.rotate(p.rot);
            if (p.shape === 'star') { starPath(fxCtx, p.r); fxCtx.fill(); }
            else if (p.shape === 'paper') fxCtx.fillRect(-p.r, -p.r * 0.35, p.r * 2, p.r * 0.7);
            else { fxCtx.beginPath(); fxCtx.arc(0, 0, p.r * 0.7, 0, Math.PI * 2); fxCtx.fill(); }
            fxCtx.restore();
        }
        fxCtx.globalAlpha = 1;
        if (parts.length) requestAnimationFrame(tickFx);
        else { running = false; fxCtx.clearRect(0, 0, innerWidth, innerHeight); }
    }

    // An emoji (or any text) hops from one element to another, then done() runs.
    function flyTo(text, fromEl, toEl, options) {
        const opts = Object.assign({ size: 64, ms: 650, arc: 90, done: null }, options);
        const [fx0, fy0] = centerOf(fromEl);
        const [tx, ty] = centerOf(toEl);
        if (reduceMotion()) { if (opts.done) opts.done(); return; }
        const el = document.createElement('div');
        el.className = 'kit-flyer';
        el.textContent = text;
        el.style.fontSize = opts.size + 'px';
        el.style.left = fx0 + 'px';
        el.style.top = fy0 + 'px';
        document.body.appendChild(el);
        const dx = tx - fx0, dy = ty - fy0;
        const anim = el.animate([
            { transform: 'translate(-50%, -50%) scale(1)' },
            { transform: `translate(calc(-50% + ${dx / 2}px), calc(-50% + ${dy / 2 - opts.arc}px)) scale(1.2) rotate(-12deg)`, offset: 0.5 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${opts.endScale || 1}) rotate(6deg)` }
        ], { duration: opts.ms, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' });
        anim.onfinish = () => { el.remove(); if (opts.done) opts.done(); };
    }

    // Warm up the voice list so the first spoken word uses a nice voice.
    if ('speechSynthesis' in window) { try { window.speechSynthesis.getVoices(); } catch (e) { /* ignore */ } }

    window.Kit = {
        T, $, lang, store, levelStore, reduceMotion,
        tone, noise, note, sfx, say, hush,
        get muted() { return muted; }, setMuted, onMute: fn => muteListeners.push(fn),
        later, newSession,
        topbar, setBack, show, onLeave,
        shuffle, randInt, pick, bounce, centerOf, tint, stars, cheer, hideCheer, picker,
        burst, burstFrom, confetti, flyTo,
        onLang: fn => lang.onChange(fn)
    };
}());
