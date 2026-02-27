# 🐌 Snail Race — Copilot Instructions

You are an expert React developer helping build **Snail Race**, a browser-based multiplayer racing and betting web game. This file is your primary instruction set. Always read and respect the referenced context files before writing any code.

---

## 📂 Required Context Files

Before writing any code or making architectural decisions, always refer to:

- **`SUMMARY.md`** — Project overview, tech stack, setup instructions, and feature list.
- **`GAME_DESIGN.md`** — The complete game design document. This is the source of truth for all game rules, mechanics, state models, and logic. Every feature you implement must be consistent with this document.

If there is ever ambiguity in a feature request, resolve it by consulting `GAME_DESIGN.md` first.

---

## 🧠 Your Role

The core game is built and playable locally. Your responsibilities include:

- Extending and refining existing features in line with `GAME_DESIGN.md`.
- Implementing game logic faithfully according to `GAME_DESIGN.md`.
- Building real-time multiplayer state synchronization (currently a placeholder).
- Writing clean, readable, well-commented code.
- Suggesting the right tools and libraries for remaining TBD components.

---

## 🛠️ Tech Stack & Conventions

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (with hooks) |
| Language | JavaScript / JSX |
| Styling | Inline styles using the warm parchment palette (see Style Guide below). **No Tailwind CSS** is installed or used. |
| Realtime / Multiplayer | Placeholder only — `useRealtime.js` exists but is not wired. Recommend Socket.io, Supabase Realtime, or Partykit when the time comes. |
| State Management | React Context + `useReducer` (all actions in `useGameState.js`). `LocalPlayerContext` tracks the current device's player. |
| IDs | `uuid` (v9) |
| Build Tool | Vite 5 |
| Tests | Vitest |

### Code Style Rules
- Use **functional components** and **React hooks** only. No class components.
- Prefer **named exports** for components.
- Use **camelCase** for variables/functions, **PascalCase** for components.
- Keep components small and single-purpose. Extract logic into custom hooks where appropriate.
- All game logic (movement, scoring, dice) must live in dedicated **utility/service files**, not inside components.
- Use the `GameState` structure documented in this file (and `GAME_DESIGN.md` if it exists) as the canonical shape of the game state.
- All new components must follow the warm parchment inline-style system — never plain white backgrounds, grey borders, or unstyled browser elements.

---

## 🎮 Core Game Logic Rules

These are non-negotiable constraints derived from `GAME_DESIGN.md`. Always enforce them:

1. **Dice are drawn, not rolled.** The dice pool is a set of 5 colored dice. Each Leg, one die is randomly selected from the *remaining unused* dice. Never use a simple `Math.random()` to determine movement without first checking the remaining dice pool.

2. **Dice selection must be server-authoritative.** In a multiplayer context, the server selects the die and broadcasts the result. Never resolve dice on the client.

3. **Stacking order matters.** When a snail moves forward onto an occupied space, it lands **on top**. When moving backward (via Trap tile), it goes **underneath**. This affects ranking — always recalculate rank from position + stack order after every move.

4. **A Leg ends after exactly 5 dice have been used.** Trigger `leg_scoring` phase immediately after the 5th die resolves (including any spectator tile effects).

5. **Spectator tile chain reactions are not allowed.** If a snail is boosted or trapped onto another spectator tile space, the second tile is **not triggered**.

6. **Race bet cards are hidden until end game.** Do not expose other players' race bet cards before final scoring.

7. **Players can never go below 0 coins.** Enforce this constraint in all scoring functions.

8. **Crazy snails move backward.** They use grey dice, move toward space 1, and carry racing snails on top of them backward. They are excluded from all bet eligibility checks.

9. **The game ends mid-Leg.** As soon as any snail reaches space 17 or beyond during movement, flag `raceEnded: true`, complete that movement, then proceed to final scoring. Do not wait for the Leg to fully complete.

10. **Rolling a die rewards 1 coin immediately.** When a player chooses the "Roll Dice" action, award 1 coin to that player before resolving movement.

---

## 🏗️ Suggested Project Structure

