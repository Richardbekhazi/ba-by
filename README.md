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
| ABC Time | `/abc/` | Find the picture that goes with each letter, 8 levels (see below) |
| Colors | `/colors/` | Jelly colour friends: play, find and mix (see below) |
| Numbers | `/numbers/` | Count 1-2-3 to a party |
| Shapes | `/shapes/` | Pop the shapes |
| Sounds | `/sounds/` | Make your own music |
| Animal Sounds | `/animals/` | Who says moo? |
| Puzzles | `/puzzles/` | Drag each piece into place, 12 levels (see below) |
| Key Letter | `/keyboard-letter/` | Press a key on the keyboard, meet the letter |

### 🫶 Gentle Play

| Game | Folder | What it is |
| --- | --- | --- |
| Animal Wash | `/animal-wash/` | Bath time for a puppy, piglet or bunny |
| Little Car Garage | `/car-garage/` | Wash, paint and drive a car, bus or truck |
| My Tiny Garden | `/tiny-garden/` | Plant, water and harvest |
| Finger Painting | `/finger-paint/` | Draw rainbows and stamp stars |

### 🚀 Action Games

| Game | Folder | What it is |
| --- | --- | --- |
| Bubble Hero | `/bubbles/` | Pop the Grumpies with bubbles (see below) |
| Jump! (Rooftop Rush) | `/rooftoprush/` | A cat hops from roof to roof, collecting coins for new skins |
| Rooftop Santa | `/rooftopsanta/` | Deliver presents down star chimneys (see below) |
| Tetris (Stacky Smiles) | `/tetris/` | Stack the smiley blocks |

---

## 🗂️ Project Structure

```
ba-by/
├─ index.html          → Homepage (sky, sun, clouds, grouped game cards)
├─ CNAME               → Custom domain: ba-by.ca
├─ ba-by logo.png
├─ assets/
│  ├─ css/             → Shared toddler styles + one stylesheet per toddler activity
│  ├─ js/              → site-lang.js (EN/FR), toddler helpers, one module per toddler activity
│  └─ badges1/         → Badge/reward icons used by Bubble Hero
├─ abc/  colors/  numbers/  shapes/  sounds/  animals/  puzzles/  keyboard-letter/
├─ animal-wash/  car-garage/  tiny-garden/  finger-paint/
└─ bubbles/  rooftoprush/  rooftopsanta/  tetris/
```

Most games are a single self-contained `index.html`. `numbers/` and `sounds/` also have
their own sound/icon folders, and `tetris/` has a `background.svg`.

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
2. Add an `index.html` inside it, loading `/assets/js/site-lang.js` for English/French.
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
Games with their own toggles (ABC, Colors, Numbers, Key Letter and the toddler
activities) save their choice to the same shared setting.

### Puzzle controls and mobile layout

- Drag each piece to its matching outline; tapping or double-clicking does not automatically solve it.
- Picking up a piece plays its theme's sound (Shapes: boing, Fruits: plop, Animals: squeaky toy, Transport:
  car horn, Yummy Food: twinkle), with a slightly different pitch each time. The piece's name is spoken (in English or French) only when it
  is dropped in the right place; a wrong drop just gives a gentle wobble and a soft low tone.
- There are 12 levels. A level is one puzzle of each theme with the same number of pieces
  (3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9). Levels 1-6 use Shapes, Fruits, Animals and Transport; clearing
  level 6 unlocks a fifth theme, Yummy Food, so levels 7-12 have 5 puzzles. Play flows automatically from
  puzzle to puzzle; the "Level N" badge shows the level and the dots show which of its puzzles the child
  is on. After level 12 is cleared, play continues on level 12.
- The start screen offers "Continue" (the furthest puzzle reached, saved in `localStorage` key
  `puzzles-progress`) and "Start from the beginning". On a first visit it shows a single "Play!" button.
- "Choose your level" opens the 12 levels; only fully cleared levels can be picked, the rest show a lock.
  The button itself stays locked until level 1 is cleared.
- The board and piece tray resize for the screen and difficulty, with a side-by-side layout on short landscape screens.
- On very small screens, the page can scroll so all pieces remain reachable.

### ABC Time (`/abc/`)

- A big jelly letter block drops in and the game says "A is for Apple. Can you find the apple?"
  The child taps the matching picture card; each card shows the word with its first letter coloured
  in that letter's colour.
- The right picture jumps onto the letter block with sparkles; a wrong tap wobbles, says that word
  and fades the card, so the child is never stuck.
- 8 levels with 2, 2, 3, 3, 4, 4, 5 and 6 pictures. Five right answers fill five stars and move on
  to the next level automatically.
- The start screen works like Puzzles: "Continue", "Play!" / "Start from the beginning" and
  "Choose your level" (locked until level 1 is cleared). Tapping the A, B, C blocks says the letter.
- Progress is saved in `localStorage` keys `abc-level` (level to continue) and `abc-cleared`
  (levels cleared). Saves from the old version are converted automatically.

### Colors (`/colors/`)

- The start screen has three big picture cards (Play, Find, Mix) with animated jelly illustrations and a
  single short word, so children can choose without reading. Cards squish with a sound when tapped;
  they sit two-plus-one on phones and in one row on PC and landscape screens.
