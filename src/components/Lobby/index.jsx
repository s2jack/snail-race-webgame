import React, { useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { v4 as uuidv4 } from 'uuid'
import { GameManual } from '../GameManual'

export function Lobby() {
  const { state, dispatch } = useGameContext()
  const [name, setName] = useState('')
  const [showManual, setShowManual] = useState(false)

  function addPlayer() {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = uuidv4()
    dispatch({ type: 'ADD_PLAYER', player: { id, name: trimmed } })
    setName('')
  }

  function randomizeOrder() {
    const shuffled = [...state.players].sort(() => Math.random() - 0.5)
    dispatch({ type: 'INIT_PLAYERS', players: shuffled })
  }

  function startGame() {
    dispatch({ type: 'START_GAME' })
  }

  function clearPlayers() {
    // re-init players to an empty array
    dispatch({ type: 'INIT_PLAYERS', players: [] })
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
      <div style={{ width: 720, background: '#fff8ee', border: '6px solid #b98a49', borderRadius: 8, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.25)' }}>

        {/* Header row — title + manual button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#5a3e1b' }}>🐌 Snail Race</div>
          <button
            onClick={() => setShowManual(true)}
            style={{
              padding: '7px 16px', fontSize: 13, fontWeight: 700,
              background: '#b98a49', color: '#fff',
              border: '2px solid #7a5a2a', borderRadius: 6, cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            📖 Game Manual
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <input placeholder="Player name" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} style={{ flex: 1, padding: '10px 12px', fontSize: 16, borderRadius: 6, border: '1px solid #d0c0a0' }} />
          <button onClick={addPlayer} className="btn-blue" style={{ padding: '10px 16px', background: '#2b8bd6', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700 }}>Add Player</button>
        </div>

        <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e0d6c0', minHeight: 120 }}>
          <h4 style={{ marginTop: 0 }}>Players</h4>
          {state.players.length === 0 ? (
            <div style={{ color: '#666', padding: '18px 6px' }}>No players yet — add players to start the game.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {state.players.map((p, i) => (
                <li key={p.id} style={{ marginBottom: 6, fontSize: 15 }}>
                  <strong>{i + 1}. {p.name}</strong>
                  <span style={{ marginLeft: 8, color: '#444' }}> — {p.coins} coins</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
          <button onClick={clearPlayers} className="btn-secondary" style={{ padding: '10px 20px', background: '#e0d6c0', border: '1px solid #bfae8a', borderRadius: 6 }}>Clear</button>
          <button onClick={randomizeOrder} disabled={state.players.length < 2} className="btn-gold" style={{ padding: '10px 20px', background: state.players.length >= 2 ? '#f59e0b' : '#dea86a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700 }}>🔀 Randomize</button>
          <button onClick={startGame} disabled={state.players.length < 2} className="btn-green" style={{ padding: '10px 20px', background: state.players.length >= 2 ? '#56b243' : '#9bbf9a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 800 }}>Start Game</button>
        </div>
      </div>

      {showManual && <GameManual onClose={() => setShowManual(false)} />}
    </div>
  )
}

export default Lobby