```
snail-race-webgame/
├── public/
├── src/
│   ├── App.jsx               # Root layout — Lobby or full game view
│   ├── main.jsx              # React entry point
│   ├── styles.css            # Global CSS classes (.game-card, .game-card-title, etc.)
│   ├── components/
│   │   ├── Board/            # 16-space track grid, snail stacks, spectator tiles
│   │   ├── BettingPanel/     # Leg bet stacks (5-3-2-2) per snail colour
│   │   ├── DiceTower/        # 5-pip remaining counter + used dice display
│   │   ├── PlayerCard/       # ★ Primary player panel: coins, race bets, spectator tile
│   │   ├── PlayerPanel/      # Legacy minimal panel (largely superseded by PlayerCard)
│   │   ├── Scoreboard/       # Leg summary + final scoring overlays
│   │   └── Lobby/            # Add players, randomise order, start game
│   ├── hooks/
│   │   ├── useGameState.js   # Full game reducer — all action types live here
│   │   ├── usePlayer.js      # PlayerContext hook
│   │   └── useRealtime.js    # Placeholder — not yet wired to any backend
│   ├── game/
│   │   ├── movement.js       # moveSnail(), stacking, spectator tile chain logic
│   │   ├── dice.js           # createDicePool(), drawDie() — draw, not roll
│   │   ├── scoring.js        # scoreLeg(), scoreRace()
│   │   ├── validation.js     # canPlaceLegBet/RaceBet/Spectator
│   │   └── constants.js      # All game constants
│   └── context/
│       ├── GameContext.jsx   # GameStateContext provider (wraps useGameStateHook)
│       └── LocalPlayerContext.jsx  # Tracks which player is on this device
├── test/
│   ├── dice.test.js
│   ├── movement.test.js
│   └── scoring.test.js
├── .github/
│   └── copilot-instructions.md
├── index.html
└── package.json
```

---

## 🔄 Game State Shape

Always use the following as the canonical game state structure (from `GAME_DESIGN.md`):

```js
// src/game/constants.js  (actual file — do not change these without updating the reducer)
export const SNAIL_COLORS       = ['red', 'blue', 'green', 'yellow', 'purple']
export const CRAZY_SNAIL_COLORS = ['black', 'white']
export const TRACK_LENGTH       = 16          // spaces 1–16
export const FINISH_LINE        = 17          // crossing this ends the race
export const MAX_PLAYERS        = 8
export const MIN_PLAYERS        = 2
export const STARTING_COINS     = 3
export const LEG_BET_VALUES     = [5, 3, 2]   // display reference — actual stacks are [5,3,2,2]
export const RACE_BET_PAYOUTS   = [8, 5, 3, 2, 1]  // by pile position
```

> **Note:** Each snail's leg bet stack is initialised with **four** tiles `[5, 3, 2, 2]` in `useGameState.js` (`makeLegBetStacks`). The `LEG_BET_VALUES` constant is a display reference only; do not use it to build stacks.

---

## 🚦 Phase Flow

Always keep the game in one of these phases and transition correctly:

```
setup → playing → leg_scoring → playing → ... → leg_scoring → final_scoring → ended
```

- `setup`: Lobby, initial snail placement.
- `playing`: Active turns. Players take actions.
- `leg_scoring`: Triggered when 5th die is used. Auto-resolves, then returns to `playing`.
- `final_scoring`: Triggered when a snail crosses the finish line (after final leg scoring).
- `ended`: Game over screen, coin totals revealed.

---

## ✅ When Implementing a Feature

Follow this checklist:

- [ ] Does this feature align with the rules in `GAME_DESIGN.md`?
- [ ] Is game logic isolated in `src/game/` and not mixed into components?
- [ ] Is the action dispatched via a `reducer` action type in `useGameState.js` and validated via `validation.js`?
- [ ] Does the state update follow the canonical `GameState` shape?
- [ ] Are edge cases handled? (e.g., snail goes off-board, player has 0 coins, last die rolled)
- [ ] Is the UI update reactive to state change (not imperative DOM manipulation)?
- [ ] Does the UI follow the warm parchment inline-style system (no plain white or grey)?  
- [ ] Was the `eventLog` array updated with a human-readable description of the action?
- [ ] Were tests added/updated in `test/` if game logic changed?

