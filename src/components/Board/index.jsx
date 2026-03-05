import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'
import { canPlaceSpectator } from '../../game/validation'

/* ─── Animation timing constants ────────────────────────────────────────
 *
 *  INITIAL_DELAY_MS  — pause after state update so the dice badge registers
 *  HOP_DURATION_MS   — CSS hop animation length (must match .snail-hopping)
 *  STEP_DELAY_MS     — interval between sequential hops (≥ HOP_DURATION_MS)
 *
 *  Total animation time for N hops:
 *    INITIAL_DELAY_MS + (N - 1) × STEP_DELAY_MS + HOP_DURATION_MS
 *
 *  Examples (die value = distance):
 *    1 space  → 200 + 0×360 + 320 =  520 ms
 *    2 spaces → 200 + 1×360 + 320 =  880 ms
 *    3 spaces → 200 + 2×360 + 320 = 1 240 ms
 *    + spectator tile adds one extra STEP_DELAY_MS hop
 * ──────────────────────────────────────────────────────────────────────── */
const INITIAL_DELAY_MS = 200
const HOP_DURATION_MS  = 320
const STEP_DELAY_MS    = 360

/* ─── Oval / horseshoe space coordinates ───────────────────────────────────
 *  Each entry: { x, y } as percentage of the container (0 = top/left edge).
 *  The horseshoe runs CCW: #1 (bottom-right start) → up the right leg →
 *  top arc → down the left leg → #16 (bottom-left, near finish).
 *  Adjust these values once stone-tile PNG assets arrive.
 * ─────────────────────────────────────────────────────────────────────────── */
const SPACE_COORDS = {
   1: { x: 88, y: 80 },
   2: { x: 87, y: 60 },
   3: { x: 83, y: 40 },
   4: { x: 74, y: 22 },
   5: { x: 62, y: 12 },
   6: { x: 50, y:  9 },
   7: { x: 38, y: 12 },
   8: { x: 26, y: 22 },
   9: { x: 17, y: 40 },
  10: { x: 13, y: 60 },
  11: { x: 12, y: 80 },
  12: { x: 18, y: 89 },
  13: { x: 31, y: 91 },
  14: { x: 46, y: 91 },
  15: { x: 61, y: 91 },
  16: { x: 74, y: 89 },
}

