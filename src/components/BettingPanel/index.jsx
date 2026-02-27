import React, { useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { useLocalPlayer } from '../../context/LocalPlayerContext'

function HelpTip({ text }) {
  const [visible, setVisible] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 6 }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 16, height: 16, borderRadius: '50%',
          background: '#b98a49', color: '#fff',
          fontSize: 10, fontWeight: 900,
          cursor: 'default', userSelect: 'none',
          lineHeight: 1, flexShrink: 0,
        }}
      >?</span>
      {visible && (
        <div style={{
          position: 'absolute',
          top: '120%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: '#3a2a10',
          color: '#fff8ee',
          padding: '10px 14px',
          borderRadius: 8,
          fontSize: 12,
          lineHeight: 1.6,
          width: 260,
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
          whiteSpace: 'pre-line',
        }}>
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
            borderWidth: 6, borderStyle: 'solid',
            borderColor: 'transparent transparent #3a2a10 transparent',
          }} />
          {text}
        </div>
      )}
    </span>
  )
}

export function BettingPanel() {
  const { state, dispatch } = useGameContext()
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const { localPlayerId } = useLocalPlayer() || {}

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

  const hasAnyRaceBet = currentPlayer && (currentPlayer.raceBetCardsInHand || []).length > 0
  const raceBetColors = new Set(currentPlayer ? (currentPlayer.raceBetCardsInHand || []) : [])

  return (
    <div>
      {/* ── Leg Bet Stacks heading + circles row ── */}
      <div className="game-card-title" style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
        💰 Leg Bet Stacks
        <HelpTip text={`Predict which snail will finish 1st or 2nd this Leg.

• Take the top tile from any snail's stack — tiles are worth 5, 3, or 2 coins (first come, first served).
• If that snail finishes 1st: earn the tile's full value.
• If that snail finishes 2nd: earn 1 coin.
• Any other position: lose 1 coin.
• You may place one leg bet per turn. Each snail's stack refills at the start of every new Leg.`} />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {Object.entries(state.legBetStacks || {}).map(([color, stack]) => {
          const topValue = stack[0] ? stack[0].value : null
          const canBet = isActive && !!topValue
          const stackLen = stack.length
          // Each coin image is ~52 px wide; stack coins offset 8 px downward per layer.
          const COIN_W = 52
          const COIN_OFFSET = 8
          // Container height holds the tallest possible stack (4 tiles) so layout is stable.
          const CONTAINER_H = COIN_W + 3 * COIN_OFFSET  // 76 px

          return (
            <div
              key={color}
              onClick={() => canBet && placeLeg(color)}
              title={canBet ? `Leg bet on ${color} (${topValue} pts)` : topValue ? 'Not your turn' : 'Stack empty'}
              style={{
                position: 'relative',
                width: COIN_W,
                height: CONTAINER_H,
                cursor: canBet ? 'pointer' : 'default',
                opacity: topValue ? 1 : 0.38,
                transition: 'transform 0.1s',
                userSelect: 'none',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (canBet) e.currentTarget.style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {stackLen === 0 ? (
                /* Empty slot — dashed ring as placeholder */
                <div style={{
                  width: COIN_W, height: COIN_W,
                  borderRadius: '50%',
                  border: '2px dashed #c9aa7a',
                  boxSizing: 'border-box',
                  position: 'absolute', top: 0,
                }} />
              ) : (
                /* Render coins from bottom → top so the top tile (index 0) paints last and sits visually on top */
                [...stack].reverse().map((tile, i) => {
                  const stackIdx = stackLen - 1 - i  // original position in stack array
                  return (
                    <img
                      key={stackIdx}
                      src={`/colored_coins/${color}-coin-${tile.value}.png`}
                      alt={`${color} ${tile.value}`}
                      style={{
                        position: 'absolute',
                        top: stackIdx * COIN_OFFSET,
                        left: 0,
                        width: COIN_W,
                        pointerEvents: 'none',
                        display: 'block',
                      }}
                    />
                  )
                })
              )}
            </div>
          )
        })}
      </div>

      {/* ── Race Bets heading — sits between circles and buttons ── */}
      {hasAnyRaceBet && (
        <>
          <div className="game-card-title" style={{ margin: '12px 0 6px 0', display: 'flex', alignItems: 'center' }}>
            🏆 Race Bets
            <HelpTip text={`Predict the overall race Winner or Loser for each snail color.

• Winner bet pays out based on pile position (8 / 5 / 3 / 2 / 1 coins).
• Loser bet pays out based on pile position (8 / 5 / 3 / 2 / 1 coins).
• Cards stay hidden from other players until final scoring.`} />
          </div>

          {/* Win/Lose button row — columns aligned to circles above via same gap + width */}
          <div style={{ display: 'flex', gap: 14, paddingLeft: 3, flexWrap: 'wrap' }}>
            {Object.entries(state.legBetStacks || {}).map(([color]) => {
              const hasRaceBet = raceBetColors.has(color)
              return (
                <div key={color} style={{ width: 52, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {hasRaceBet ? (
                    <>
                      <button
                        onClick={() => placeRace(color, 'winner')}
                        disabled={!isActive}
                        style={{
                          padding: '3px 0', fontSize: 10, fontWeight: 700, width: 52,
                          background: isActive ? '#fffbe6' : '#f0e8d8',
                          color: isActive ? '#7a5a2a' : '#bfae8a',
                          border: `1px solid ${isActive ? '#f59e0b' : '#d0c0a0'}`,
                          borderRadius: 4,
                          cursor: isActive ? 'pointer' : 'not-allowed',
                        }}
                      >Win</button>
                      <button
                        onClick={() => placeRace(color, 'loser')}
                        disabled={!isActive}
                        style={{
                          padding: '3px 0', fontSize: 10, fontWeight: 700, width: 52,
                          background: isActive ? '#fff0f0' : '#f0e8d8',
                          color: isActive ? '#c0392b' : '#bfae8a',
                          border: `1px solid ${isActive ? '#e07070' : '#d0c0a0'}`,
                          borderRadius: 4,
                          cursor: isActive ? 'pointer' : 'not-allowed',
                        }}
                      >Lose</button>
                    </>
                  ) : (
                    /* empty spacer keeps other columns aligned */
                    <div style={{ width: 52 }} />
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default BettingPanel
