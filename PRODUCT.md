# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Toddlers (the youngest players are around 2 years old) playing on a phone, tablet or PC, usually with a parent nearby. Children cannot read yet, so every game must be playable from pictures, sound and speech; the parent handles menus such as language, level choice and going home.

## Product Purpose
ba-by.ca is a free collection of gentle learning and play games for young children (letters, colours, numbers, shapes, sounds, animals, puzzles, pretend play and a few simple action games). Success is a child who can play alone for a few minutes, hears clear spoken feedback, and never hits a dead end or a losing screen.

## Capabilities and Constraints
- Plain static HTML/CSS/JS, no build step, hosted on GitHub Pages at ba-by.ca.
- English and French everywhere through `assets/js/site-lang.js` (shared `baby-lang` setting).
- Speech uses the device's speech synthesis; sounds are browser-generated tones that start only after a tap.
- Progress lives only in the browser's `localStorage`; nothing is uploaded.
- No ads, purchases, timers or fail states.

## Product Principles
- Pictures and voice first: a 2-year-old must never need to read.
- Mistakes are gentle: a wobble and a soft sound, never a buzzer or a lost turn.
- Difficulty grows slowly and automatically; parents can still pick a level.
- Big touch targets that work in portrait and landscape.

## Accessibility & Inclusion
Large tap targets, keyboard focus on every control, reduced-motion support, bilingual EN/FR speech.
