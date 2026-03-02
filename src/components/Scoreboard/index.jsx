import React, { useState, useEffect, useRef } from 'react'
import { useGameContext } from '../../context/GameContext'

// ── Shared warm palette ──────────────────────────────────────────────────────
const C = {
  cream:     '#fff8ee',
  gold:      '#b98a49',
  goldLight: '#e0c88a',
  goldDark:  '#7a5a2a',
  goldPale:  '#f5e8cc',
  brown:     '#5a3e1b',
  muted:     '#9a7a4a',
  divider:   '#e8d9bc',
  green:     '#56b243',
  greenDark: '#3d8a30',
  red:       '#c0392b',
}

const overlay = {
  position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(60,35,5,0.55)',
  zIndex: 500,
}

const card = (width = 580) => ({
  background: C.cream,
  border: `4px solid ${C.gold}`,
  borderRadius: 12,
  minWidth: width,
  maxWidth: '95vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  padding: '24px 28px',
})

const sectionTitle = {
  fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '1px', color: C.muted, marginBottom: 12,
}

const colorDotStyle = (color) => {
  const map = { red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fdd835', purple: '#8e24aa', black: '#222', white: '#eee' }
  return {
    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
    background: map[color] || color,
    border: color === 'white' ? '1px solid #ccc' : '1px solid rgba(0,0,0,0.15)',
    display: 'inline-block',
  }
}

const placeLabel = (i) => {
  const medals = ['1st', '2nd', '3rd', '4th', '5th']
  return medals[i] || `${i + 1}th`
}

export function Scoreboard() {
  const { state, dispatch } = useGameContext()

  // ── Leg-end countdown (5 → 0) before showing the summary modal ────────────
  // null  = modal ready to show
  // 1-10  = counting down, modal is blocked
  const [countdown, setCountdown] = useState(null)
  const prevPhaseRef = useRef(state.phase)

  // Detect transition INTO leg_scoring → start the countdown
  useEffect(() => {
    if (state.phase === 'leg_scoring' && prevPhaseRef.current !== 'leg_scoring') {
      setCountdown(5)
    }
    prevPhaseRef.current = state.phase
  }, [state.phase])

  // Tick the countdown down every second; null it out when done
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0) setCountdown(null)
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // ── LEG SUMMARY ────────────────────────────────────────────────────────────
  // While counting down, show a blocking overlay — nobody can act
  if (state.phase === 'leg_scoring' && countdown !== null) {
    return (
      <div style={{ ...overlay, flexDirection: 'column', gap: 0 }}>
        {/* big countdown number — key forces remount so animation replays each tick */}
        <div
          key={countdown}
          style={{
            width: 160, height: 160,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
            border: `6px solid ${C.goldLight}`,
            boxShadow: '0 0 60px rgba(185,138,73,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 80, fontWeight: 900, color: '#fff',
            lineHeight: 1,
            animation: 'countdownPulse 0.35s ease-out',
          }}
        >
          {countdown}
        </div>
        <div style={{ marginTop: 24, fontSize: 16, fontWeight: 700, color: '#fff8ee', opacity: 0.85, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Leg ending…
        </div>
      </div>
    )
  }

  if (state.phase === 'leg_scoring' && state.legSummary) {
    const { placements, payouts } = state.legSummary
    return (
      <div style={overlay}>
        <div className="overlay-fade-in" style={card(600)}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `3px solid ${C.gold}` }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: C.muted }}>Leg {state.legNumber}</div>
              <h2 style={{ margin: 0, fontSize: 22, color: C.brown }}>Leg Summary</h2>
            </div>
            <button
              onClick={() => dispatch({ type: 'START_NEXT_LEG' })}
              className="btn-green"
              style={{
                padding: '10px 20px', fontWeight: 800, fontSize: 14,
                background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
                color: '#fff', border: `2px solid ${C.greenDark}`,
                borderRadius: 8, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(60,140,40,0.3)',
              }}
            >Start Next Leg</button>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            {/* Placements column */}
            <div style={{ flexShrink: 0, minWidth: 160 }}>
              <div style={sectionTitle}>Placements</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {placements.map((p, i) => (
                  <div key={p.color} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px',
                    background: i === 0 ? C.goldPale : '#f5efe2',
                    border: `${i === 0 ? '2px' : '1px'} solid ${i === 0 ? C.gold : C.divider}`,
                    borderRadius: 8,
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? C.gold : '#d0bfa0',
                      color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0,
                    }}>{i + 1}</span>
                    <div style={colorDotStyle(p.color)} />
                    <span style={{ fontWeight: i === 0 ? 800 : 500, color: C.brown, textTransform: 'capitalize' }}>{p.color}</span>
                    {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: C.goldDark, background: C.goldLight, padding: '2px 7px', borderRadius: 10 }}>WINNER</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, background: C.divider, flexShrink: 0 }} />

            {/* Payouts column */}
            <div style={{ flex: 1 }}>
              <div style={sectionTitle}>Payouts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {payouts.map(r => {
                  const player = state.players.find(p => p.id === r.playerId) || {}
                  const picks = r.picks && r.picks.length > 0 ? r.picks : []
                  const positive = r.delta >= 0
                  return (
                    <div key={r.playerId} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: positive && r.delta > 0 ? '#f0fae8' : '#fdf6ec',
                      border: `1px solid ${positive && r.delta > 0 ? '#b0dfa0' : C.divider}`,
                      borderRadius: 8,
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: C.brown, fontSize: 14 }}>{player.name || r.playerId}</div>
                        <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {picks.length > 0 ? picks.map((p, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, background: C.goldPale, border: `1px solid ${C.goldLight}`, fontSize: 11, color: C.brown }}>
                              <div style={colorDotStyle(p)} />{p}
                            </span>
                          )) : <span style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>no picks</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: positive && r.delta > 0 ? C.green : r.delta < 0 ? C.red : C.muted }}>
                          {positive ? '+' : ''}{r.delta}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          total <strong style={{ color: C.brown }}>{r.total}</strong>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── FINAL SCORING ──────────────────────────────────────────────────────────
  if (state.phase === 'final_scoring' && state.raceSummary) {
    return (
      <div style={overlay}>
        <div className="overlay-fade-in" style={card(560)}>
          <div style={{ paddingBottom: 16, marginBottom: 20, borderBottom: `3px solid ${C.gold}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: C.muted }}>Race Over</div>
            <h2 style={{ margin: 0, fontSize: 22, color: C.brown }}>Final Placements</h2>
          </div>

          {/* Race placements */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionTitle}>Track Finish Order</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {state.raceSummary.placements.map((p, i) => (
                <div key={p.color} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px',
                  background: i === 0 ? C.goldPale : '#f5efe2',
                  border: `${i === 0 ? '2px' : '1px'} solid ${i === 0 ? C.gold : C.divider}`,
                  borderRadius: 8,
                }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: i === 0 ? C.gold : '#d0bfa0',
                    color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{i + 1}</span>
                  <div style={colorDotStyle(p.color)} />
                  <span style={{ fontWeight: i < 2 ? 800 : 500, color: C.brown, textTransform: 'capitalize' }}>{p.color}</span>
                  {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: C.goldDark, background: C.goldLight, padding: '2px 7px', borderRadius: 10 }}>WINNER</span>}
                  {i === state.raceSummary.placements.length - 1 && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#c0392b', background: '#fce8e8', padding: '2px 7px', borderRadius: 10 }}>LAST</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Bet piles */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            {[{ label: 'Winner Bets', pile: state.raceSummary.winnerBetPile, accent: '#3d8a30', bg: '#f0fae8' },
              { label: 'Loser Bets',  pile: state.raceSummary.loserBetPile,  accent: '#c0392b', bg: '#fce8e8' }]
              .map(({ label, pile, accent, bg }) => (
                <div key={label} style={{ flex: 1 }}>
                  <div style={sectionTitle}>{label}</div>
                  {(pile || []).length === 0 ? (
                    <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>None placed</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {(pile || []).map((c, i) => {
                        const owner = (state.players.find(p => p.id === c.ownerId) || {}).name || c.ownerId
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: bg, border: `1.5px solid ${accent}40`, borderRadius: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: accent, width: 18, flexShrink: 0 }}>#{i + 1}</span>
                            <div style={colorDotStyle(c.color)} />
                            <span style={{ fontSize: 12, color: C.brown, textTransform: 'capitalize', fontWeight: 600 }}>{c.color}</span>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: accent, opacity: 0.7 }}>by</span>
                              <span style={{ fontSize: 12, fontWeight: 800, color: C.brown, background: `${accent}18`, border: `1px solid ${accent}40`, borderRadius: 5, padding: '1px 7px' }}>{owner}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>

          <button
            onClick={() => dispatch({ type: 'RESOLVE_RACE' })}
            className="btn-gold"
            style={{
              width: '100%', padding: '12px 0', fontWeight: 800, fontSize: 15,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`,
              color: '#fff', border: `2px solid ${C.goldDark}`,
              borderRadius: 8, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >Reveal Results & Apply Bets</button>
        </div>
      </div>
    )
  }

  // ── GAME ENDED ─────────────────────────────────────────────────────────────
  if (state.phase === 'ended') {
    const sorted = [...(state.players || [])].sort((a, b) => b.coins - a.coins)
    // derive winner/loser snail colours from raceSummary if available
    const racePlacements = state.raceSummary ? state.raceSummary.placements : []
    const winnerColor = racePlacements.length > 0 ? racePlacements[0].color : null
    const loserColor  = racePlacements.length > 0 ? racePlacements[racePlacements.length - 1].color : null
    return (
      <div style={overlay}>
        <div className="overlay-fade-in" style={card(500)}>
          <div style={{ paddingBottom: 16, marginBottom: 20, borderBottom: `3px solid ${C.gold}`, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>&#x1F40C;</div>
            <h2 style={{ margin: 0, fontSize: 24, color: C.brown }}>Race Finished!</h2>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Final coin standings</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                background: i === 0 ? C.goldPale : '#f5efe2',
                border: `${i === 0 ? '2px' : '1px'} solid ${i === 0 ? C.gold : C.divider}`,
                borderRadius: 8,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: i === 0 ? C.gold : '#d0bfa0',
                  color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ flex: 1, fontWeight: i === 0 ? 800 : 500, color: C.brown, fontSize: 15 }}>{p.name}</span>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  border: `2px solid ${C.gold}`, fontWeight: 900, fontSize: 16, color: C.brown,
                  boxShadow: '0 2px 6px rgba(180,130,0,0.3)',
                }}>{p.coins}</div>
              </div>
            ))}
          </div>

          {/* Restart button */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => dispatch({ type: 'RESTART_GAME' })}
              style={{
                padding: '10px 32px',
                fontSize: 14, fontWeight: 800,
                background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
                color: '#fff',
                border: `2px solid ${C.greenDark}`,
                borderRadius: 8,
                cursor: 'pointer',
                letterSpacing: '0.4px',
                boxShadow: '0 2px 8px rgba(60,130,40,0.25)',
              }}
            >
              🐌 New Game
            </button>
          </div>

          {/* Race bet card results */}
          {state.raceSummary && (winnerColor || loserColor) && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `2px solid ${C.divider}` }}>
              <div style={sectionTitle}>Race Bet Results</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[{ label: 'Winner Bets', pile: state.raceSummary.winnerBetPile, targetColor: winnerColor, accent: '#3d8a30', bg: '#f0fae8' },
                  { label: 'Loser Bets',  pile: state.raceSummary.loserBetPile,  targetColor: loserColor,  accent: '#c0392b', bg: '#fce8e8' }]
                  .map(({ label, pile, targetColor, accent, bg }) => (
                    <div key={label} style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: accent, marginBottom: 6 }}>
                        {label}
                        {targetColor && (
                          <span style={{ marginLeft: 6, fontWeight: 600, textTransform: 'capitalize', color: C.muted }}>({targetColor})</span>
                        )}
                      </div>
                      {(pile || []).length === 0 ? (
                        <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>None placed</div>
                      ) : (() => {
                        let correctRank = 0
                        return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {(pile || []).map((c, i) => {
                            const owner = (state.players.find(p => p.id === c.ownerId) || {}).name || c.ownerId
                            const correct = c.color === targetColor
                            const payout = correct ? [8, 5, 3, 2, 1][Math.min(correctRank++, 4)] : -1
                            return (
                              <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '6px 10px',
                                background: correct ? '#f0fae8' : '#fce8e8',
                                border: `1.5px solid ${correct ? '#3d8a3040' : '#c0392b40'}`,
                                borderRadius: 6,
                              }}>
                                {/* outcome icon */}
                                <span style={{ fontSize: 14, flexShrink: 0 }}>{correct ? '✅' : '❌'}</span>
                                {/* snail dot + color */}
                                <div style={colorDotStyle(c.color)} />
                                <span style={{ fontSize: 11, color: C.brown, textTransform: 'capitalize', fontWeight: 600 }}>{c.color}</span>
                                {/* owner name badge */}
                                <span style={{
                                  marginLeft: 'auto',
                                  fontSize: 12, fontWeight: 800, color: C.brown,
                                  background: correct ? '#d4f4c8' : '#fad4d4',
                                  border: `1px solid ${correct ? '#3d8a3050' : '#c0392b50'}`,
                                  borderRadius: 5, padding: '1px 8px',
                                }}>{owner}</span>
                                {/* coin delta */}
                                <span style={{ fontSize: 12, fontWeight: 800, color: correct ? '#3d8a30' : '#c0392b', flexShrink: 0 }}>
                                  {correct ? `+${payout}` : '−1'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        )
                      })()}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default Scoreboard
