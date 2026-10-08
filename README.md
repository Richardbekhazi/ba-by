# 🍼 ba-by.ca – Baby-Friendly Games Website

Welcome to **ba-by.ca**, a collection of simple, fun, touch-friendly baby games designed for toddlers and young children.  
This project is hosted using **GitHub Pages** and contains multiple mini-game folders.

---

## 🎮 Project Structure

ba-by.ca/
│
├─ index.html → Main landing page (clouds, sun, 3D cards)
├─ assets/ → Images, CSS, JS (optional future use)
│ ├─ images/
│ ├─ css/
│ └─ js/
│
├─ abc/
├─ colors/
├─ sounds/
├─ puzzles/
├─ rooftoprush/
├─ dino/
├─ shapes/
└─ numbers/


Each game folder contains its own **index.html**, so the route becomes:

- a-by.ca/abc/
- a-by.ca/colors/
- a-by.ca/sounds/
- …and so on.

---

## 🚀 Deployment

This project is intended for **GitHub Pages**:

1. Create a repo with the name you want.
2. Push all project files into the repo.
3. In GitHub → *Settings → Pages* → choose  
   **Source: main branch → root folder**.
4. Add your custom domain **ba-by.ca**.
5. Enable HTTPS.

GitHub will automatically serve:

https://ba-by.ca


---

## ➕ Adding New Games

To add a new game:

1. Create a folder in the root (e.g. /animals/)
2. Add an index.html inside it
3. Add a new card on the homepage pointing to /animals/

---

## ✨ Features

- Baby-friendly UI (large icons, big buttons)
- Animated background: sun, clouds
- 3D tilt cards
- Touch-based sparkle effects
- Works on all devices (tablet, phone, PC)
- Easy to extend with new games

### Puzzle controls and mobile layout

- Drag each piece to its matching outline; tapping or double-clicking does not automatically solve it.
- The board and piece tray resize for the screen and difficulty, with a side-by-side layout on short landscape screens.
- On very small screens, the page can scroll so all pieces remain reachable.

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

---

## 👨‍💻 Author

Built by **Richard Bekhazi** with the help of AI.  
Designed for toddlers—including Richie 🍼💙

---

## ❤️ License

This project is open for personal use.  
Game assets or media may require their own licenses.
