import React, { useRef, useEffect } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useLocalPlayer } from '../../context/LocalPlayerContext'

const SNAIL_HEX = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa' }

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
            const fg = d.type === 'color'
              ? (d.color === 'yellow' ? '#5a3e1b' : '#fff')
              : (d.crazyColor === 'white' ? '#000' : '#fff')
            const label = d.type === 'color'
              ? `${d.color[0].toUpperCase()}${d.value}`
              : `${d.crazyColor[0].toUpperCase()}${d.value}`
            return (
              <div key={i} className="die-badge" title={JSON.stringify(d)} style={{
                width: 44, height: 44, borderRadius: 8,
                background: bg, color: fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13,
                border: '2px solid rgba(0,0,0,0.22)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
                flexShrink: 0,
              }}>{label}</div>
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
