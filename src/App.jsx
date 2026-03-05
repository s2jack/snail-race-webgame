import React, { useState, useEffect, useRef } from 'react'
import Board from './components/Board'
import DiceTower from './components/DiceTower'
import BettingPanel from './components/BettingPanel'
import PlayerCard from './components/PlayerCard'
import Scoreboard from './components/Scoreboard'
import Lobby from './components/Lobby'
import { useGameContext } from './context/GameContext'

export default function App() {
  const { state, dispatch } = useGameContext()
  const [spectatorSpace, setSpectatorSpace] = useState('')
  const [spectatorSide, setSpectatorSide] = useState('boost')

  // ── Mobile detection ─────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [mobileTab, setMobileTab] = useState('board')

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Swipe gesture state ──────────────────────────────────────────────
  const TABS = ['board', 'play', 'card']
  const tabIndex = TABS.indexOf(mobileTab)

  const touchStartX  = useRef(0)
  const touchStartY  = useRef(0)
  const touchDeltaX  = useRef(0)
  // null = undecided, true = horizontal swipe, false = vertical scroll
  const swipeAxis    = useRef(null)
  const [liveOffset, setLiveOffset] = useState(0)   // real-time drag px

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchDeltaX.current = 0
    swipeAxis.current   = null
    setLiveOffset(0)
  }

  function onTouchMove(e) {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    // Decide axis once we have ≥ 8 px of movement
    if (swipeAxis.current === null && Math.hypot(dx, dy) >= 8) {
      swipeAxis.current = Math.abs(dx) > Math.abs(dy)
    }

    if (swipeAxis.current) {
      touchDeltaX.current = dx
      // Resist at the edges so the UI hints there's nothing further
      const atEdge = (tabIndex === 0 && dx > 0) || (tabIndex === TABS.length - 1 && dx < 0)
      setLiveOffset(atEdge ? dx * 0.25 : dx)
    }
  }

  function onTouchEnd() {
    if (swipeAxis.current) {
      const dx = touchDeltaX.current
      if (Math.abs(dx) > 55) {
        const next = dx < 0
          ? Math.min(tabIndex + 1, TABS.length - 1)
          : Math.max(tabIndex - 1, 0)
        setMobileTab(TABS[next])
      }
    }
    touchDeltaX.current = 0
    swipeAxis.current   = null
    setLiveOffset(0)
  }

  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const canPlaceNow = state.phase === 'playing' && (state.usedDice || []).length < 5

  function handleConfirmPlace() {
    if (!canPlaceNow || !spectatorSpace || !currentPlayer) return
    const pos = parseInt(spectatorSpace, 10)
    if (!pos || Number.isNaN(pos)) return
    const tile = currentPlayer.spectatorTile
    // No-op guard: same space + same side means nothing changed
    if (tile?.onBoard && tile.position === pos && tile.side === spectatorSide) return
    const move = !!(tile?.onBoard && tile.position !== pos)
    dispatch({ type: 'PLACE_SPECTATOR', playerId: currentPlayer.id, spaceNumber: pos, side: spectatorSide, move })
    setSpectatorSpace('')
  }

  // ── Shared spectator tile panel props ─────────────────────────────────
  const spectatorProps = {
    spaceInput: spectatorSpace,
    setSpaceInput: setSpectatorSpace,
    side: spectatorSide,
    setSide: setSpectatorSide,
    onApply: handleConfirmPlace,
  }

  // ── Mobile layout ────────────────────────────────────────────────────
  if (isMobile) {
    // Setup / Lobby on mobile — full-screen parchment scroll card
    if (state.phase === 'setup') {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto',
        }}>
          <Lobby />
        </div>
      )
    }

    // Translate the full track: each panel slot is exactly 100vw wide.
    // Using vw-based calc() avoids any percentage-vs-container-width mismatch.
    const trackX = `calc(${-tabIndex * 100}vw + ${liveOffset}px)`
    const isSnapping = liveOffset === 0

    return (
      <div className="app-root">
        {/* Sticky header */}
        <div className="mobile-header">
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#5a3e1b' }}>🐌 Snail Race</h1>
          <MobileHeaderInfo />
        </div>

        {/* Swipeable sliding track ─────────────────────────────────────── */}
        <div
          className="mobile-content"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Inner 3-panel track — each slot is exactly 100vw */}
          <div style={{
            display: 'flex',
            width: 'calc(3 * 100vw)',
            height: '100%',
            transform: `translateX(${trackX})`,
            transition: isSnapping ? 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
            willChange: 'transform',
          }}>

            {/* ── Slot 0: Board ─────────────────────────────────────── */}
            <div style={{ width: '100vw', flexShrink: 0, overflowY: 'auto', overflowX: 'hidden', padding: '10px 10px 84px', WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}>
              <div className="game-card" style={{ padding: '10px 8px', marginBottom: 10 }}>
                <div className="mobile-board-scroll">
                  <Board
                    onSpectatorSpaceSelect={setSpectatorSpace}
                    selectedSpace={spectatorSpace}
                    spectatorSide={spectatorSide}
                    onSideChange={setSpectatorSide}
                    onPlace={handleConfirmPlace}
                  />
                </div>
              </div>
              <div className="game-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 130 }}><SnailStandings /></div>
                <div style={{ width: 1, background: '#e8d9bc', alignSelf: 'stretch' }} />
                <div style={{ flex: 1, minWidth: 130 }}><TurnOrder /></div>
              </div>
              <EventLogWidgetMobile eventLog={state.eventLog || []} />
            </div>

            {/* ── Slot 1: Play ──────────────────────────────────────── */}
            <div style={{ width: '100vw', flexShrink: 0, overflowY: 'auto', overflowX: 'hidden', padding: '10px 10px 84px', WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}>
              <div className="game-card" style={{ marginBottom: 10 }}>
                <DiceTower />
              </div>
              <div className="game-card" style={{ marginBottom: 10 }}>
                <BettingPanel />
              </div>
              <div className="game-card">
                <SpectatorTilePanel {...spectatorProps} />
              </div>
            </div>

            {/* ── Slot 2: My Card ───────────────────────────────────── */}
            <div style={{ width: '100vw', flexShrink: 0, overflowY: 'auto', overflowX: 'hidden', padding: '10px 10px 84px', WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}>
              <div className="game-card">
                <PlayerCard mobileMode />
              </div>
            </div>

          </div>{/* /track */}
        </div>

        {/* Overlays always mounted */}
        <Scoreboard />

        {/* Bottom tab bar */}
        <div className="mobile-tab-bar">
          <button className={`mobile-tab-btn${mobileTab === 'board' ? ' active' : ''}`} onClick={() => setMobileTab('board')}>
            <span className="tab-icon">🏟️</span>Board
          </button>
          <button className={`mobile-tab-btn${mobileTab === 'play' ? ' active' : ''}`} onClick={() => setMobileTab('play')}>
            <span className="tab-icon">🎲</span>Play
          </button>
          <button className={`mobile-tab-btn${mobileTab === 'card' ? ' active' : ''}`} onClick={() => setMobileTab('card')}>
            <span className="tab-icon">👤</span>My Card
          </button>
        </div>
      </div>
    )
  }

  // ── Desktop layout ───────────────────────────────────────────────────
  // Setup / Lobby on desktop — keep original centred parchment look
  if (state.phase === 'setup') {
    return (
      <div className="app-root">
        <h1 className="app-title">🐌 Snail Race</h1>
        <Lobby />
      </div>
    )
  }

  // ── 3-column game layout (≥ 768px) ───────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      maxWidth: '100vw',
    }}>

      {/* ── LEFT COLUMN — Dice · Spectator Tile · Player Card ────────── */}
      <div style={{
        width: 250,
        flexShrink: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '12px 8px 12px 12px',
      }}>
        {/* Title */}
        <h1 className="app-title" style={{ margin: '0 0 2px', fontSize: 22, lineHeight: 1.2 }}>
          🐌 Snail Race
        </h1>

        {/* Dice Tower */}
        <div className="game-card" style={{ padding: '12px 14px', flexShrink: 0 }}>
          <DiceTower />
        </div>

        {/* Spectator Tile */}
        <div className="game-card" style={{ padding: '12px 14px', flexShrink: 0 }}>
          <SpectatorTilePanel {...spectatorProps} />
        </div>

        {/* Current Player Card — fills the rest of the column */}
        <div className="game-card" style={{ padding: '12px 14px', flex: 1 }}>
          <PlayerCard inlineMode />
        </div>
      </div>

      {/* ── CENTER COLUMN — Board ────────────────────────────────────── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 8px',
      }}>
        <div className="game-card" style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
        }}>
          <div style={{ width: '100%' }}>
            <Board
              onSpectatorSpaceSelect={setSpectatorSpace}
              selectedSpace={spectatorSpace}
              spectatorSide={spectatorSide}
              onSideChange={setSpectatorSide}
              onPlace={handleConfirmPlace}
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN — Bets · Turn Order · Standings ─────────────── */}
      <div style={{
        width: 250,
        flexShrink: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '12px 12px 12px 8px',
      }}>
        {/* Leg Bet Stacks + Race Bets */}
        <div className="game-card" style={{ padding: '12px 14px', flexShrink: 0 }}>
          <BettingPanel />
        </div>

        {/* Turn Order */}
        <div className="game-card" style={{ padding: '12px 14px', flexShrink: 0 }}>
          <TurnOrder />
        </div>

        {/* Standings */}
        <div className="game-card" style={{ padding: '12px 14px', flex: 1 }}>
          <SnailStandings />
        </div>
      </div>

      {/* Overlays — always mounted, z-indexed above columns */}
      <Scoreboard />
      <EventLogWidget eventLog={state.eventLog || []} />
    </div>
  )
}

