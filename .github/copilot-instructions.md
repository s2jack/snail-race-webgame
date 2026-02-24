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

You are building this project from scratch. Your responsibilities include:

- Scaffolding and structuring the React project cleanly.
- Implementing game logic faithfully according to `GAME_DESIGN.md`.
- Building real-time multiplayer state synchronization.
- Writing clean, readable, well-commented code.
- Suggesting the right tools and libraries when the stack has TBD components.

---

## 🛠️ Tech Stack & Conventions

| Layer | Technology |
|-------|-----------|
| Frontend | React (with hooks) |
| Language | JavaScript / JSX |
| Styling | Tailwind CSS (preferred) |
| Realtime / Multiplayer | To be decided — suggest Socket.io, Supabase Realtime, or Partykit when relevant |
| State Management | React Context + useReducer (for local), server-authoritative state for multiplayer |
| Build Tool | Vite |

### Code Style Rules
- Use **functional components** and **React hooks** only. No class components.
- Prefer **named exports** for components.
- Use **camelCase** for variables/functions, **PascalCase** for components.
- Keep components small and single-purpose. Extract logic into custom hooks where appropriate.
- All game logic (movement, scoring, dice) must live in dedicated **utility/service files**, not inside components.
- Use the `GameState` TypeScript-style structure defined in `GAME_DESIGN.md` as the canonical shape of the game state — even if the project uses plain JavaScript.

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
snail-race/
├── public/
├── src/
│   ├── components/
│   │   ├── Board/           # Track, spaces, snail rendering
│   │   ├── BettingPanel/    # Leg bets, race bets UI
│   │   ├── DiceTower/       # Dice pool display + roll trigger
│   │   ├── PlayerPanel/     # Coins, hand, spectator tile
│   │   ├── Scoreboard/      # End-leg and end-game results
│   │   └── Lobby/           # Room creation, player join
│   ├── hooks/
│   │   ├── useGameState.js   # Main game state hook
│   │   ├── usePlayer.js      # Local player context
│   │   └── useRealtime.js    # WebSocket / realtime sync
│   ├── game/
│   │   ├── movement.js       # Snail movement & stacking logic
│   │   ├── dice.js           # Dice pool management
│   │   ├── scoring.js        # Leg scoring, race scoring
│   │   ├── validation.js     # Action validation (legal moves)
│   │   └── constants.js      # Track length, snail colors, etc.
│   ├── context/
│   │   └── GameContext.jsx   # Global game state provider
│   ├── App.jsx
│   └── main.jsx
├── .context/
│    ├── SUMMARY.md
│    └── GAME_DESIGN.md
├── .github/
│    └──copilot-instructions.md
└── package.json
```

---

## 🔄 Game State Shape

Always use the following as the canonical game state structure (from `GAME_DESIGN.md`):

```js
// src/game/constants.js
export const SNAIL_COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
export const CRAZY_SNAIL_COLORS = ['black', 'white'];
export const TRACK_LENGTH = 16;
export const FINISH_LINE = 17;
export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;
export const STARTING_COINS = 3;
export const LEG_BET_VALUES = [5, 3, 2]; // top to bottom of stack
export const RACE_BET_PAYOUTS = [8, 5, 3, 2, 1]; // by pile position
```

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
- [ ] Is the action validated server-side (or via `validation.js`) before state changes?
- [ ] Does the state update follow the canonical `GameState` shape?
- [ ] Are edge cases handled? (e.g., snail goes off-board, player has 0 coins, last die rolled)
- [ ] Is the UI update reactive to state change (not imperative DOM manipulation)?

---

## 💬 Communication Style

- When suggesting architectural decisions, briefly explain the tradeoff.
- When the game design document and a user request conflict, flag it and defer to `GAME_DESIGN.md` unless the user explicitly overrides it.
- Prefer generating complete, working code over pseudocode.
- Always include comments for non-obvious game logic.