export function Board({ onSpectatorSpaceSelect, selectedSpace, spectatorSide, onSideChange, onPlace }) {
  const { state } = useGameContext()

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function ownerDisplay(ownerId) {
    const p = state.players && state.players.find(x => x.id === ownerId)
    return p ? p.name : ownerId
  }

  const SNAIL_PAWN_IMG = {
    red:    '/snail_pawns/red-snail-pawn.png',
    blue:   '/snail_pawns/blue-snail-pawn.png',
    green:  '/snail_pawns/green-snail-pawn.png',
    yellow: '/snail_pawns/yellow-snail-pawn.png',
    purple: '/snail_pawns/purple-snail-pawn.png',
    black:  '/snail_pawns/black-snail-pawn.png',
    white:  '/snail_pawns/white-snail-pawn.png',
  }

  /* ── animation state ────────────────────────────────────────────────── */
  // animState: { movingStackIds, steps, currentStep, spectatorStepIndex }
  const [animState, setAnimState] = useState(null)
  const lastMoveIdRef = useRef(null)
  /* ── spectator hover state ───────────────────────────────────────────── */
  const [hoveredSpace, setHoveredSpace] = useState(null)

  // Kick off step-by-step hop animation whenever a new lastMove appears.
  // useLayoutEffect runs BEFORE the browser paints, so the snail is placed
  // at its pre-move position (step 0) before the user ever sees the final
  // post-move state — eliminating the "flash at destination" glitch.
  useLayoutEffect(() => {
    const lm = state.lastMove
    if (!lm || lm.id === lastMoveIdRef.current) return
    lastMoveIdRef.current = lm.id

    const { movingStackIds, steps, spectatorStepIndex } = lm
    const hops = steps.length - 1
    if (hops <= 0) return // no movement — nothing to animate

    // Show the stack at its pre-move position immediately (step 0)
    setAnimState({ movingStackIds, steps, currentStep: 0, spectatorStepIndex })

    const timers = []

    // Schedule each subsequent hop with calculated delays
    for (let i = 1; i <= hops; i++) {
      const delay = INITIAL_DELAY_MS + (i - 1) * STEP_DELAY_MS
      timers.push(setTimeout(() => {
        setAnimState(prev => prev ? { ...prev, currentStep: i } : null)
      }, delay))
    }

    // Clear animation after the last hop's CSS animation finishes
    const totalMs = INITIAL_DELAY_MS + (hops - 1) * STEP_DELAY_MS + HOP_DURATION_MS
    timers.push(setTimeout(() => setAnimState(null), totalMs))

    return () => timers.forEach(clearTimeout)
  }, [state.lastMove])

  /* ── display track (overrides snail positions during animation) ────── */
  const displayTrack = useMemo(() => {
    if (!animState) return state.track

    // Remove the moving stack from their final (post-move) positions
    const display = state.track.map(sp => ({
      ...sp,
      snails: sp.snails.filter(s => !animState.movingStackIds.includes(s.id)),
    }))

    // Place the moving stack at the current animation step position
    const currentSpaceNum = animState.steps[animState.currentStep]
    const clampedNum = Math.max(1, Math.min(16, currentSpaceNum))
    const targetSpace = display.find(s => s.spaceNumber === clampedNum)
    if (targetSpace) {
      const isSpectatorStep = animState.spectatorStepIndex != null
        && animState.currentStep === animState.spectatorStepIndex
      targetSpace.snails = targetSpace.snails.concat(
        animState.movingStackIds.map(id => ({
          id,
          _animating: true,
          _hopKey: animState.currentStep,
          _spectator: isSpectatorStep,
        }))
      )
    }

    return display
  }, [state.track, animState])

  /* ── valid spaces for spectator tile placement ───────────────────────── */
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const canPlaceNow = state.phase === 'playing' && (state.usedDice || []).length < 5
  // Pre-compute a Set of valid space numbers per current state+player
  const validSpectatorSpaces = useMemo(() => {
    if (!canPlaceNow || !currentPlayer) return new Set()
    const valid = new Set()
    for (let n = 1; n <= 16; n++) {
      const result = canPlaceSpectator(state, currentPlayer.id, n)
      if (result.valid) valid.add(n)
    }
    return valid
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.track, state.phase, state.usedDice, currentPlayer?.id])

  function renderSpace(space) {
    const isBoost = space.spectatorTile?.side === 'boost'
    const isTrap  = space.spectatorTile?.side === 'trap'
    const bgNormal = isBoost ? '#d4f0d0' : isTrap ? '#f9d8d8' : '#fffdf7'
    const border   = isBoost ? '2px solid #7bc97a' : isTrap ? '2px solid #e08080' : '2px solid #c9aa7a'

    const isValidForSpectator = validSpectatorSpaces.has(space.spaceNumber)
    const isHovered = isValidForSpectator && hoveredSpace === space.spaceNumber
    // Valid-space hover overrides: light gold tint + bolder border + shadow
    const bgOverride = isHovered ? '#fef3d0' : bgNormal
    const borderOverride = isHovered ? '2px solid #b98a49' : border
    const shadowOverride = isHovered ? '0 3px 10px rgba(185,138,73,0.35)' : 'none'

    const isSelected = selectedSpace !== '' && selectedSpace === String(space.spaceNumber)

    return (
      <div
        key={space.spaceNumber}
        className="board-space"
        onMouseEnter={() => isValidForSpectator && setHoveredSpace(space.spaceNumber)}
        onMouseLeave={() => setHoveredSpace(null)}
        onClick={() => {
          if (isValidForSpectator && onSpectatorSpaceSelect) {
            onSpectatorSpaceSelect(String(space.spaceNumber))
          }
        }}
        style={{
          padding: '12px 10px',
          border: isSelected ? '2px solid #3d8a30' : borderOverride,
          borderRadius: 6,
          minWidth: 0,
          position: 'relative',
          background: isSelected ? '#edf9eb' : bgOverride,
          boxShadow: isSelected ? '0 3px 10px rgba(61,138,48,0.3)' : shadowOverride,
          cursor: isValidForSpectator ? 'pointer' : 'default',
          transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
          outline: isHovered && !isSelected ? '2px solid #e0c88a' : 'none',
          outlineOffset: 1,
        }}
      >
        {/* Place confirmation overlay */}
        {isSelected && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(237,249,235,0.95)',
            borderRadius: 5,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 5, zIndex: 10, padding: '6px 4px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#3d8a30', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              #{space.spaceNumber}
            </div>
            {/* Boost / Trap toggle */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[['boost', '🚀'], ['trap', '🪤']].map(([s, emoji]) => (
                <button
                  key={s}
                  onClick={e => { e.stopPropagation(); if (onSideChange) onSideChange(s) }}
                  style={{
                    padding: '3px 7px', fontSize: 13,
                    background: spectatorSide === s
                      ? (s === 'boost' ? 'linear-gradient(135deg,#56b243,#3d8a30)' : 'linear-gradient(135deg,#e05555,#b03030)')
                      : '#f5ede0',
                    color: spectatorSide === s ? '#fff' : '#9a7a4a',
                    border: spectatorSide === s
                      ? `2px solid ${s === 'boost' ? '#3d8a30' : '#b03030'}`
                      : '2px solid #c9aa7a',
                    borderRadius: 5, cursor: 'pointer',
                    fontWeight: 700, lineHeight: 1,
                  }}
                >{emoji}</button>
              ))}
            </div>
            <button
              onClick={e => { e.stopPropagation(); if (onPlace) onPlace() }}
              style={{
                padding: '5px 10px', fontSize: 11, fontWeight: 800,
                background: spectatorSide === 'boost'
                  ? 'linear-gradient(135deg, #56b243, #3d8a30)'
                  : 'linear-gradient(135deg, #e05555, #b03030)',
                color: '#fff',
                border: `2px solid ${spectatorSide === 'boost' ? '#3d8a30' : '#b03030'}`,
                borderRadius: 5, cursor: 'pointer',
                boxShadow: spectatorSide === 'boost'
                  ? '0 2px 6px rgba(61,138,48,0.4)'
                  : '0 2px 6px rgba(176,48,48,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              {spectatorSide === 'boost' ? '🚀' : '🪤'} Place
            </button>
            <button
              onClick={e => { e.stopPropagation(); if (onSpectatorSpaceSelect) onSpectatorSpaceSelect('') }}
              style={{
                padding: '2px 8px', fontSize: 10, fontWeight: 700,
                background: 'transparent', color: '#9a7a4a',
                border: '1px solid #c9aa7a', borderRadius: 4, cursor: 'pointer',
              }}
            >Cancel</button>
          </div>
        )}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a7a4a' }}>#{space.spaceNumber}</div>
        <div style={{ minHeight: 72, display: 'flex', flexDirection: 'column-reverse', gap: 4, marginTop: 6, alignItems: 'center' }}>
          {space.snails && space.snails.map((s) => {
            const isCrazy = s.id === 'black' || s.id === 'white'
            // Colored snails face right on row 1 (1–8), flip on row 2 (9–16)
            // Crazy snails face left on row 1 (1–8), don't flip on row 2
            const shouldMirror = isCrazy ? space.spaceNumber <= 8 : space.spaceNumber >= 9

            // Determine animation class — hop vs spectator-bounce
            const isHopping         = s._animating && s._hopKey > 0
            const isSpectatorBounce = s._spectator

            // Changing the key on each step forces React to remount the wrapper,
            // which restarts the CSS animation for the hop into the new space.
            const wrapperKey = s._animating
              ? `${s.id}-hop-${s._hopKey}`
              : `${s.id}-sp${space.spaceNumber}`

            const animClass = isHopping
              ? (isSpectatorBounce ? 'snail-spectator-bounce' : 'snail-hopping')
              : ''

            return (
              <div key={wrapperKey} className={animClass}>
                <img
                  src={SNAIL_PAWN_IMG[s.id]}
                  alt={`${s.id} snail`}
                  title={s.id}
                  style={{
                    width: 44,
                    height: 44,
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.18))',
                    transform: shouldMirror ? 'scaleX(-1)' : 'none',
                  }}
                />
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 6, fontSize: 10, textAlign: 'center' }}>
          {space.spectatorTile ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3, color: isBoost ? '#3a7a30' : '#a03030', fontWeight: 700 }}>
              {isBoost ? '🚀' : '🪤'} {ownerDisplay(space.spectatorTile.ownerId)}
            </span>
          ) : <span style={{ color: '#cbb88a' }}>—</span>}
        </div>
      </div>
    )
  }

  return (
    /* ── Oval horseshoe board ─────────────────────────────────────────────
     *  paddingTop trick creates a 100% × 65%-of-width aspect-ratio container.
     *  Each space tile is centred on its SPACE_COORDS percentage coordinate.
     *  A bgSrc prop can be added here later to show a stone-track background.
     * ────────────────────────────────────────────────────────────────────── */
    <div style={{ position: 'relative', width: '100%', paddingTop: '65%' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {displayTrack.map(space => {
          const coord = SPACE_COORDS[space.spaceNumber]
          if (!coord) return null
          return (
            <div
              key={space.spaceNumber}
              style={{
                position: 'absolute',
                left: `${coord.x}%`,
                top: `${coord.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 76,
              }}
            >
              {renderSpace(space)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Board
