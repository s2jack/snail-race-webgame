import React from 'react'
import { useGameContext } from '../../context/GameContext'

export function Board() {
  const { state } = useGameContext()

  function ownerDisplay(ownerId) {
    const p = state.players && state.players.find(x => x.id === ownerId)
    return p ? p.name : ownerId
  }

  // Map snail IDs to their pawn image paths
  const SNAIL_PAWN_IMG = {
    red: '/snail_pawns/red-snail-pawn.png',
    blue: '/snail_pawns/blue-snail-pawn.png',
    green: '/snail_pawns/green-snail-pawn.png',
    yellow: '/snail_pawns/yellow-snail-pawn.png',
    purple: '/snail_pawns/purple-snail-pawn.png',
    black: '/snail_pawns/black-snail-pawn.png',
    white: '/snail_pawns/white-snail-pawn.png',
  }

  // Snake layout: row 1 = spaces #1–#8 (left→right), row 2 = spaces #16–#9 (left→right)
  const rowTop    = state.track.slice(0, 8)
  const rowBottom = state.track.slice(8, 16).reverse()

  function renderSpace(space) {
    const isBoost = space.spectatorTile?.side === 'boost'
    const isTrap  = space.spectatorTile?.side === 'trap'
    const bgNormal = isBoost ? '#d4f0d0' : isTrap ? '#f9d8d8' : '#fffdf7'
    const bgHover  = isBoost ? '#b8e4b3' : isTrap ? '#f0b5b5' : '#f5e8cc'
    const border   = isBoost ? '2px solid #7bc97a' : isTrap ? '2px solid #e08080' : '2px solid #c9aa7a'
    return (
      <div
        key={space.spaceNumber}
        className="board-space"
        style={{ padding: '12px 10px', border, borderRadius: 6, minWidth: 0, background: bgNormal, transition: 'background 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = bgHover }}
        onMouseLeave={e => { e.currentTarget.style.background = bgNormal }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a7a4a' }}>#{space.spaceNumber}</div>
        <div style={{ minHeight: 72, display: 'flex', flexDirection: 'column-reverse', gap: 4, marginTop: 6, alignItems: 'center' }}>
          {space.snails && space.snails.map((s) => {
            const isCrazy = s.id === 'black' || s.id === 'white'
            // Colored snails face right on row 1 (spaces 1–8), flip on row 2 (spaces 9–16)
            // Crazy snails face left on row 1 (spaces 1–8), don't flip on row 2
            const shouldMirror = isCrazy ? space.spaceNumber <= 8 : space.spaceNumber >= 9
            return (
              <img
                key={`${s.id}-sp${space.spaceNumber}`}
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