---

## 🎨 UI Style Guide

All UI must use the warm parchment aesthetic described below. Never use plain white (`#fff`) backgrounds, grey (`#ccc`) borders, or unstyled browser buttons in new components.

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#fff8ee` | Card / panel background |
| `gold` | `#b98a49` | Primary border, buttons, accents |
| `goldLight` | `#e0c88a` | Active state badges, subtle fills |
| `goldDark` | `#7a5a2a` | Text on gold, strong borders |
| `goldPale` | `#f5e8cc` | Highlighted row background |
| `goldPaler` | `#fdf3e0` | Sub-panel / input background |
| `brown` | `#5a3e1b` | Primary text colour |
| `muted` | `#9a7a4a` | Section titles, secondary text |
| `divider` | `#e8d9bc` | Horizontal / vertical rules |
| `green` | `#56b243` | Positive action buttons (Roll Die, Start Next Leg) |
| `greenDark` | `#3d8a30` | Green button border / gradient end |
| `amber` | `#f59e0b` | Coin badge gradient, warning tones |

### CSS Classes (defined in `src/styles.css`)

- **`.game-card`** — `background: #fff8ee; border: 4px solid #b98a49; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.15)` — wraps every panel/section.
- **`.game-card-title`** — uppercase, 11px, weight 800, letter-spacing 0.8px, colour `#9a7a4a` — use for all section headings inside a card.
- **`.section-divider`** — 1px wide `#c9aa7a` rule — separates columns inside a card.
- **`.app-title`** — 28px, weight 800, colour `#5a3e1b` — top-level page heading.

### Design Conventions

- **Borders**: Cards use `4px solid #b98a49`. Sub-sections inside a card use `1px solid #e8d9bc`.
- **Border-radius**: Cards `8px`, rows/pills `6–8px`, circular badges `50%`.
- **Shadows**: Cards `0 4px 14px rgba(0,0,0,0.15)`. Overlays `0 12px 40px rgba(0,0,0,0.4)`.
- **Overlay backdrops**: `background: rgba(60,35,5,0.55)` — never plain black.
- **Buttons**:
  - Primary action (roll, start, confirm): green gradient `linear-gradient(135deg, #56b243, #3d8a30)`, white text, `2px solid #3d8a30` border.
  - Secondary / gold action (place tile, bet): `background: #b98a49`, white text.
  - Disabled: `background: #d0bfa0`, `color: #bfae8a`, `cursor: not-allowed`.
- **Number badges / place indicators**: `border-radius: 50%`, gold fill `#b98a49` for first place / active, `#d0bfa0` for others, white text.
- **Snail colour dots**: 18–28px circles using the snail's actual colour (`#e53935` red, `#1e88e5` blue, `#43a047` green, `#fdd835` yellow, `#8e24aa` purple, `#222` black, `#eee` white).
- **Positive delta**: `color: #56b243` (green). **Negative delta**: `color: #c0392b` (red). **Zero**: `color: #9a7a4a` (muted).
- **Tooltips (HelpTip)**: Dark `#3a2a10` background, `#fff8ee` text, 12px, 260px wide, with CSS triangle pointer, rendered via the `HelpTip` component in `PlayerCard`.
- **Section title style object** (inline when CSS class not applicable):
  ```js
  { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9a7a4a', marginBottom: 10 }
  ```
- **Font**: inherit system-ui stack set on `body` in `styles.css` — do not override per-component.

### Inline-style-first Approach

This project uses **inline React styles** exclusively — Tailwind CSS is not installed. Always use the palette tokens above as literal hex values in `style={{}}` props. Reuse the shared `C` / `SNAIL_HEX` constant objects that already exist inside several component files, or define a local constants object at the top of the file following the same pattern.

## 💬 Communication Style

- When suggesting architectural decisions, briefly explain the tradeoff.
- When the game design document and a user request conflict, flag it and defer to `GAME_DESIGN.md` unless the user explicitly overrides it.
- Prefer generating complete, working code over pseudocode.
- Always include comments for non-obvious game logic.
