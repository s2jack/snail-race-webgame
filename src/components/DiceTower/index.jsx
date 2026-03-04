import React, { useRef, useEffect } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useLocalPlayer } from '../../context/LocalPlayerContext'

const SNAIL_HEX = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa' }

// Standard dice pip positions on a 3×3 grid (row 1–3, col 1–3).
// Each entry is [row, col] — cells without a pip are left empty.
const PIP_POSITIONS = {
  1: [[2,2]],
  2: [[1,3],[3,1]],
  3: [[1,3],[2,2],[3,1]],
  4: [[1,1],[1,3],[3,1],[3,3]],
  5: [[1,1],[1,3],[2,2],[3,1],[3,3]],
  6: [[1,1],[1,3],[2,1],[2,3],[3,1],[3,3]],
}

/** Renders a single coloured die face with proper pips instead of a text label. */
function DieFace({ value, bg, pipColor, size = 44 }) {
  const pips = PIP_POSITIONS[value] || []
  // Build a Set for O(1) lookup: "r,c"
  const pipSet = new Set(pips.map(([r, c]) => `${r},${c}`))
  const pad = Math.round(size * 0.14)
  const pipSize = Math.round(size * 0.18)

  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.18),
      background: bg,
      border: '2px solid rgba(0,0,0,0.22)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
      flexShrink: 0,
      padding: pad,
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: 0,
    }}>
      {[1,2,3].flatMap(row =>
        [1,2,3].map(col => {
          const hasPip = pipSet.has(`${row},${col}`)
          return (
            <div key={`${row}-${col}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {hasPip && (
                <div style={{
                  width: pipSize, height: pipSize,
                  borderRadius: '50%',
                  background: pipColor,
                  boxShadow: `0 1px 2px rgba(0,0,0,0.3)`,
                  flexShrink: 0,
                }} />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export function DiceTower() {
  const { state, dispatch } = useGameContext()
  const { localPlayerId } = useLocalPlayer() || {}

  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const used = state.usedDice || []
  const usedCount = used.length
  const remaining = 5 - usedCount

  const validLocal = localPlayerId && state.players && state.players.find(p => p.id === localPlayerId) ? localPlayerId : null
  const canRoll = state.phase === 'playing' && !!currentPlayer && !(validLocal && validLocal !== currentPlayer.id) && remaining > 0

  const rollClickRef = useRef(false)
  useEffect(() => { rollClickRef.current = false }, [state.phase, state.usedDice])

  function handleRoll() {
    if (!currentPlayer || rollClickRef.current || !canRoll) return
    rollClickRef.current = true
    dispatch({ type: 'ROLL_DIE', playerId: currentPlayer.id })
  }

  return (
    <div>
      <p className="game-card-title" style={{ margin: '0 0 8px 0' }}>
        🎲 Dice — <span style={{ color: '#56b243' }}>{remaining} left</span>
      </p>

      {/* 5 slots: filled = rolled die, empty = placeholder */}
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: 5 }, (_, i) => {
          const d = used[i]
          if (d) {
            const bg = d.type === 'color'
              ? (SNAIL_HEX[d.color] || d.color)
              : (d.crazyColor === 'white' ? '#eee' : '#222')
            const pipColor = d.type === 'color'
              ? '#fff'
              : (d.crazyColor === 'white' ? '#333' : '#fff')
            return (
              <DieFace
                key={i}
                value={d.value}
                bg={bg}
                pipColor={pipColor}
                size={44}
              />
            )
          }
          // Empty placeholder slot
          return (
            <div key={i} style={{
              width: 44, height: 44, borderRadius: 8,
              background: '#f5e8cc',
              border: '2px dashed #c9aa7a',
              flexShrink: 0,
            }} />
          )
        })}
      </div>

      {/* Roll Die button */}
      <button
        onClick={handleRoll}
        disabled={!canRoll}
        className="btn-green"
        style={{
          marginTop: 10,
          width: '100%',
          padding: '8px 0',
          fontSize: 13, fontWeight: 800,
          background: canRoll
            ? 'linear-gradient(135deg, #56b243, #3d8a30)'
            : '#d0c0a0',
          color: '#fff',
          border: `2px solid ${canRoll ? '#3d8a30' : '#bfae8a'}`,
          borderRadius: 8,
          cursor: canRoll ? 'pointer' : 'not-allowed',
          boxShadow: canRoll ? '0 2px 8px rgba(60,140,40,0.3)' : 'none',
          letterSpacing: '0.3px',
        }}
      >
        🎲 Roll Die &nbsp;<span style={{ fontSize: 10, fontWeight: 400, opacity: 0.9 }}>+1 coin</span>
      </button>
    </div>
  )
}



export default DiceTower
