# 🍼 ba-by.ca – Baby-Friendly Games Website

Welcome to **ba-by.ca**, a collection of simple, fun, touch-friendly baby games designed for toddlers and young children.
It is a plain static site (HTML, CSS and JavaScript, no build step) hosted on **GitHub Pages**.

---

## 🎮 Games

The homepage groups the games into three sections. Each game lives in its own folder
with its own `index.html`, so its address is `https://ba-by.ca/<folder>/`.

### 📚 Learn & Play

| Game | Folder | What it is |
| --- | --- | --- |
| ABC Time | `/abc/` | Meet the letters, find the picture and pop letter balloons (see below) |
| Colors | `/colors/` | Jelly colour friends: meet, find, mix and paint a picture (see below) |
| Numbers | `/numbers/` | Play (tap numbers for a burst of fun), Count and Feed (see below) |
| Shapes | `/shapes/` | Pop the shapes |
| Music Box | `/sounds/` | Real instruments, a rainbow xylophone with songs, an animal choir |
| Animal Safari | `/animals/` | Farm, wild and faraway animals with real sounds, plus a listening game |
| Puzzles | `/puzzles/` | Shape puzzles (12 levels) and picture puzzles (see below) |
| Key Letter | `/keyboard-letter/` | Press a key on the keyboard, meet the letter |

### 🫶 Gentle Play

| Game | Folder | What it is |
| --- | --- | --- |
| Animal Wash | `/animal-wash/` | Scrub, rinse, dry and dress up a puppy, piglet, kitten or bunny |
| Little Car Garage | `/car-garage/` | Wash, fix, paint and drive a car, bus or truck |
| My Tiny Garden | `/tiny-garden/` | Plant, water, give sunshine and harvest, day or night |
| Finger Painting | `/finger-paint/` | Crayons, rainbow, sparkles, bubbles and stamps, with music |

### 🚀 Action Games

| Game | Folder | What it is |
| --- | --- | --- |
| Bubble Hero | `/bubbles/` | Pop the Grumpies with bubbles (see below) |
| Jump! | `/rooftoprush/` | Kitty's rooftop adventure: run, jump and collect fish across 5 worlds |
| Rooftop Santa | `/rooftopsanta/` | Run the snowy rooftops and grab presents (see below) |
| Tetris (Stacky Smiles) | `/tetris/` | Stack the smiley blocks to make lines, 6 levels (see below) |

---

## 🗂️ Project Structure

```
ba-by/
├─ index.html          → Homepage (sky, sun, clouds, grouped game cards)
├─ CNAME               → Custom domain: ba-by.ca
├─ ba-by logo.png
├─ assets/
│  ├─ css/kit.css      → The shared toy look used by every Learn and Gentle Play game
│  ├─ js/kit.js        → Shared sound, voice, screens, levels and celebrations (window.Kit)
│  ├─ js/site-lang.js  → English / French for the whole site
│  └─ badges1/         → Badge/reward icons used by Bubble Hero
├─ abc/  colors/  numbers/  shapes/  sounds/  animals/  puzzles/  keyboard-letter/
├─ animal-wash/  car-garage/  tiny-garden/  finger-paint/
└─ bubbles/  rooftoprush/  rooftopsanta/  tetris/
```

Each game is one `index.html` built on the shared kit. `numbers/` and `sounds/` also have
their own sound/icon folders.

---

## 🖥️ Running Locally

Any static file server works. From the project folder:

```bash
python -m http.server 8123
```

Then open http://localhost:8123. The same server is set up as the `site` preview
in `.claude/launch.json` (with a second one, `site-alt`, on port 8127).

---

## 🚀 Deployment

The site is served by **GitHub Pages** from the `main` branch, root folder, with the
custom domain **ba-by.ca** (set in `CNAME`) and HTTPS enabled. Pushing to `main`
publishes the changes at https://ba-by.ca.

---

## ➕ Adding New Games

