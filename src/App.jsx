import React, { useState } from 'react'
import Board from './components/Board'
import DiceTower from './components/DiceTower'
import BettingPanel from './components/BettingPanel'
import PlayerCard from './components/PlayerCard'
import Scoreboard from './components/Scoreboard'
import Lobby from './components/Lobby'
import { useGameContext } from './context/GameContext'

export default function App() {
  const { state } = useGameContext()

  return (
    <div className="app-root">
      <h1 className="app-title">🐌 Snail Race</h1>
      {state.phase === 'setup' ? (
        <Lobby />
      ) : (
        <>
          {/* Player Info Card - slides in from right */}
          <PlayerCard />

          {/* Top bar: Dice Tower + Betting Panel + Turn Order + Snail Standings */}
          <div className="game-card" style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            marginBottom: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ flexShrink: 0 }}>
              <DiceTower />
            </div>
            <div className="section-divider" />
            <div style={{ flex: 1, minWidth: 260 }}>
              <BettingPanel />
            </div>
            <div className="section-divider" />
            <div style={{ flexShrink: 0 }}>
              <TurnOrder />
            </div>
            <div className="section-divider" />
            <div style={{ flexShrink: 0 }}>
              <SnailStandings />
            </div>
          </div>

          {/* Board */}
          <div className="game-card game-area" style={{ display: 'block' }}>
            <Board />
          </div>

          {/* Leg / Race / Ended overlay modals */}
          <Scoreboard />

          {/* Event Log panel - fixed at bottom left, pinned to viewport */}
          <EventLogWidget eventLog={state.eventLog || []} />
        </>
      )}
    </div>
  )
}

const SNAIL_HEX = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa', black: '#222', white: '#eee' }
const CRAZY = ['black', 'white']

function SnailStandings() {
  const { state } = useGameContext()

  // Build ordered standings: non-crazy snails sorted by space desc, then stack top-first
  const standings = []
  const spaces = [...(state.track || [])].sort((a, b) => b.spaceNumber - a.spaceNumber)
  for (const sp of spaces) {
    if (!sp.snails || sp.snails.length === 0) continue
    for (let i = sp.snails.length - 1; i >= 0; i--) {
      const s = sp.snails[i]
      if (CRAZY.includes(s.id)) continue
      standings.push({ color: s.id, space: sp.spaceNumber })
    }
  }

  const placeColors = ['#b98a49', '#9aa0a6', '#cd7f32', '#d0bfa0', '#d0bfa0']

  return (
    <div style={{ minWidth: 130 }}>
      <p className="game-card-title" style={{ margin: '0 0 8px 0' }}>Standings</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {standings.length === 0 && (
          <span style={{ fontSize: 12, color: '#9a7a4a', fontStyle: 'italic' }}>No snails yet</span>
        )}
        {standings.map((s, i) => (
          <div key={s.color} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 8px',
            background: i === 0 ? '#fdf3e0' : '#fff8ee',
            border: `1px solid ${i === 0 ? '#b98a49' : '#e8d9bc'}`,
            borderRadius: 6,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: placeColors[Math.min(i, placeColors.length - 1)],
              color: '#fff', fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{i + 1}</span>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: SNAIL_HEX[s.color] || s.color,
              border: s.color === 'white' ? '1px solid #ccc' : '1px solid rgba(0,0,0,0.15)',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 12, color: '#5a3e1b', fontWeight: 600, textTransform: 'capitalize', flex: 1 }}>{s.color}</span>
            <span style={{ fontSize: 10, color: '#9a7a4a' }}>#{s.space}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TurnOrder() {
  const { state } = useGameContext()
  const players = state.players || []
  const currentPlayer = players[state.currentPlayerIndex]

  if (players.length === 0) return null

  return (
    <div style={{ minWidth: 130 }}>
      <p className="game-card-title" style={{ margin: '0 0 8px 0' }}>Turn Order</p>

      {/* Current player highlight */}
      {currentPlayer && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', marginBottom: 8,
          background: 'linear-gradient(135deg, #56b243, #3d8a30)',
          borderRadius: 6, border: '2px solid #3d8a30',
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Now:</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{currentPlayer.name}</span>
        </div>
      )}

      {/* Full turn order list — scrollable when many players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 124, overflowY: 'auto', paddingRight: 2 }}>
        {players.map((p, i) => {
          const isCurrent = i === state.currentPlayerIndex
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '4px 8px',
              background: isCurrent ? '#fdf3e0' : '#fff8ee',
              border: `1px solid ${isCurrent ? '#b98a49' : '#e8d9bc'}`,
              borderRadius: 6,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: isCurrent ? '#b98a49' : '#d0bfa0',
                color: '#fff', fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{
                flex: 1, fontSize: 12,
                fontWeight: isCurrent ? 800 : 600,
                color: isCurrent ? '#5a3e1b' : '#9a7a4a',
              }}>{p.name}</span>
              <span style={{ fontSize: 11, color: '#b98a49', fontWeight: 700 }}>🪙{p.coins ?? 0}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EventLogWidget({ eventLog }) {
  const [minimized, setMinimized] = useState(true)

  const baseStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    zIndex: 1000,
    background: '#fff8ee',
    border: '3px solid #b98a49',
    borderBottom: 'none',
    borderRadius: '8px 8px 0 0',
    boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
  }

  if (minimized) {
    return (
      <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', minWidth: 250 }}>
        <span style={{ fontWeight: 700, color: '#5a3e1b', fontSize: 13 }}>📋 Event Log</span>
        <button onClick={() => setMinimized(false)} style={{ padding: '4px 10px', background: '#b98a49', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer' }}>Open</button>
      </div>
    )
  }

  return (
    <div style={{ ...baseStyle, width: 360, maxHeight: 'calc(100vh - 520px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header — always visible, never scrolls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #d0b880', flexShrink: 0, background: '#fff8ee', borderRadius: '6px 6px 0 0' }}>
        <strong style={{ color: '#5a3e1b', fontSize: 13 }}>📋 Event Log</strong>
        <button onClick={() => setMinimized(true)} style={{ padding: '4px 10px', background: '#b98a49', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Minimize</button>
      </div>
      {/* Scrollable entries — newest at top */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', fontSize: 13, lineHeight: '1.5', color: '#3a2a10' }}>
        {eventLog.slice(-200).slice().reverse().map((l, i) => (
          <div key={i} style={{ marginBottom: 5, padding: '4px 0', borderBottom: '1px solid #ede0c8' }}>{l}</div>
        ))}
      </div>
    </div>
  )
}
