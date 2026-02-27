import React from 'react'
import { useGameContext } from '../../context/GameContext'

export function Board() {
  const { state } = useGameContext()

  function ownerDisplay(ownerId) {
    const p = state.players && state.players.find(x => x.id === ownerId)
    return p ? p.name : ownerId
  }

  return (
    <div>
      <p className="game-card-title" style={{ margin: '0 0 12px 0' }}>🏁 Track</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
        {state.track.map(space => (
          <div key={space.spaceNumber} className="board-space" style={{ padding: '12px 10px', border: '2px solid #c9aa7a', borderRadius: 6, minWidth: 0, background: '#fffdf7' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9a7a4a' }}>#{space.spaceNumber}</div>
            <div style={{ minHeight: 72, display: 'flex', flexDirection: 'column-reverse', gap: 4, marginTop: 6, alignItems: 'flex-start' }}>
              {space.snails && space.snails.map((s, idx) => {
                const isWhite = s.id === 'white'
                const SNAIL_HEX = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa', black: '#222', white: '#eee' }
                const bg = SNAIL_HEX[s.id] || s.id
                const badgeStyle = {
                  width: 44,
                  height: 20,
                  borderRadius: 6,
                  background: bg,
                  color: isWhite ? '#000' : (s.id === 'yellow' ? '#5a3e1b' : '#fff'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  border: isWhite ? '1px solid #ccc' : '1px solid rgba(0,0,0,0.15)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                }
                return (
                  // Key includes spaceNumber: when snail moves, key changes → re-mount → CSS animation fires
                  <div key={`${s.id}-sp${space.spaceNumber}`} className="snail-badge" style={badgeStyle} title={s.id}>
                    {s.id[0].toUpperCase()}
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 6, fontSize: 10, color: '#7a5a2a' }}>
              {space.spectatorTile ? (
                <span style={{ padding: '2px 5px', background: space.spectatorTile.side === 'boost' ? '#d4f0d0' : '#f9d8d8', border: `1px solid ${space.spectatorTile.side === 'boost' ? '#7bc97a' : '#e08080'}`, borderRadius: 3 }}>
                  {space.spectatorTile.side === 'boost' ? '🚀' : '🪤'} {ownerDisplay(space.spectatorTile.ownerId)}
                </span>
              ) : <span style={{ color: '#cbb88a' }}>—</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Board
