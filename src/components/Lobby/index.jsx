import React, { useState } from 'react'
import { useGameContext } from '../../context/GameContext'
import { v4 as uuidv4 } from 'uuid'
import { GameManual } from '../GameManual'

// ── Style constants ─────────────────────────────────────────────────────────
const C = {
  brown:      '#5a3e1b',
  muted:      '#9a7a4a',
  divider:    '#e8d9bc',
  goldDark:   '#7a5a2a',
  gold:       '#b98a49',
  goldPale:   '#f5e8cc',
  green:      '#56b243',
  greenDark:  '#3d8a30',
  blue:       '#2b8bd6',
  blueDark:   '#1a6aab',
  amber:      '#d4890a',
  amberDark:  '#a66007',
  woodDark:   '#3e1e08',
  woodMid:    '#8b5a2b',
}

// The lobby-panel.png image (766 × 985 px) is used as the background.
// All interactive content is overlaid via position:absolute, with insets
// calibrated to the image's painted zones.
//
// Vertical zones (% of image height, top-origin):
//   Title bar   :  7% – 20%
//   Wood strip  : 20% – 33%
//   Players hdr : 33% – 39%
//   Players box : 39% – 67%
//   Btns row    : 68% – 80%
//   Start btn   : 81% – 91%
//   Manual link : 91% – 96%
// Horizontal content margins: 10% – 90%

export function Lobby() {
  const { state, dispatch } = useGameContext()
  const [name, setName] = useState('')
  const [showManual, setShowManual] = useState(false)

  const canStart = state.players.length >= 2
  const canRandomize = state.players.length >= 2

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
    dispatch({ type: 'INIT_PLAYERS', players: [] })
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {/*
        Panel shell — background image IS the entire visual chrome (frame,
        parchment, wood strip, painted button areas). Interactive DOM elements
        are positioned over each painted zone.
        aspect-ratio keeps proportions locked to the source image (766 × 985).
      */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        /* lock to image proportions so % positioning is predictable */
        aspectRatio: '766 / 985',
        maxHeight: '96dvh',
        backgroundImage: 'url(/lobby/lobby-panel.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.55))',
      }}>

        {/* ── Title ─────────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          top: '7%', left: '10%', right: '10%',
          height: '13%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(20px, 6cqw, 30px)',
          fontWeight: 900,
          color: C.brown,
          letterSpacing: '-0.5px',
          textShadow: '0 1px 3px rgba(90,60,20,0.18)',
          fontFamily: 'Georgia, "Times New Roman", serif',
          pointerEvents: 'none',
          /* container query font scaling fallback */
          lineHeight: 1.1,
        }}>
        </div>

        {/* ── Input row (sits inside the painted wood strip) ── */}
        <div style={{
          position: 'absolute',
          top: '20%',
          height: '7%',
          display: 'flex',
          alignItems: 'center',
          width: '64%',
        }}>
          <input
            placeholder="Player Name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
            style={{
              flex: 1,
              height: '100%',
              width: '60%',
              maxWidth: '60%',
              paddingLeft: '10px',
              fontSize: 'clamp(12px, 3.5cqw, 15px)',
              fontWeight: 600,
              borderRadius: 7,
              border: 'none',
              background: 'rgba(0,0,0,0)',
              color: '#f5dfa0',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              caretColor: '#f5dfa0',
            }}
          />
          <button
            onClick={addPlayer}
            style={{
              height: '100%',
              width: '40%',
              maxWidth: '40%',
              fontSize: 'clamp(11px, 3.2cqw, 14px)',
              fontWeight: 800,
              background: 'rgba(0,0,0,0)',
              borderRadius: 8,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              flexShrink: 0,
              border: '2px solid rgba(255, 255, 255, 0)',
            }}
          >
          </button>
        </div>

        {/* ── Players list box (sits on parchment) ── */}
        <div style={{
          position: 'absolute',
          width: '66%',
          top: '35.5%',
          height: '29%',
          borderRadius: 8,
          background: 'rgba(220,185,130,0.18)',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}>
          {state.players.length === 0 ? (
            <div style={{
              color: C.muted,
              fontSize: 'clamp(11px, 3.2cqw, 14px)',
              textAlign: 'center',
              padding: '14% 8px',
              lineHeight: 1.5,
              pointerEvents: 'none',
            }}>
              No players yet — add players to<br />start the game
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {state.players.map((p, i) => (
                <li key={p.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 2px',
                  borderBottom: i < state.players.length - 1 ? `1px solid ${C.divider}` : 'none',
                }}>
                  <span style={{
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: C.gold,
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 'clamp(12px, 3.5cqw, 15px)', color: C.brown, flex: 1 }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: 'clamp(10px, 2.8cqw, 12px)', color: C.muted, fontWeight: 600 }}>
                    {p.coins} 🪙
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Clear + Randomize row ── */}
        <div style={{
          position: 'absolute',
          top: '66.5%',
          height: '7%',
          maxWidth: '68%',
          width: '68%',
          display: 'flex',
          gap: '4%',
          alignItems: 'center',
        }}>
          <button
            onClick={clearPlayers}
            style={{
              flex: 1,
              height: '100%',
              fontSize: 'clamp(12px, 3.5cqw, 15px)',
              fontWeight: 700,
              background: `rgba(0,0,0,0)`,
              color: '#fff8ee',
              border: `0px rgba(0,0,0,0)`,
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
          </button>
          <button
            onClick={randomizeOrder}
            disabled={!canRandomize}
            style={{
              flex: 1,
              height: '100%',
              fontSize: 'clamp(12px, 3.5cqw, 15px)',
              fontWeight: 700,
              background: `rgba(0,0,0,0)`,
              color: '#fff8ee',
              border: `0px rgba(0,0,0,0)`,
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
          </button>
        </div>

        {/* ── Start Game button ── */}
        <button
          onClick={startGame}
          disabled={!canStart}
          style={{
            position: 'absolute',
            top: '77%',
            width: '54%',
            maxWidth: '54%',
            height: '10%',
            background: `rgba(0,0,0,0)`,
            border: `0px rgba(0,0,0,0)`,
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
        </button>

      </div>{/* /panel */}

      {/* ── Game Manual image button — top-right of viewport ── */}
      <button
        onClick={() => setShowManual(true)}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          width: 120,
          height: 120,
          borderRadius: 8,
          transition: 'transform 0.2s ease, filter 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.filter = 'brightness(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.filter = 'brightness(1)'
        }}
        title="Open Game Manual"
      >
        <img
          src="/lobby/gamemanual-button.png"
          alt="Game Manual"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </button>

      {showManual && <GameManual onClose={() => setShowManual(false)} />}
    </div>
  )
}

export default Lobby
