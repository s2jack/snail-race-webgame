import React, { useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useLocalPlayer } from '../../context/LocalPlayerContext'

function HelpTip({ text }) {
  const [visible, setVisible] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 6 }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 16, height: 16, borderRadius: '50%',
          background: '#b98a49', color: '#fff',
          fontSize: 10, fontWeight: 900,
          cursor: 'default', userSelect: 'none',
          lineHeight: 1, flexShrink: 0,
        }}
      >?</span>
      {visible && (
        <div style={{
          position: 'absolute',
          top: '120%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: '#3a2a10',
          color: '#fff8ee',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 12,
          lineHeight: 1.6,
          width: 260,
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
          whiteSpace: 'pre-line',
        }}>
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
            borderWidth: 6, borderStyle: 'solid',
            borderColor: 'transparent transparent #3a2a10 transparent',
          }} />
          {text}
        </div>
      )}
    </span>
  )
}

export function BettingPanel() {
  const { state, dispatch } = useGameContext()
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const { localPlayerId } = useLocalPlayer() || {}

  const validLocal = localPlayerId && state.players && state.players.find(p => p.id === localPlayerId) ? localPlayerId : null
  const totalUsedCount = (state.usedDice || []).length
  const isActive = !!currentPlayer && state.phase === 'playing' && totalUsedCount < 5 && (!validLocal || validLocal === currentPlayer.id)

  function placeLeg(color) {
    if (!isActive) return
    dispatch({ type: 'PLACE_LEG_BET', playerId: currentPlayer.id, color })
  }

  const colorDot = (color) => {
    const map = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa', black: '#222', white: '#fff' }
    return map[color] || color
  }

  return (
    <div>
      <div className="game-card-title" style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center' }}>
        💰 Leg Bet Stacks
        <HelpTip text={`Predict which snail will finish 1st or 2nd this Leg.

• Take the top tile from any snail's stack — tiles are worth 5, 3, or 2 coins (first come, first served).
• If that snail finishes 1st: earn the tile's full value.
• If that snail finishes 2nd: earn 1 coin.
• Any other position: lose 1 coin.
• You may place one leg bet per turn. Each snail's stack refills at the start of every new Leg.`} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(state.legBetStacks || {}).map(([color, stack]) => {
          const topValue = stack[0] ? stack[0].value : null
          const isWhite = color === 'white'
          return (
            <div key={color} className="leg-bet-card" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '10px 12px',
              background: '#fff8ee',
              border: `3px solid ${colorDot(color)}`,
              borderRadius: 8,
              minWidth: 72,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}>
              {/* Color swatch */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: colorDot(color),
                border: isWhite ? '2px solid #ccc' : '2px solid rgba(0,0,0,0.15)',
                flexShrink: 0,
              }} />
              {/* Top value badge */}
              <div style={{
                fontSize: 18, fontWeight: 800,
                color: topValue ? '#333' : '#bbb',
              }}>{topValue ?? '—'}</div>
              <div style={{ fontSize: 10, color: '#999', marginTop: -4 }}>top</div>
              <button
                onClick={() => placeLeg(color)}
                disabled={!isActive || !topValue}
                className="btn-bet"
                style={{
                  marginTop: 2,
                  padding: '5px 8px',
                  fontSize: 11,
                  fontWeight: 700,
                  background: isActive && topValue ? colorDot(color) : '#e0d0b0',
                  color: isActive && topValue ? (isWhite ? '#333' : '#fff') : '#aaa',
                  border: 'none',
                  borderRadius: 5,
                  cursor: isActive && topValue ? 'pointer' : 'not-allowed',
                  width: '100%',
                }}
              >Bet</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BettingPanel
