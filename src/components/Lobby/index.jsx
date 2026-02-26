import React, { useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { v4 as uuidv4 } from 'uuid'

export function Lobby() {
  const { state, dispatch } = useGameContext()
  const [name, setName] = useState('')

  function addPlayer() {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = uuidv4()
    dispatch({ type: 'ADD_PLAYER', player: { id, name: trimmed } })
    setName('')
  }

  function startGame() {
    dispatch({ type: 'START_GAME' })
  }

  return (
    <div>
      <h3>Lobby</h3>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="Player name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={addPlayer} style={{ marginLeft: 8 }}>Add Player</button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Players:</strong>
        <ul>
          {state.players.map(p => (
            <li key={p.id}>{p.name} — {p.coins} coins</li>
          ))}
        </ul>
      </div>

      <div>
        <button onClick={startGame} disabled={state.players.length < 2}>Start Game</button>
      </div>
    </div>
  )
}

export default Lobby