const SNAIL_HEX = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa', black: '#222', white: '#eee' }
const CRAZY = ['black', 'white']

/* ─── Mobile: compact header row (current player + dice remaining) ──────── */
function MobileHeaderInfo() {
  const { state } = useGameContext()
  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  const diceLeft = 5 - (state.usedDice || []).length

  if (!currentPlayer) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      {/* Current player name */}
      <div style={{
        background: 'linear-gradient(135deg, #56b243, #3d8a30)',
        color: '#fff', fontWeight: 800, fontSize: 12,
        padding: '4px 10px', borderRadius: 20,
        border: '2px solid #3d8a30',
        maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {currentPlayer.name}
      </div>
      {/* Dice remaining badge */}
      <div style={{
        background: '#fff8ee', border: '2px solid #b98a49',
        borderRadius: 20, padding: '3px 9px',
        fontSize: 12, fontWeight: 800, color: '#5a3e1b',
        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
      }}>
        🎲 <span>{diceLeft}</span>
      </div>
    </div>
  )
}

/* ─── Mobile: inline event log (collapsible, shown inside Board tab) ─────── */
function EventLogWidgetMobile({ eventLog }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      background: 'rgba(255,248,238,0.94)', border: '2px solid #b98a49',
      borderRadius: 8, overflow: 'hidden', marginTop: 0,
    }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <strong style={{ color: '#5a3e1b', fontSize: 13 }}>📋 Event Log</strong>
        <span style={{ color: '#9a7a4a', fontSize: 12 }}>{expanded ? '▲ Hide' : '▼ Show'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 12px 10px', fontSize: 12, lineHeight: 1.5, color: '#3a2a10', maxHeight: '30vh', overflowY: 'auto' }}>
          {eventLog.slice(-100).slice().reverse().map((l, i) => (
            <div key={i} style={{ marginBottom: 4, paddingBottom: 4, borderBottom: '1px solid #ede0c8' }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  )
}

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
            borderWidth: '0 6px 6px', borderStyle: 'solid',
            borderColor: 'transparent transparent #3a2a10',
          }} />
          {text}
        </div>
      )}
    </span>
  )
}

