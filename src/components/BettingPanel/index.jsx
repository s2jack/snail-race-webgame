import React, { useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useLocalPlayer } from '../../context/LocalPlayerContext'

export function BettingPanel() {
  const { state, dispatch } = useGameContext()
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const { localPlayerId } = useLocalPlayer() || {}
  const [selectedColor, setSelectedColor] = useState(state && Object.keys(state.legBetStacks || {})[0])

  const validLocal = localPlayerId && state.players && state.players.find(p => p.id === localPlayerId) ? localPlayerId : null
  const totalUsedCount = (state.usedDice || []).length
  const isActive = !!currentPlayer && state.phase === 'playing' && totalUsedCount < 5 && (!validLocal || validLocal === currentPlayer.id)

  function placeLeg(color) {
    if (!isActive) return
    dispatch({ type: 'PLACE_LEG_BET', playerId: currentPlayer.id, color })
  }

  function placeRace(color, type) {
    if (!isActive) return
    dispatch({ type: 'PLACE_RACE_BET', playerId: currentPlayer.id, color, betType: type })
  }

  return (
    <div>
      <h3>Betting Panel</h3>
      <div>
        <strong>Leg Bet Stacks:</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(state.legBetStacks || {}).map(([color, stack]) => (
            <div key={color} style={{ padding: 8, border: '1px solid #ddd' }}>
              <div>{color}</div>
              <div>Top: {stack[0] ? stack[0].value : '—'}</div>
              <button onClick={() => placeLeg(color)} disabled={!isActive}>Take Leg Bet</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Race Bets (your cards):</strong>
        <div>Cards: {(currentPlayer && currentPlayer.raceBetCardsInHand || []).join(', ')}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {(currentPlayer && currentPlayer.raceBetCardsInHand || []).map(c => (
            <div key={c} style={{ padding: 6, border: '1px solid #eee' }}>
              <div>{c}</div>
              <button onClick={() => placeRace(c, 'winner')}>Place Winner Bet</button>
              <button onClick={() => placeRace(c, 'loser')}>Place Loser Bet</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BettingPanel
