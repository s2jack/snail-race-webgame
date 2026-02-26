import React from 'react'
import { useGameContext } from '../../context/GameContext'
import { useLocalPlayer } from '../../context/LocalPlayerContext'
import { useRef, useEffect } from 'react'

export function DiceTower() {
  const { state, dispatch } = useGameContext()
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const { localPlayerId } = useLocalPlayer() || {}
  const validLocal = localPlayerId && state.players && state.players.find(p => p.id === localPlayerId) ? localPlayerId : null
  const clickRef = useRef(false)

  function handleRoll() {
    if (!currentPlayer) return
    if (clickRef.current) return
    // allow rolling when no local player is set or when local player matches an existing player
    if (validLocal && validLocal !== currentPlayer.id) return
    clickRef.current = true
    dispatch({ type: 'ROLL_DIE', playerId: currentPlayer.id })
  }

  useEffect(() => {
    // reset click guard when phase or usedDice changes
    clickRef.current = false
  }, [state.phase, state.usedDice])

  return (
    <div>
      <h3>Dice Tower</h3>
      <div>Dice remaining: {state.dicePool ? state.dicePool.length : 0}</div>
      <button onClick={handleRoll} disabled={!currentPlayer || state.phase !== 'playing' || (validLocal ? validLocal !== currentPlayer.id : false)}>Roll Die (+1 coin)</button>

      <div style={{ marginTop: 8 }}>
        <strong>Used Dice (this leg):</strong>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {(state.usedDice || []).map((d, i) => {
            const key = `${d.type}-${d.color || d.crazyColor}-${i}`
            const bg = d.type === 'color' ? d.color : (d.crazyColor === 'white' ? '#fff' : '#000')
            const color = d.type === 'color' ? '#fff' : (d.crazyColor === 'white' ? '#000' : '#fff')
            const style = { width: 36, height: 36, borderRadius: 6, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc' }
            const label = d.type === 'color' ? d.color[0].toUpperCase() + d.value : `${d.crazyColor[0].toUpperCase()}${d.value}`
            return <div key={key} style={style} title={JSON.stringify(d)}>{label}</div>
          })}
        </div>
      </div>
    </div>
  )
}



export default DiceTower
