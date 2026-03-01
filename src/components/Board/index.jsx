import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { useGameContext } from '../../context/GameContext'

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

export function Board() {
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

  /* ── Snake layout: row 1 = #1–#8 (L→R), row 2 = #16–#9 (L→R) ───── */
  const rowTop    = displayTrack.slice(0, 8)
  const rowBottom = displayTrack.slice(8, 16).reverse()

  function renderSpace(space) {
    const isBoost = space.spectatorTile?.side === 'boost'
    const isTrap  = space.spectatorTile?.side === 'trap'
    const bgNormal = isBoost ? '#d4f0d0' : isTrap ? '#f9d8d8' : '#fffdf7'
    const border   = isBoost ? '2px solid #7bc97a' : isTrap ? '2px solid #e08080' : '2px solid #c9aa7a'
    return (
      <div
        key={space.spaceNumber}
        className="board-space"
        style={{ padding: '12px 10px', border, borderRadius: 6, minWidth: 0, background: bgNormal }}
      >
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
    <div>
      <p className="game-card-title" style={{ margin: '0 0 12px 0' }}>🏁 Track</p>
      {/* Row 1: #1 → #8, left to right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: 6 }}>
        {rowTop.map(renderSpace)}
      </div>
      {/* Row 2: #16 → #9, left to right (snake direction) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
        {rowBottom.map(renderSpace)}
      </div>
    </div>
  )
}

export default Board