1. Create a folder in the root (e.g. `/farm/`).
2. Add an `index.html` inside it, loading `/assets/css/kit.css`, `/assets/js/site-lang.js` and then
   `/assets/js/kit.js`. `Kit.topbar()` adds the home, back, sound and EN/FR buttons; `Kit.show(screen)`
   switches screens; `Kit.say(en, fr)`, `Kit.sfx.*`, `Kit.cheer()` and `Kit.confetti()` do the rest.
3. Add a card for it in the right section of the homepage `index.html`
   (with `data-fr` text for the French title and description).

---

## ✨ Features

- Baby-friendly UI (large icons, big buttons, picture choices that need no reading)
- Homepage with a bouncy colour logo, sun, clouds and hills; games grouped into
  Learn, Gentle Play and Action sections with jump links and age hints
- "Play again" shortcut on the homepage for the last game played
- Touch sparkle effects
- Works on all devices (tablet, phone, PC), in portrait and landscape
- English and French throughout
- Easy to extend with new games

### English / French

Every page loads `assets/js/site-lang.js`, which remembers the chosen language
(`localStorage` key `baby-lang`, defaulting to the browser language) across the
whole site. The homepage and most games show an EN / FR toggle; the arcade games
follow the language picked on the homepage. To translate static text, add a
`data-fr="..."` attribute (or `data-fr-aria-label` / `data-fr-title`); for text
built in JavaScript use `BabyLang.t(english, french)` and `BabyLang.speak(english, french)`.
Games built on the toy kit show the EN / FR toggle in their top bar and save to the same
shared setting; the 🔊 button there mutes every kit game (`baby-muted`).

### Puzzle controls and mobile layout

- **Shape puzzles**: drag each piece onto its matching shadow. Picking up a piece plays its theme's
  sound and says its name; a wrong drop slides it back with a gentle wobble. After a few seconds of
  waiting, the right shadow for the first piece pulses as a hint.
- 12 levels: one puzzle of each theme with 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8 and 9 pieces. Levels 1-6 use
  Shapes, Fruits, Animals and Things that go; level 7 adds Yummy food. Progress is saved as soon as a
  puzzle is solved (`puzzles-progress`), and "Choose a level" opens every cleared level.
- **Picture puzzles**: a drawn scene (farm, sea, space, rainbow) is cut into 2, 4, 6 then 9 tiles; a faint
  copy of the picture on the board helps toddlers. Four pictures earn the next size (`puzzles-picture-level`).
- Pieces and the board resize to the screen; dragging works with one finger, a pen or a mouse.

### ABC Time (`/abc/`)

- **Meet the letters**: one big letter at a time, A to Z, with its picture friends as big cards below.
  Tapping a picture says "U is for umbrella!"; once every friend of the letter is met, the next letter
  comes by itself. Big arrows (or the arrow keys / any letter key) go back and forward, and a small A-Z
  strip shows the letters already met (`abc-seen`), with a party when all 26 are found.
- **Find the picture**: the letter sits above "A is for apple. Find the apple!" with 2 up to 6 pictures
  (in one row on wide screens). The right picture hops onto the letter block; a wrong tap says that word
  and fades. Five stars earn a level (`abc-level`).
- **Letter balloons**: free play over the whole screen. Balloons with letters float up; pop any one and it
  says its letter. No orders, levels or wrong answers. Words always start with their letter in both
  English and French.

### Colors (`/colors/`)

- 11 basic jelly colour friends with faces and matching examples (🍎, 🐸, 🐳...).
- **Meet the colors**: 25 jellies (the 11 basic ones plus light blue, dark blue, turquoise, light and dark
  green, gold, light yellow, peach, coral, dark red, magenta, lavender, beige and silver). Tap one to hear
  its name; it squishes, smiles and tints the page.
- **Find the color**: "Where is red?" with 2, 3, 4 then 6 basic jellies; five right answers earn a level
  (`colors-find-level`).
