# Changelog

All notable changes to Snail Race are tracked here.
Format: `## [version] — YYYY-MM-DD` followed by categorised bullet points.
When no version tag exists yet, changes are listed under **Unreleased**.

---

## [Unreleased] — 2026-02-27

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
