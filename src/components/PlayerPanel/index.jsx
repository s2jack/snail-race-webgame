import React, { useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useLocalPlayer } from '../../context/LocalPlayerContext'

export function PlayerPanel() {
  const { state, dispatch } = useGameContext()
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const [spaceInput, setSpaceInput] = useState('')
  const [side, setSide] = useState('boost')

  if (!currentPlayer) return <div>No current player</div>

  function placeOrMoveSpectator() {
    const pos = parseInt(spaceInput, 10)
    if (Number.isNaN(pos)) return
    if (state.phase !== 'playing') return
    const totalUsedCount = (state.usedDice || []).length
    if (totalUsedCount >= 5) return

    // Determine whether this is a move (tile already on board and changing space)
    const hasTile = currentPlayer.spectatorTile && currentPlayer.spectatorTile.onBoard
    const currentPos = hasTile ? currentPlayer.spectatorTile.position : null
    const move = hasTile && currentPos !== pos

    dispatch({ type: 'PLACE_SPECTATOR', playerId: currentPlayer.id, spaceNumber: pos, side, move })
  }

  function modifySpectatorSide() {
    // Modify only the side of the existing tile without moving it
    if (state.phase !== 'playing') return
    const totalUsedCount = (state.usedDice || []).length
    if (totalUsedCount >= 5) return
    const hasTile = currentPlayer.spectatorTile && currentPlayer.spectatorTile.onBoard
    if (!hasTile) return
    const pos = currentPlayer.spectatorTile.position
    dispatch({ type: 'PLACE_SPECTATOR', playerId: currentPlayer.id, spaceNumber: pos, side, move: false })
  }

  return (
    <div>
      <h3>Player Panel</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <strong>{currentPlayer.name || currentPlayer.id}</strong>
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>Turn Order</strong>
        <ol>
          {state.players && (() => {
            const idx = state.currentPlayerIndex || 0
            const ordered = state.players.slice(idx).concat(state.players.slice(0, idx))
            return ordered.map(p => (
              <li key={p.id} style={{ fontWeight: p.id === currentPlayer.id ? '700' : '400' }}>{p.name} {p.id === currentPlayer.id ? ' (current)' : ''}</li>
            ))
          })()}
        </ol>
      </div>
      <div>Coins: {currentPlayer.coins}</div>
      <div>Leg Bets: {(currentPlayer.legBetTiles || []).map(t => `${t.color}:${t.value}`).join(', ')}</div>

      <div style={{ marginTop: 8 }}>
        <h4>Spectator Tile</h4>
        <div>On board: {currentPlayer.spectatorTile && currentPlayer.spectatorTile.onBoard ? `yes @ ${currentPlayer.spectatorTile.position}` : 'no'}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
          <input placeholder="space#" value={spaceInput} onChange={e => setSpaceInput(e.target.value)} style={{ width: 80 }} />
          <select value={side} onChange={e => setSide(e.target.value)}>
            <option value="boost">Boost</option>
            <option value="trap">Trap</option>
          </select>
          <button onClick={placeOrMoveSpectator} disabled={((state.usedDice || []).length >= 5) || state.phase !== 'playing'}>Place/Move Tile</button>
          <button onClick={modifySpectatorSide} disabled={((state.usedDice || []).length >= 5) || state.phase !== 'playing' || !(currentPlayer.spectatorTile && currentPlayer.spectatorTile.onBoard)} style={{ marginLeft: 8 }}>Modify Side Only</button>
        </div>
      </div>
    </div>
  )
}

export default PlayerPanel
