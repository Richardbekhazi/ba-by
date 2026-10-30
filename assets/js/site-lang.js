/**
 * Shared site language (English / French).
 *
 * Every page loads this script so the language chosen anywhere on ba-by.ca
 * is remembered everywhere. Static text is translated with attributes:
 *   data-fr="Texte"              -> textContent in French (English is kept from the HTML)
 *   data-fr-aria-label="Texte"   -> aria-label in French
 *   data-fr-title="Texte"        -> title in French
 * Pages that build text in JavaScript use BabyLang.t(en, fr) and
 * BabyLang.onChange(callback). Add data-lang-toggle to a container to get
 * the shared EN / FR buttons inside it, or call BabyLang.mountToggle().
 */
(function () {
    'use strict';
    const KEY = 'baby-lang';
    const listeners = [];

    function read() {
        try {
            const saved = localStorage.getItem(KEY);
            if (saved === 'en' || saved === 'fr') return saved;
        } catch (error) { /* storage may be blocked */ }
        return (navigator.language || 'en').toLowerCase().startsWith('fr') ? 'fr' : 'en';
    }

    let lang = read();

    function translateNode(el) {
        if (el.dataset.fr !== undefined) {
            if (el.dataset.en === undefined) el.dataset.en = el.textContent;
            el.textContent = lang === 'fr' ? el.dataset.fr : el.dataset.en;
        }
        ['aria-label', 'title', 'placeholder'].forEach(attr => {
            const fr = el.getAttribute('data-fr-' + attr);
            if (fr === null) return;
            const store = 'data-en-' + attr;
            if (!el.hasAttribute(store)) el.setAttribute(store, el.getAttribute(attr) || '');
            el.setAttribute(attr, lang === 'fr' ? fr : el.getAttribute(store));
        });
    }

    function apply(root) {
        document.documentElement.lang = lang;
        (root || document).querySelectorAll('[data-fr], [data-fr-aria-label], [data-fr-title], [data-fr-placeholder]').forEach(translateNode);
        if (document.documentElement.dataset.titleFr) {
            if (!document.documentElement.dataset.titleEn) document.documentElement.dataset.titleEn = document.title;
            document.title = lang === 'fr' ? document.documentElement.dataset.titleFr : document.documentElement.dataset.titleEn;
        }
        document.querySelectorAll('.site-lang-toggle button').forEach(button => {
            const active = button.dataset.setLang === lang;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }

    function set(next) {
        if (next !== 'en' && next !== 'fr') return;
        lang = next;
        try { localStorage.setItem(KEY, lang); } catch (error) { /* ignore */ }
        apply();
        listeners.forEach(fn => fn(lang));
    }

    function injectStyles() {
        if (document.getElementById('site-lang-style')) return;
        const style = document.createElement('style');
        style.id = 'site-lang-style';
        style.textContent = '.site-lang-toggle{display:inline-flex;gap:4px;padding:4px;background:rgba(255,255,255,.9);'
            + 'border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.12);z-index:150}'
            + '.site-lang-toggle.floating{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right))}'
            + '.site-lang-toggle button{min-width:44px;min-height:40px;border:0;border-radius:999px;background:transparent;'
            + 'font:800 15px/1 system-ui,sans-serif;color:#555;cursor:pointer;touch-action:manipulation}'
            + '.site-lang-toggle button.active{background:#FF6B6B;color:#fff}'
            + '.site-lang-toggle button:focus-visible{outline:3px solid #4ECDC4;outline-offset:2px}';
        document.head.appendChild(style);
    }

    function mountToggle(container) {
        injectStyles();
        const box = document.createElement('div');
        box.className = 'site-lang-toggle';
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', 'Language / Langue');
        box.innerHTML = '<button type="button" data-set-lang="en" lang="en">EN</button>'
            + '<button type="button" data-set-lang="fr" lang="fr">FR</button>';
        box.addEventListener('click', event => {
            const button = event.target.closest('[data-set-lang]');
            if (button) set(button.dataset.setLang);
        });
        if (!container) box.classList.add('floating');
        (container || document.body).appendChild(box);
        apply();
        return box;
    }

    function speak(en, fr, options) {
        if (!('speechSynthesis' in window)) return null;
        const opts = options || {};
        const text = lang === 'fr' ? fr : en;
        const utterance = new SpeechSynthesisUtterance(text);
        const code = lang === 'fr' ? 'fr' : 'en';
        utterance.lang = code === 'fr' ? 'fr-CA' : 'en-US';
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.toLowerCase() === utterance.lang.toLowerCase())
            || voices.find(v => v.lang.toLowerCase().startsWith(code));
        if (voice) utterance.voice = voice;
        utterance.rate = opts.rate || 1;
        utterance.pitch = opts.pitch || 1.15;
        if (opts.cancel !== false) window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return utterance;
    }

    // Friendly mouse pointers for the whole site (this script is on every page): a chunky pink arrow,
    // and a teal arrow with a little star over things to tap. Pages can use var(--cursor-tap) too.
    // Games that set their own cursor on an element (grab, crosshair, none) keep it.
    function injectCursor() {
        if (document.getElementById('site-cursor-style')) return;
        const arrow = 'M5 4 L5 25 L10.5 20 L14.5 28.5 L19 26.5 L15 18.5 L22.5 18.5 Z';
        const svg = (fill, extra) => 'url("data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">'
            + '<path d="' + arrow + '" fill="none" stroke="#3D3551" stroke-width="5" stroke-linejoin="round"/>'
            + '<path d="' + arrow + '" fill="' + fill + '" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>'
            + (extra || '') + '</svg>') + '") 5 4';
        const star = '<path d="M25 2.5 L26.6 6 L30.3 6.4 L27.5 8.9 L28.3 12.6 L25 10.7 L21.7 12.6 L22.5 8.9 L19.7 6.4 L23.4 6 Z" fill="#FFD54A" stroke="#3D3551" stroke-width="1.3" stroke-linejoin="round"/>';
        const style = document.createElement('style');
        style.id = 'site-cursor-style';
        style.textContent = ':root{--cursor-arrow:' + svg('#FF6B8B') + ',auto;--cursor-tap:' + svg('#3FC9C0', star) + ',pointer}'
            + 'html{cursor:var(--cursor-arrow)}'
            + 'a[href],button,[role="button"],label,select,summary,input[type="checkbox"],input[type="radio"]{cursor:var(--cursor-tap)}'
            + 'button:disabled{cursor:var(--cursor-arrow)}';
        (document.head || document.documentElement).appendChild(style);
    }
    injectCursor();

    // Keep tabs in sync when the language is changed in another tab.
    window.addEventListener('storage', event => {
        if (event.key === KEY && (event.newValue === 'en' || event.newValue === 'fr') && event.newValue !== lang) {
            lang = event.newValue;
            apply();
            listeners.forEach(fn => fn(lang));
        }
    });

    window.BabyLang = {
        get lang() { return lang; },
        set,
        t: (en, fr) => (lang === 'fr' ? fr : en),
        onChange: fn => listeners.push(fn),
        apply,
        mountToggle,
        speak
    };

    function ready() {
        document.querySelectorAll('[data-lang-toggle]').forEach(mountToggle);
        apply();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
    else ready();
}());
