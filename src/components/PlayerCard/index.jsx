import React, { useState, useRef, useEffect } from 'react'
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
          bottom: '120%',
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
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            borderWidth: 6, borderStyle: 'solid',
            borderColor: '#3a2a10 transparent transparent transparent',
          }} />
        </div>
      )}
    </span>
  )
}

// â”€â”€ Warm palette (matches lobby / game-card aesthetic) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  cream:       '#fff8ee',
  gold:        '#b98a49',
  goldLight:   '#e0c88a',
  goldDark:    '#7a5a2a',
  goldPale:    '#f5e8cc',
  goldPaler:   '#fdf3e0',
  brown:       '#5a3e1b',
  divider:     '#e8d9bc',
  textMuted:   '#9a7a4a',
  green:       '#56b243',
  greenDark:   '#3d8a30',
  amber:       '#f59e0b',
}

const sec = {
  marginBottom: 18,
  paddingBottom: 16,
  borderBottom: `1px solid ${C.divider}`,
}

const secTitle = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: C.textMuted,
  marginBottom: 10,
}

const btn = (active) => ({
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 700,
  border: `1px solid ${active ? C.gold : '#d0c0a0'}`,
  borderRadius: 5,
  cursor: active ? 'pointer' : 'not-allowed',
  background: active ? C.cream : '#f0e8d8',
  color: active ? C.brown : '#bfae8a',
  transition: 'background 0.15s',
})

const inputSt = (disabled) => ({
  padding: '6px 10px',
  border: `1px solid ${disabled ? '#ddd' : C.gold}`,
  borderRadius: 5,
  fontSize: 13,
  background: disabled ? '#f5f0e8' : '#fff',
  color: C.brown,
  outline: 'none',
})