- 11 basic colours (red, orange, yellow, green, blue, purple, pink, brown, black, white, gray), each a
  rounded-square "jelly friend" with a face and a matching example (🍎, 🐸, 🐳...).
- **Play with colors**: tap a jelly to hear its name and note; it squishes, smiles and tints the background.
- **Find the color**: "Where is red? 🍎" with 2, 3, 4 then 6 choices. Five correct answers earn a level;
  the level is saved in `localStorage` key `colors-find-level`. Wrong taps only wobble (no voice).
- **Mix colors**: tap two paint drops (red, yellow, blue, white); they swirl together and a new jelly pops
  out ("Red and yellow make orange!"). A recipe book tracks the 6 mixes to discover (orange, green,
  purple, pink, sky blue, light yellow), saved in `localStorage` key `colors-mixes`, with a celebration
  when all are found.

### Bubble Hero (`/bubbles/`)

- A star hero shoots bubbles to calm the Grumpies. Touch steering is relative (drag anywhere to move).
- Hits cost health, followed by a short invulnerable moment; combos reward quick pops.
- Levels end in a boss fight with a health bar; powers can be collected and levelled up.
- Start, pause and game-over screens, a mute button, French text, and the best level saved in the browser.
- The game loop is frame-rate independent and the canvas stays crisp on high-resolution screens.

### Rooftop Santa (`/rooftopsanta/`)

- Santa runs across rooftops, grabs presents into his sack and jumps over glowing star chimneys to
  deliver them; delivery streaks build a multiplier.
- Obstacles and helpers: roof gaps (Rudolph rescues Santa), light strings to slide under and
  waddling penguins; power-ups are a magnet, sleigh flight and a snow globe.
- Cozy and Speedy modes, first-time hints, toy-style menus in English/French.
- The best score and total presents delivered are saved in the browser.

### Gentle toddler activities

Four additional games use original vector illustrations, large touch controls,
English/French instructions, a mute button, and spoken help. There are no timers,
scores, adverts, purchases, or losing screens.

- **Animal Wash** (`/animal-wash/`): rub or tap to remove mud, rinse the bubbles,
  and meet a puppy, piglet, or bunny. Tickle the animals, splash in the bath,
  pop a floating bubble party, and try silly hats without resetting the bath.
  Space/Enter cleans spots or pops an active party bubble.
- **Little Car Garage** (`/car-garage/`): wash a car, bus, or truck, choose its
  paint color, honk, and explore a continuous pretend drive. Tap a bunny,
  balloons, or a puddle; switch between meadow, beach, and evening roads.
  The Garage button returns home whenever the child is ready.
- **My Tiny Garden** (`/tiny-garden/`): choose flower, strawberry, or sunflower
  seeds in independent pots, then water, add sunshine, and harvest. Tap each
  pot to help it grow, collect a little basket, and greet rotating animal visitors.
- **Magic Finger Painting** (`/finger-paint/`): draw, stamp stars or flowers,
  erase, and switch optional outlines. Rainbow strokes, hearts, glitter,
  and a non-destructive stamp dance add playful surprises.
  Undo also recovers a cleared painting.
  Arrow keys move the drawing cursor; Space/Enter paints at that point.

Shared styles and interaction/audio helpers live in `assets/css/toddler-play.css`
and `assets/js/toddler-play.js`. Each activity has its own module in `assets/js/`.
Art survives viewport changes while the page remains open; paintings are not
uploaded or saved across visits. Sound starts only after interaction and uses
browser-generated tones and optional device speech synthesis. Supervised,
short play sessions are recommended for ages 2-3.

Scenes keep their artwork proportions in portrait and landscape so overlaid
touch buttons stay aligned with the characters and pots. Garage scene buttons
also support Enter/Space without triggering a different road action, and road
choices retain their accessible label when sound is toggled.
Painting caches finished strokes instead of redrawing the full undo history on
every finger movement, while preserving clear recovery and the 50-step history.

The four toddler pages use `assets/js/toddler-loader.js` to show loading errors
and a reload option rather than leaving an empty scene. Their stylesheet, loader,
game modules, and shared module imports carry a matching release query parameter
to prevent older cached helpers from breaking newer games. When deploying changes
to these assets, update the release identifier in all four HTML pages, the loader,
and all four game-module imports together.

### Saved progress

Nothing is uploaded; progress is kept in the browser's `localStorage`:

| Key | Used by |
| --- | --- |
| `baby-lang` | Whole site: chosen language |
| `abc-level`, `abc-cleared` | ABC Time: level to continue and levels cleared |
| `puzzles-progress` | Puzzles: furthest puzzle reached |
| `colors-find-level` | Colors: Find the color level |
| `colors-mixes` | Colors: mixes discovered |
| `rr_coins`, `rr_skins`, `rr_current_skin` | Jump! (Rooftop Rush): coins and unlocked skins |

Bubble Hero and Rooftop Santa also save their best results in the browser.

---

## 👨‍💻 Author

Built by **Richard Bekhazi** with the help of AI.
Designed for toddlers—including Richie 🍼💙

---

## ❤️ License

This project is open for personal use.
Game assets or media may require their own licenses.
