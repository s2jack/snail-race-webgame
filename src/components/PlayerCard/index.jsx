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

export function PlayerCard({ mobileMode = false }) {
  const { state, dispatch } = useGameContext()
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const [isOpen, setIsOpen] = useState(true)
  const { localPlayerId } = useLocalPlayer() || {}
  const validLocal = localPlayerId && state.players && state.players.find(p => p.id === localPlayerId) ? localPlayerId : null
  const rollClickRef = useRef(false)

  useEffect(() => { rollClickRef.current = false }, [state.phase, state.usedDice])

  // Hover-to-open: only active on desktop (not mobileMode)
  const isOpenRef = useRef(isOpen)
  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])

  useEffect(() => {
    if (mobileMode) return   // no hover behaviour on mobile
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
  }, [mobileMode])

  function handleRoll() {
    if (!currentPlayer || rollClickRef.current) return
    if (validLocal && validLocal !== currentPlayer.id) return
    rollClickRef.current = true
    dispatch({ type: 'ROLL_DIE', playerId: currentPlayer.id })
  }

  if (!currentPlayer) return null

  const totalUsedCount = (state.usedDice || []).length
  const canPlaceTile = state.phase === 'playing' && totalUsedCount < 5


  const colorDot = (color) => {
    const map = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa', black: '#222', white: '#eee' }
    return map[color] || color
  }

  const whiteText = (color) => !['white', 'yellow'].includes(color)

  // ── Mobile inline render ────────────────────────────────────────────────
  if (mobileMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '10px 0 12px',
          borderBottom: `2px solid ${C.gold}`,
          background: `linear-gradient(135deg, #f5e8cc 0%, #fff8ee 100%)`,
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
        }}>
          <span style={{ fontSize: 22 }}>🐌</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.brown, lineHeight: 1.1 }}>
              {currentPlayer.name || currentPlayer.id}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>Current Player</div>
          </div>
        </div>

        {/* Content (same sections as desktop, no scroll container needed) */}
        {/* ── Coins ── */}
        <div style={{ ...sec }}>
          <div style={secTitle}>Coins</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 46, height: 46, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
              border: `3px solid `,
              fontWeight: 900, fontSize: 20, color: '#5a3e1b',
              boxShadow: '0 2px 8px rgba(180,130,0,0.3)',
            }}>
              {currentPlayer.coins}
            </div>
            <span style={{ fontSize: 13, color: C.textMuted }}>available</span>
          </div>
        </div>

        {/* ── Leg Bets ── */}
        <div style={{ ...sec }}>
          <div style={secTitle}>Leg Bets</div>
          {(currentPlayer.legBetTiles || []).length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(currentPlayer.legBetTiles || []).map((bet, idx) => (
                <img
                  key={idx}
                  src={`/colored_coins/${bet.color}-coin-${bet.value}.png`}
                  alt={`${bet.color} ${bet.value} coin`}
                  title={`${bet.color} — ${bet.value} coins`}
                  style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
                />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>No leg bets placed</div>
          )}
        </div>
      </div>
    )
  }

  // ── Desktop slide-in panel render ───────────────────────────────────────
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

          {/* ── Coins ──────────────────────────────────────────────────── */}
          <div style={sec}>
            <div style={secTitle}>Coins</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 46, height: 46, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                border: `3px solid `,
                fontWeight: 900, fontSize: 20, color: '#5a3e1b',
                boxShadow: '0 2px 8px rgba(180,130,0,0.3)',
              }}>
                {currentPlayer.coins}
              </div>
              <span style={{ fontSize: 13, color: C.textMuted }}>available</span>
            </div>
          </div>

          {/* â”€â”€ Leg Bets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div style={sec}>
            <div style={secTitle}>Leg Bets</div>
            {(currentPlayer.legBetTiles || []).length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(currentPlayer.legBetTiles || []).map((bet, idx) => (
                  <img
                    key={idx}
                    src={`/colored_coins/${bet.color}-coin-${bet.value}.png`}
                    alt={`${bet.color} ${bet.value} coin`}
                    title={`${bet.color} — ${bet.value} coins`}
                    style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.textMuted, fontStyle: 'italic' }}>No leg bets placed</div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default PlayerCard
