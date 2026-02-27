import React from 'react'
import { useGameContext } from '../../context/GameContext'

export function DiceTower() {
  const { state } = useGameContext()

  const usedCount = (state.usedDice || []).length
  const drawsRemaining = 5 - usedCount   // leg ends after 5 draws
  const pips = Array.from({ length: 5 }, (_, i) => i < drawsRemaining)

  return (
    <div>
      <p className="game-card-title" style={{ margin: '0 0 8px 0' }}>DICE TOWER</p>

      {/* 5-pip track showing draws left this leg */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        {pips.map((filled, i) => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: 4,
            background: filled ? '#b98a49' : '#e0d0b0',
            border: `2px solid ${filled ? '#7a5a2a' : '#c0aa80'}`,
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#7a5a2a', marginBottom: 10 }}>{drawsRemaining} of 5 remaining</div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#7a5a2a', marginBottom: 6 }}>Used this leg</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 40 }}>
          {(state.usedDice || []).length === 0 && (
            <span style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>None yet</span>
          )}
          {(state.usedDice || []).map((d, i) => {
            const SNAIL_HEX = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa' }
            const bg = d.type === 'color' ? (SNAIL_HEX[d.color] || d.color) : (d.crazyColor === 'white' ? '#eee' : '#222')
            const fg = d.type === 'color'
              ? (d.color === 'yellow' ? '#5a3e1b' : '#fff')
              : (d.crazyColor === 'white' ? '#000' : '#fff')
            const label = d.type === 'color' ? d.color[0].toUpperCase() + d.value : `${d.crazyColor[0].toUpperCase()}${d.value}`
            // animDelay staggers each die so they don't all pop in at once
            const animDelay = `${i * 0.04}s`
            return (
              <div key={`die-${i}`} className="die-badge" title={JSON.stringify(d)} style={{
                width: 42, height: 42, borderRadius: 8,
                background: bg, color: fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13,
                border: '2px solid rgba(0,0,0,0.22)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
                animationDelay: animDelay,
              }}>{label}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}



export default DiceTower