export function PlayerCard() {
  const { state, dispatch } = useGameContext()
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const [isOpen, setIsOpen] = useState(true)
  const [spaceInput, setSpaceInput] = useState('')
  const [side, setSide] = useState('boost')
  const { localPlayerId } = useLocalPlayer() || {}
  const validLocal = localPlayerId && state.players && state.players.find(p => p.id === localPlayerId) ? localPlayerId : null
  const rollClickRef = useRef(false)

  useEffect(() => { rollClickRef.current = false }, [state.phase, state.usedDice])

  // Hover-to-open: open when mouse enters the 20px right-edge zone;
  // close when mouse moves beyond the open panel width (380px) to the left.
  const isOpenRef = useRef(isOpen)
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])

  useEffect(() => {
    const PANEL_WIDTH = 380
    const TRIGGER_ZONE = 20
    function handleMouseMove(e) {
      const fromRight = window.innerWidth - e.clientX
      if (fromRight <= TRIGGER_ZONE) {
        setIsOpen(true)
      } else if (isOpenRef.current && fromRight > PANEL_WIDTH) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  function handleRoll() {
    if (!currentPlayer || rollClickRef.current) return
    if (validLocal && validLocal !== currentPlayer.id) return
    rollClickRef.current = true
    dispatch({ type: 'ROLL_DIE', playerId: currentPlayer.id })
  }

  if (!currentPlayer) return null

  const totalUsedCount = (state.usedDice || []).length
  const canPlaceTile = state.phase === 'playing' && totalUsedCount < 5
  const canRoll = state.phase === 'playing' && !!currentPlayer && !(validLocal && validLocal !== currentPlayer.id)

  function placeOrMoveSpectator() {
    const pos = parseInt(spaceInput, 10)
    if (Number.isNaN(pos) || !canPlaceTile) return
    const hasTile = currentPlayer.spectatorTile?.onBoard
    const move = hasTile && currentPlayer.spectatorTile.position !== pos
    dispatch({ type: 'PLACE_SPECTATOR', playerId: currentPlayer.id, spaceNumber: pos, side, move })
    setSpaceInput('')
  }

  function modifySpectatorSide() {
    if (!canPlaceTile || !currentPlayer.spectatorTile?.onBoard) return
    dispatch({ type: 'PLACE_SPECTATOR', playerId: currentPlayer.id, spaceNumber: currentPlayer.spectatorTile.position, side, move: false })
  }

  function placeRace(color, type) {
    if (!canPlaceTile) return
    dispatch({ type: 'PLACE_RACE_BET', playerId: currentPlayer.id, color, betType: type })
  }

  const colorDot = (color) => {
    const map = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa', black: '#222', white: '#eee' }
    return map[color] || color
  }

  const whiteText = (color) => !['white', 'yellow'].includes(color)

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? '\u2192' : '\u2190'}
        className="panel-toggle"
        style={{
          position: 'fixed',
          right: isOpen ? 380 : 0,
          top: 20,
          zIndex: 101,
          backgroundColor: C.cream,
          border: `3px solid ${C.gold}`,
          borderRight: isOpen ? 'none' : `3px solid ${C.gold}`,
          borderRadius: '8px 0 0 8px',
          padding: '8px 10px',
          cursor: 'pointer',
          fontSize: 18,
          color: C.brown,
          transition: 'right 0.3s ease',
          userSelect: 'none',
          boxShadow: isOpen ? 'none' : `-2px 2px 8px rgba(0,0,0,0.12)`,
        }}
      >
        {isOpen ? '\u2192' : '\u2190'}
      </button>

      {/* Panel */}
      <div style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        width: isOpen ? 380 : 0,
        backgroundColor: C.cream,
        borderLeft: `4px solid ${C.gold}`,
        boxShadow: isOpen ? '-6px 0 20px rgba(0,0,0,0.18)' : 'none',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: `3px solid ${C.gold}`,
          background: `linear-gradient(135deg, #f5e8cc 0%, #fff8ee 100%)`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 22 }}>&#x1F40C;</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.brown, lineHeight: 1.1 }}>
              {currentPlayer.name || currentPlayer.id}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>Current Player</div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>

          {/* â”€â”€ Coins + Roll Die â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div style={sec}>
            <div style={secTitle}>Coins</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  border: `3px solid ${C.gold}`,
                  fontWeight: 900, fontSize: 20, color: '#5a3e1b',
                  boxShadow: '0 2px 8px rgba(180,130,0,0.3)',
                }}>
                  {currentPlayer.coins}
                </div>
                <span style={{ fontSize: 13, color: C.textMuted }}>available</span>
              </div>
              <button
                onClick={handleRoll}
                disabled={!canRoll}
                className="btn-green"
                style={{
                  padding: '10px 16px',
                  fontSize: 14, fontWeight: 800,
                  background: canRoll
                    ? `linear-gradient(135deg, ${C.green}, ${C.greenDark})`
                    : '#d0c0a0',
                  color: '#fff',
                  border: `2px solid ${canRoll ? C.greenDark : '#bfae8a'}`,
                  borderRadius: 8,
                  cursor: canRoll ? 'pointer' : 'not-allowed',
                  boxShadow: canRoll ? '0 2px 8px rgba(60,140,40,0.3)' : 'none',
                  textAlign: 'center', lineHeight: 1.3,
                }}
              >
                Roll Die<br />
                <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.9 }}>+1 coin</span>
              </button>
            </div>
          </div>

          {/* â”€â”€ Leg Bets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div style={sec}>
            <div style={secTitle}>Leg Bets</div>
            {(currentPlayer.legBetTiles || []).length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(currentPlayer.legBetTiles || []).map((bet, idx) => (
                  <span key={idx} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 20,
                    background: colorDot(bet.color),
                    color: whiteText(bet.color) ? '#fff' : '#333',
                    fontSize: 12, fontWeight: 700,
                    border: '2px solid rgba(0,0,0,0.15)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  }}>
                    {bet.color} <span style={{ opacity: 0.85 }}>({bet.value} coins)</span>
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>No leg bets placed</div>
            )}
          </div>

          {/* â”€â”€ Race Bets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div style={sec}>
            <div style={{ ...secTitle, display: 'flex', alignItems: 'center' }}>
              Race Bets in Hand
              <HelpTip text={`Predict the overall race Winner or Loser for each snail color.

• Winner bet pays out based on pile position (8 / 5 / 3 / 2 / 1 coins).
• Loser bet pays out based on pile position (8 / 5 / 3 / 2 / 1 coins).
• Cards stay hidden from other players until final scoring.
• You can only place race bets during the playing phase (before all 5 dice are used).`} />
            </div>
            {(currentPlayer.raceBetCardsInHand || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(currentPlayer.raceBetCardsInHand || []).map(color => (
                    <div key={color} className="race-bet-card" style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    background: '#fff',
                    border: `2px solid ${colorDot(color)}`,
                    borderRadius: 8,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: colorDot(color),
                      border: color === 'white' ? '2px solid #ccc' : '2px solid rgba(0,0,0,0.15)',
                    }} />
                    <span style={{ flex: 1, fontWeight: 700, color: C.brown, fontSize: 13, textTransform: 'capitalize' }}>{color}</span>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button
                        onClick={() => placeRace(color, 'winner')}
                        disabled={!canPlaceTile}
                        className="btn-secondary"
                        style={{
                          ...btn(canPlaceTile),
                          background: canPlaceTile ? '#fffbe6' : '#f0e8d8',
                          borderColor: canPlaceTile ? C.amber : '#d0c0a0',
                        }}
                      >Win</button>
                      <button
                        onClick={() => placeRace(color, 'loser')}
                        disabled={!canPlaceTile}
                        className="btn-secondary"
                        style={{
                          ...btn(canPlaceTile),
                          background: canPlaceTile ? '#fff0f0' : '#f0e8d8',
                          borderColor: canPlaceTile ? '#e07070' : '#d0c0a0',
                        }}
                      >Lose</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>No race bet cards in hand</div>
            )}
          </div>

          {/* â”€â”€ Spectator Tile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div style={{ ...sec, borderBottom: 'none', marginBottom: 0 }}>
            <div style={{ ...secTitle, display: 'flex', alignItems: 'center' }}>
              Spectator Tile
              <HelpTip text={`Place your tile on any board space (1-16) face-up as Boost or Trap.

• Boost: snail landing here moves +1 forward; you earn 1 coin.
• Trap: snail landing here moves -1 backward; you earn 1 coin.
• Chain reactions are NOT triggered if the snail lands on another tile after being boosted/trapped.
• You may move or flip your tile once per turn as your action.
• Placing/moving counts as your turn action.`} />
            </div>
            <div style={{
              padding: 14,
              background: C.goldPaler,
              border: `2px solid ${C.goldLight}`,
              borderRadius: 8,
            }}>
              {/* Status badge */}
              <div style={{ marginBottom: 12 }}>
                {currentPlayer.spectatorTile?.onBoard ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 20,
                    background: side === 'boost' ? '#d4f0d0' : '#f9d8d8',
                    border: `1px solid ${side === 'boost' ? '#7bc97a' : '#e08080'}`,
                    fontSize: 12, fontWeight: 700, color: C.brown,
                  }}>
                    {currentPlayer.spectatorTile.side === 'boost' ? 'Boost' : 'Trap'} @ Space {currentPlayer.spectatorTile.position}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>Not yet placed</span>
                )}
              </div>

              {/* Space input */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.goldDark, marginBottom: 4 }}>Space #</label>
                <input
                  type="number" min="1" max="16" placeholder="1-16"
                  value={spaceInput}
                  onChange={e => setSpaceInput(e.target.value)}
                  style={{ ...inputSt(!canPlaceTile), width: 80 }}
                  disabled={!canPlaceTile}
                />
              </div>

              {/* Side select */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.goldDark, marginBottom: 4 }}>Type</label>
                <select
                  value={side}
                  onChange={e => setSide(e.target.value)}
                  style={{ ...inputSt(!canPlaceTile), width: '100%' }}
                  disabled={!canPlaceTile}
                >
                  <option value="boost">Boost (+1 forward)</option>
                  <option value="trap">Trap (-1 backward)</option>
                </select>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={placeOrMoveSpectator}
                  disabled={!canPlaceTile}
                  className="btn-gold"
                  style={{
                    flex: 1, padding: '8px 0', fontWeight: 700, fontSize: 12,
                    background: canPlaceTile ? C.gold : '#d0bfa0',
                    color: '#fff',
                    border: `2px solid ${canPlaceTile ? C.goldDark : '#bfae8a'}`,
                    borderRadius: 6,
                    cursor: canPlaceTile ? 'pointer' : 'not-allowed',
                  }}
                >
                  {currentPlayer.spectatorTile?.onBoard ? 'Move Tile' : 'Place Tile'}
                </button>
                {currentPlayer.spectatorTile?.onBoard && (
                  <button
                    onClick={modifySpectatorSide}
                    disabled={!canPlaceTile}
                    className="btn-secondary"
                    style={{
                      flex: 1, padding: '8px 0', fontWeight: 700, fontSize: 12,
                      background: canPlaceTile ? '#f0e0c0' : '#e8dcc8',
                      color: canPlaceTile ? C.brown : '#bfae8a',
                      border: `2px solid ${canPlaceTile ? C.gold : '#d0bfa0'}`,
                      borderRadius: 6,
                      cursor: canPlaceTile ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Flip Side
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default PlayerCard