function SpectatorTilePanel({ spaceInput, setSpaceInput, side, setSide, onApply }) {
  const { state } = useGameContext()

  const currentPlayer = state.players && state.players[state.currentPlayerIndex]
  if (!currentPlayer) return null

  const totalUsedCount = (state.usedDice || []).length
  const canPlace = state.phase === 'playing' && totalUsedCount < 5
  const tile = currentPlayer.spectatorTile

  const inputSt = {
    padding: '5px 8px',
    border: `1px solid ${canPlace ? '#b98a49' : '#ddd'}`,
    borderRadius: 5,
    fontSize: 12,
    background: canPlace ? '#fff' : '#f5f0e8',
    color: '#5a3e1b',
    outline: 'none',
  }

  return (
    <div style={{ minWidth: 180 }}>
      <div className="game-card-title" style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        🪨 Spectator Tile
        <HelpTip text={`Place your tile on any space (1–16) to affect snails that land there.

• 🚀 Boost: moves the landing snail +1 space forward.
• 🪤 Trap: moves the landing snail −1 space backward.
• 🪙 Earn 1 coin whenever any snail steps on your tile.

You can place, move, or flip your tile once per turn (before rolling). Chain reactions are not triggered.`} />
      </div>

      {/* Status */}
      <div style={{ marginBottom: 8, fontSize: 11, color: '#7a5a2a' }}>
        {tile?.onBoard
          ? <span style={{ padding: '2px 8px', borderRadius: 20, background: tile.side === 'boost' ? '#d4f0d0' : '#f9d8d8', border: `1px solid ${tile.side === 'boost' ? '#7bc97a' : '#e08080'}`, fontWeight: 700 }}>
              {tile.side === 'boost' ? '🚀 Boost' : '🪤 Trap'} @ #{tile.position}
            </span>
          : <span style={{ fontStyle: 'italic', color: '#9a7a4a' }}>Not placed</span>
        }
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Space number input */}
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#7a5a2a', marginBottom: 3 }}>Space #</label>
          <input
            type="number" min="1" max="16" placeholder="1–16"
            value={spaceInput}
            onChange={e => setSpaceInput(e.target.value)}
            style={{ ...inputSt, width: '100%', boxSizing: 'border-box' }}
            disabled={!canPlace}
          />
        </div>

        {/* Boost / Trap select */}
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#7a5a2a', marginBottom: 3 }}>Type</label>
          <select
            value={side}
            onChange={e => setSide(e.target.value)}
            style={{ ...inputSt, width: '100%', boxSizing: 'border-box' }}
            disabled={!canPlace}
          >
            <option value="boost">🚀 Boost (+1)</option>
            <option value="trap">🪤 Trap (−1)</option>
          </select>
        </div>

        {/* Confirm button — revealed only when a space has been selected */}
        {spaceInput && canPlace ? (
          <button
            onClick={onApply}
            style={{
              padding: '9px 10px', fontSize: 12, fontWeight: 800,
              background: 'linear-gradient(135deg, #56b243, #3d8a30)',
              color: '#fff',
              border: '2px solid #3d8a30',
              borderRadius: 6,
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 2px 8px rgba(61,138,48,0.35)',
            }}
          >
            {side === 'boost' ? '🚀' : '🪤'} Place on #{spaceInput}
          </button>
        ) : (
          <button
            disabled
            style={{
              padding: '7px 10px', fontSize: 11, fontWeight: 700,
              background: '#d0bfa0', color: '#bfae8a',
              border: '2px solid #bfae8a',
              borderRadius: 6, cursor: 'not-allowed', width: '100%',
            }}
          >{tile?.onBoard ? 'Update Tile' : 'Place Tile'}</button>
        )}
      </div>
    </div>
  )
}

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
          maxWidth: 150, overflow: 'hidden',
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>Now:</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentPlayer.name}</span>
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
              maxWidth: 150, overflow: 'hidden',
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
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
  const [hovered, setHovered] = useState(false)

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
    transition: 'box-shadow 0.2s',
  }

  return (
    <div
      style={{
        ...baseStyle,
        width: hovered ? 360 : 180,
        maxHeight: hovered ? 'calc(100vh - 520px)' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.2s ease, max-height 0.2s ease, box-shadow 0.2s',
        boxShadow: hovered ? '0 -4px 18px rgba(0,0,0,0.22)' : '0 -2px 12px rgba(0,0,0,0.15)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header — always visible */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: hovered ? '1px solid #d0b880' : 'none', flexShrink: 0, background: '#fff8ee', borderRadius: '6px 6px 0 0', whiteSpace: 'nowrap' }}>
        <strong style={{ color: '#5a3e1b', fontSize: 13 }}>📋 Event Log</strong>
      </div>
      {/* Scrollable entries — only visible when hovering */}
      {hovered && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', fontSize: 13, lineHeight: '1.5', color: '#3a2a10' }}>
          {eventLog.slice(-200).slice().reverse().map((l, i) => (
            <div key={i} style={{ marginBottom: 5, padding: '4px 0', borderBottom: '1px solid #ede0c8' }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  )
}
