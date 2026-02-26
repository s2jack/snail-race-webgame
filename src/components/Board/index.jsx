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
      <h2>Board</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
        {state.track.map(space => (
          <div key={space.spaceNumber} style={{ padding: 8, border: '1px solid #ccc' }}>
            <div>#{space.spaceNumber}</div>
            <div style={{ minHeight: 64, display: 'flex', flexDirection: 'column-reverse', gap: 4, marginTop: 6 }}>
              {space.snails && space.snails.map((s, idx) => {
                const isWhite = s.id === 'white'
                const badgeStyle = {
                  width: 44,
                  height: 18,
                  borderRadius: 6,
                  backgroundColor: s.id,
                  color: isWhite ? '#000' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  border: isWhite ? '1px solid #ccc' : '1px solid rgba(0,0,0,0.1)'
                }
                return (
                  <div key={s.id + '-' + idx} style={badgeStyle} title={s.id}>
                    {s.id[0].toUpperCase()}
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 6 }}>
              Tile: {space.spectatorTile ? `${ownerDisplay(space.spectatorTile.ownerId)} (${space.spectatorTile.side})` : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Board