- **Mix colors**: tap a paint (red, yellow, blue, white, black) and a drop flies into the big bowl; tap a
  second one and the bowl swirls, then a jelly of the new colour jumps out ("Red and yellow make
  orange!"). Pairs that are not a recipe make muddy brown. The recipe book tracks the 7 mixes
  (`colors-mixes`).
- **Paint the picture**: a random picture (house, fish, rainbow, flower, car, ice cream, butterfly,
  balloons, rocket or kitty) with a colour already picked, so the first tap paints. Tap a part to fill it;
  tapping a part that already has that colour moves on to the next colour, and tapping anywhere outside
  the picture paints a part that is still white. A finished picture gets a celebration.

### Numbers (`/numbers/`)

- Same style as Colors: three picture cards on the start screen (Play, Count, Feed).
- Number blocks 1-10 show the digit plus the same number of dots.
- **Play**: tap a block to hear the number; that many numbered items come out one by one with rising
  notes. The number voice can be English, French (site language), Tagalog (browser voice), or Arabic and
  Ilokano (recordings in `numbers/sounds/`), and each voice has its own effect: English balloons float
  up, French bouncy balls bounce on the floor, Tagalog butterflies flutter away, Arabic stars burst like
  fireworks, Ilokano fish swim across the screen.
- **Count**: "How many?" Tap each thing to count it out loud, then tap the matching number block below.
  The choices are always every number from 1 up, in order: level 1 shows 1-2, level 2 shows 1-3, and
  each level adds the next number up to 1-10 at level 9.
- **Feed**: "Give the bunny 3 carrots!" Tap food into the bowl (it counts out loud; tap food in the
  bowl to take it back). The animal hops happily at the right number. Levels go up to 3, 5, 7, 10.
- Five right answers earn the next level in Count and Feed; wrong taps only wobble (no voice).

### Jump! (`/rooftoprush/`)

- Kitty runs by itself; one tap (or Space / Up) jumps, and one extra double jump is allowed in the air.
  Late and early taps still count, so jumps feel fair for small hands.
- No game over: falling between roofs brings a bouncy cloud that puts the runner back on the next roof
  (2 fish are lost). If a child doesn't tap at a taller roof, the runner hops up by itself after a moment.
- **Adventure**: 15 short levels (about 30-50 seconds) in 5 worlds: City rooftops, Park treetops, Sunny
  beach, Snowy village and Outer space (floaty jumps). Fish arcs follow real jumps and are counted out
  loud; springs give big bounces. Each level ends at a flag where a lost kitten waits. Stars (1-3) depend
  on the fish collected; finishing a level unlocks the next one.
- **Endless**: an endless run that speeds up and travels through all five worlds.
- **Friends**: Kitty, Puppy, Bunny, Panda, Fox, Unicorn and Dragon unlock with stars (no prices or reading).
- Everything is drawn on a canvas by the game (no image files). Old Rooftop Rush coins become bonus stars once,
  and friends bought in the old game stay unlocked.

### Bubble Hero (`/bubbles/`)

- A star hero shoots bubbles to calm the Grumpies. Touch steering is relative (drag anywhere to move).
- Hits cost health, followed by a short invulnerable moment; combos reward quick pops.
- Levels end in a boss fight with a health bar; powers can be collected and levelled up.
- Start, pause and game-over screens, a mute button, French text, and the best level saved in the browser.
- The game loop is frame-rate independent and the canvas stays crisp on high-resolution screens.

### Rooftop Santa (`/rooftopsanta/`)

- Santa and Rudolph run along continuous rooftops in three lanes like a classic runner; presents are the
  only currency. Jump chimneys, snowmen and penguins, slide under strings of lights.
- Three seconds of safety after a bump, three hearts, power-ups (magnet, sleigh flight, snow globe),
  Cozy and Speedy modes, first-time hints and English/French menus.
- The best score and all-time presents collected are saved in the browser.

### Stacky Smiles (`/tetris/`)

A gentle falling-blocks game for about age 4, on a narrow 8 x 14 board with big smiley jelly blocks.

- 6 levels, each with its own sky: tiny pieces first, bigger ones step by step, a little faster each
  level. Five lines fill five stars and move to the next level with a fresh board.
- A dashed shadow shows where the piece will land. There is no game over: a tower that reaches the top
  pops away and play goes on.
- Controls: drag on the board to slide, tap to turn, flick down to drop; big ◀ ▶ (hold to repeat),
  turn and drop buttons; arrow keys and Space. Progress: `stacky-level`, `stacky-cleared`.

### Gentle toddler activities

Four calm games with no timers, scores or losing screens. Everything is done by rubbing or tapping,
the tool follows the finger, and spoken instructions can be repeated with 🔊.

- **Animal Wash** (`/animal-wash/`): opens straight into the bath. The puppy, piglet, kitten and bunny
  wait in a row beside the tub; tap one to swap who is bathing (each keeps its own mud and outfit).
  Every tool works at any time: scrub the mud with the sponge (bubbles appear), rinse with the shower,
  dry the drops with the towel, dress up (hat, bow, glasses, crown, scarf, flower) or splash mud back on.
  The tool that helps next gently pulses and is picked for the child when a part is done. Tap the pet
  to make it giggle and the duck to squeak.
- **Little Car Garage** (`/car-garage/`): opens straight into the garage. The car, bus and truck wait
  in a row beside it; tap one to swap (each keeps its own mud, wheels, paint and stickers). Every tool
  works at any time: rub off the mud with the sponge, tap each wobbly wheel with the wrench, paint it and
  add stickers, splash mud back on, or go for a drive along a rolling road with a horn and headlights
  (which also turn on the night sky). The tool that helps next gently pulses.
- **My Tiny Garden** (`/tiny-garden/`): opens straight into the garden. Three pots; pick a seed (tulip,
  strawberry, sunflower, carrot or tomato) and tap a pot, or tap an empty pot for a surprise seed. A bubble
  shows what each plant needs next (💧 or ☀️); tapping a pot with any tool gives it what it needs, so
  there are no wrong answers. Grown plants get a visitor and can be picked into the basket. The pots and
  basket are saved (`garden-pots`, `garden-basket`). Day / night switch with fireflies.
- **Finger Painting** (`/finger-paint/`): opens straight onto white paper. Crayon, rainbow, sparkles,
  bubbles, eight stamps and an eraser. The paper buttons switch between white, night (glowing colours),
  brown paper and a coloring page (butterfly, fish, flower) without erasing the painting. Notes play
  as you paint, higher at the top. Undo (10 steps) also brings back a cleared page.

### Saved progress

Nothing is uploaded; progress is kept in the browser's `localStorage`:

| Key | Used by |
| --- | --- |
| `baby-lang` | Whole site: chosen language |
| `abc-level`, `abc-seen` | ABC Time: Find level, letters met |
| `puzzles-progress`, `puzzles-picture-level` | Puzzles: furthest shape puzzle, picture puzzle size |
| `colors-find-level` | Colors: Find the color level |
| `colors-mixes` | Colors: mixes discovered |
| `numbers-count-level`, `numbers-feed-level` | Numbers: Count and Feed levels |
| `numbers-voice` | Numbers: Tagalog / Arabic / Ilokano number voice |
| `stacky-level`, `stacky-cleared` | Stacky Smiles: level to continue and levels cleared |
| `animals-quiz-level` | Animal Safari: "Who says that?" level |
| `garden-basket`, `garden-pots` | My Tiny Garden: what has been picked, what is growing |
| `baby-muted` | Kit games: sound on or off |
| `bubbles-save`, `bubbles-best` | Bubble Hero: saved run to continue, best level |
| `jump-stars`, `jump-friend`, `jump-endless-best` | Jump!: stars per level, chosen friend, best Endless fish |
| `jump-bonus` | Jump!: bonus stars carried over once from the old Rooftop Rush coins (`rr_coins`, `rr_skins`) |

Bubble Hero and Rooftop Santa also save their best results in the browser.

---

## 👨‍💻 Author

Built by **Richard Bekhazi** with the help of AI.
Designed for toddlers—including Richie 🍼💙

---

## ❤️ License

This project is open for personal use.
Game assets or media may require their own licenses.
