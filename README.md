# 🐌 Snail Race Webgame

A browser-based local-multiplayer racing and betting game built with React + Vite.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (functional components + hooks) |
| Language | JavaScript / JSX |
| Styling | Inline styles (warm parchment palette) |
| State | React Context + `useReducer` |
| IDs | `uuid` |
| Build | Vite 5 |
| Tests | Vitest |
| Realtime | Placeholder (`useRealtime.js`) — not yet wired |

---

## Quick Start

```bash
npm install
npm run dev        # start dev server
npm test           # run Vitest unit tests
npm run build      # production build
npm run preview    # preview production build
```

---

## Project Structure

```
src/
├── App.jsx                     # Root — Lobby or game layout
├── main.jsx                    # React entry point
├── styles.css                  # Global CSS classes (game-card, etc.)
├── components/
│   ├── Board/                  # Track grid + snail stack + spectator tile display
│   ├── BettingPanel/           # Leg bet stacks (5-3-2-2) per snail colour
│   ├── DiceTower/              # 5-pip remaining counter + used dice display
│   ├── PlayerCard/             # Slide-in panel: coins, race bets, spectator tile placement
│   ├── PlayerPanel/            # Minimal legacy panel (superseded by PlayerCard)
│   ├── Scoreboard/             # Leg summary overlay + final scoring overlay
│   └── Lobby/                  # Player add/remove, randomise order, start game
├── context/
│   ├── GameContext.jsx         # GameStateContext provider (wraps useGameStateHook)
│   └── LocalPlayerContext.jsx  # Tracks which player is on this device
├── hooks/
│   ├── useGameState.js         # Full reducer — all game actions live here
│   ├── usePlayer.js            # PlayerContext hook
│   └── useRealtime.js          # Placeholder for Socket.io / Supabase sync
└── game/
    ├── constants.js            # SNAIL_COLORS, TRACK_LENGTH, FINISH_LINE, etc.
    ├── dice.js                 # createDicePool(), drawDie() — draw not roll
    ├── movement.js             # moveSnail(), stacking, spectator tile effects
    ├── scoring.js              # scoreLeg(), scoreRace()
    └── validation.js           # canPlaceLegBet/RaceBet/Spectator guards
test/
    ├── dice.test.js
    ├── movement.test.js
    └── scoring.test.js
```

---

## Implemented Features

### Lobby
- Add / remove players (2–8), enter-key support
- Randomise turn order, start game

### Game Board
- 16-space track rendered as an 8-column grid
- Snails displayed as coloured badges stacked bottom-to-top (stack order matches in-game ranking)
- Spectator tiles shown inline with boost 🚀 / trap 🪤 and owner label

### Dice Tower
- 5-pip indicator showing draws remaining this Leg
- Used dice displayed as coloured squares with colour initial + value

### Betting Panel
- Leg bet stacks (values 5 → 3 → 2 → 2) per snail colour
- HelpTip tooltip explaining payout rules
- Bet button disabled when no tiles remain or not the active player's turn

### Player Card
- Slide-in panel showing: coins, race bet cards in hand, spectator tile controls
- Spectator tile can be placed, moved, or flipped (boost ↔ trap) on any valid space
- HelpTip tooltips on race bets and spectator tile actions

### Scoreboard
- **Leg summary overlay** — placements, per-player delta and running total, "Start Next Leg" button
- **Final scoring overlay** — race bet payouts, winner/loser bet payouts, all-time coin totals

### Snail Standings sidebar
- Live race order updated after each die draw (excludes crazy snails)

### Turn Order sidebar
- Active player highlighted in green; all players listed with current coin counts

### Event Log
- Minimisable widget fixed to bottom-left; logs every coin change, tile placement and die draw

---

## Game Constants

```js
SNAIL_COLORS      = ['red','blue','green','yellow','purple']
CRAZY_SNAIL_COLORS= ['black','white']
TRACK_LENGTH      = 16          // spaces 1–16
FINISH_LINE       = 17          // crossing this ends the race
MAX_PLAYERS       = 8
MIN_PLAYERS       = 2
STARTING_COINS    = 3
LEG_BET_VALUES    = [5,3,2,2]   // tiles per snail stack each Leg
RACE_BET_PAYOUTS  = [8,5,3,2,1] // by pile position
```

---

## Game Phase Flow

```
setup → playing → leg_scoring → playing → ... → leg_scoring → final_scoring → ended
```

- **setup** — Lobby (add players, randomise, start)
- **playing** — Active turns (roll die, place leg bet, place race bet, place spectator tile)
- **leg_scoring** — Auto-resolves after 5th die; overlay shown; resets dice pool
- **final_scoring** — Triggered when any snail crosses space 17; all bets settled
- **ended** — Game over screen with final totals

---

## Running Tests

```bash
npm test                        # run once
npm test -- --reporter=verbose  # verbose output
```

Tests cover: dice pool draw logic, snail movement & stacking rules, leg/race scoring.

