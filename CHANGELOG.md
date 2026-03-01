# Changelog

All notable changes to Snail Race are tracked here.
Format: `## [version] — YYYY-MM-DD` followed by categorised bullet points.
When no version tag exists yet, changes are listed under **Unreleased**.

---

## [Unreleased] — 2026-03-02

---

## [0.3.1] — 2026-03-01

### Bug Fix / Game Logic
- Fixed crash during final scoring: added missing `scoreRace` import in `useGameState.js`. The reducer was calling `scoreRace()` but the function was not imported from `scoring.js`, causing "scoreRace is not defined" error when clicking "Reveal Results & Apply Bets".

### Bug Fix / UI / SpectatorTilePanel
- Fixed DOM nesting warning: changed Spectator Tile panel title from `<p>` to `<div>` to properly contain the `HelpTip` component. React was warning that `<div>` (from HelpTip's tooltip) cannot appear inside `<p>` (the title).

## [Unreleased] — 2026-02-28

### UI / SpectatorTilePanel
- Added missing `HelpTip` (?) tooltip to the Spectator Tile panel title, explaining boost/trap rules and placement constraints.

### UI / BettingPanel
- Fixed leg-bet coin stack: remaining coins no longer shift position when the top tile is taken. Each coin is now positioned using its `originalIdx` (permanent slot in the full 4-tile stack) rather than its current `stackIdx`, so `top`/`bottom` values are stable across stack size changes.
- Reworked leg-bet coin stack positioning: inverted z-index order so the highest-value (bottom) coin has the highest z-index, and switched to `top`-based offsets (`stackIdx * 7px`) for all coins except the top tile which retains `bottom: 0`, making higher-value coins peek visibly above the stack.

### Bug Fix / BettingPanel — Coin Stack Layout (Staircase to Vertical Stack)
- Fixed a layout bug where coin stacks were spreading sideways in a staircase/ladder pattern — coins now form a true **vertical stack** with all coins centered at the same X position
- Changed wrapper positioning from `bottom: stackIdx * COIN_OFFSET` (which offset each coin vertically) to `bottom: 0` (all coins at baseline) and use `zIndex` for layering
- Coins are now perfectly overlapped with `position: absolute` at the same `bottom: 0, left: 0` position, creating a true pile instead of a row
- Added CSS custom property `--coin-stack-depth` (1.5px per coin) to the `coinSettle` animation keyframes, providing a tiny vertical hint of stacking without causing horizontal drift
- Animation now features **pure vertical movement** (only `translateY`, no `translateX` or sideways effects) — coins drop straight down and settle cleanly

### UI / BettingPanel — Gravity-based Coin Stacking
- Redesigned leg bet coin stacks to feel physically grounded: coins stack from bottom-to-top using proper positioning instead of floating from the top
- Coins settle under gravity with a **drop + squash + bounce** animation (420ms) — they fall from above, squash on impact, rebound slightly, then rest
- Added position-based animation delays: coins at the stack's bottom settle first, higher coins follow — creates a natural cascading effect when stacks build
- Enhanced depth perception with `drop-shadow(0 4px 6px rgba(0,0,0,0.2))` under each coin, making them feel less flat and more three-dimensional

### Bug Fix / Board — Animation Flash Glitch
- Fixed a visual glitch where the snail would appear at its final destination for one frame before the hop animation started; switched from `useEffect` to `useLayoutEffect` so the animation state (step 0 = pre-move position) is set before the browser paints

### UI / Board — Snail Hop Animation
- Snails now move **space by space** with a stylish jump arc animation after each dice roll instead of teleporting to their destination
- Added `lastMove` metadata to the `ROLL_DIE` reducer result containing the full step path (from → each intermediate space → destination, plus spectator tile redirect)
- Board component computes a "display track" during animation that overrides snail positions, advancing the moving stack one space per hop
- Animation timing is precisely calculated: `INITIAL_DELAY_MS (200) + (hops − 1) × STEP_DELAY_MS (360) + HOP_DURATION_MS (320)` — e.g. a 3-space move takes ~1.2 s
- Spectator tile redirects (boost/trap) get a distinct wobbly bounce animation (`snailSpectatorBounce`) instead of the normal hop
- Each hop uses a key-change trick to force React remount, cleanly restarting the CSS animation
- CSS keyframes include crouch → launch → apex → descend → squash-land phases for a lively cartoon feel

---

## [0.3.0] — 2026-02-28

### Workflow / Copilot Instructions
- Updated commit message rule: generating a commit message now immediately promotes `[Unreleased]` to a versioned block and opens a fresh `[Unreleased]` section in one step, without requiring a separate confirmation

### Bug Fix / SpectatorTilePanel
- Fixed a turn-skipping bug where clicking the "Apply Tile" button with no changes (same space and same type already on board) would silently end the player's turn; added a no-op guard in `applyTile()` — if `tile.onBoard && tile.position === pos && tile.side === side`, the dispatch is skipped entirely

### UI / BettingPanel
- Replaced flat coloured circles in the Leg Bet Stacks with physically-stacked coin PNG images (`/colored_coins/{color}-coin-{value}.png`); coins are rendered bottom-to-top so the highest-value (top) tile paints on top, each layer offset 8 px downward to give a 3-D stack appearance
- Added a dashed-ring empty-slot placeholder for exhausted stacks and kept scale-on-hover interaction
- Removed the now-unused `colorDot` helper function from `BettingPanel`

### UI / Board
- Removed hover background effects from boosted and trapped board spaces; spaces now show a static colour with no pointer interaction
- Removed unused `bgHover` variable from `renderSpace`
- Added `.board-space--boost` and `.board-space--trap` CSS classes with `!important` overrides so the `.board-space:hover` rule cannot change the background of spectator tile spaces
- Board component applies these classes conditionally based on tile side

### UI / SpectatorTilePanel (App.jsx)
- Merged "Move Tile" and "Flip Side" into a single **Update Tile** button backed by `applyTile()`
- `applyTile()` resolves place / move / flip by checking whether a new space is entered and whether the tile is already on the board; no separate `flipSide()` function needed
- Button label is "Place Tile" when not yet placed, "Update Tile" when already on the board

### UI / Board
- Board space divs now inherit the spectator tile colour as their full background and border (`#d4f0d0` / green for Boost, `#f9d8d8` / red for Trap) instead of only showing a coloured label
- Removed the pill background from the owner-name text inside spectator tile spaces — label is now plain coloured text aligned centrally
- Fixed hover effect on spectator tile spaces: Boost darkens to `#b8e4b3`, Trap to `#f0b5b5`, neutral to `#f5e8cc`; added `transition: background 0.15s`
- Emoji and owner name in the spectator tile label are centred via `textAlign: 'center'` and `justifyContent: 'center'`

### UI / SpectatorTilePanel (App.jsx)
- Reorganised the Spectator Tile interactive controls from a horizontal `flex-wrap` row into a vertical `flex-column` stack
- Space # input, Type select, Place/Move button, and Flip button each stretch to full width
- Button labels improved: "Place" → "Place Tile", "Move" → "Move Tile", "Flip" → "Flip Side"

### UI / Turn Order (App.jsx)
- Moved `maxWidth: 150` and `overflow: hidden` from the player-name `<span>` to the parent `<div>` rows, so the constraint is enforced at the container level
- Name spans retain `textOverflow: ellipsis` + `whiteSpace: nowrap` to render the truncation glyph

---

## [0.2.0] — a1ea7bf — Branch: UI-first-implementation

### Features
- Snake-pattern two-row track layout (spaces 1–8 top, 16–9 bottom)
- Leg-end countdown animation before scoring overlay

### UI Improvements (`eea53c2` — "improve UI")
- Various visual polish across BettingPanel, DiceTower, PlayerCard, Scoreboard
- Snail pawn images added for all 7 snail colours
- Coloured coin images added for all 5 racing snail colours (values 2, 3, 5)
- Board component refactored with image-based snail stack rendering
- PlayerCard rebuilt as full-height slide-in side panel with hover-to-open

---

## [0.1.0] — 06f10d9 — Branch: main

### Features
- Core game loop: setup → playing → leg_scoring → final_scoring → ended
- Lobby: add players, randomise turn order, start game
- Board: 16-space track, snail stacking, spectator tile display
- BettingPanel: leg bet stacks (5-3-2-2 per snail colour), race bet Win/Lose cards
- DiceTower: 5-die pool draw mechanic, used-dice display
- PlayerCard: coins, leg bets, race bet cards in hand
- Scoreboard: leg summary overlay and final scoring overlay
- Game logic isolated in `src/game/` (movement, dice, scoring, validation)
- Vitest test suite for dice, movement, and scoring

---

## [0.0.1] — 4dbd74e

- Added Game Design Document (`GAME_DESIGN.md`) and Copilot instructions (`.github/copilot-instructions.md`)

---

## [0.0.0] — f11072e / 42e9142

- Initial project scaffold (Vite + React 18)
