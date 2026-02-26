import React from 'react'
import { useGameContext } from '../../context/GameContext'

export function Scoreboard() {
  const { state, dispatch } = useGameContext()

  if (state.phase === 'leg_scoring' && state.legSummary) {
    return (
      <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 10, minWidth: 520, maxWidth: '90%', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Leg Summary</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => dispatch({ type: 'START_NEXT_LEG' })} style={{ padding: '6px 10px' }}>Start Next Leg</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: '0 0 40%' }}>
              <strong>Placements</strong>
              <ol style={{ paddingLeft: 18 }}>
                {state.legSummary.placements.map(p => (
                  <li key={p.color} style={{ marginBottom: 6 }}><strong>{p.place}.</strong> {p.color}</li>
                ))}
              </ol>
            </div>

            <div style={{ flex: '1 1 auto' }}>
              <strong>Payouts</strong>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {state.legSummary.payouts.map(r => {
                  const player = state.players.find(p => p.id === r.playerId) || {}
                  const picks = r.picks && r.picks.length > 0 ? r.picks : []
                  return (
                    <div key={r.playerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, background: '#fafafa' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{player.name || r.playerId}</div>
                        <div style={{ fontSize: 12, color: '#555' }}>picks: {picks.length > 0 ? picks.map((p,i) => <span key={i} style={{ display: 'inline-block', marginRight: 6, padding: '2px 6px', borderRadius: 6, background: '#eee' }}>{p}</span>) : <span style={{ color: '#888' }}>none</span>}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14 }}>{r.delta >= 0 ? <span style={{ color: 'green', fontWeight: 700 }}>+{r.delta}</span> : <span style={{ color: 'crimson', fontWeight: 700 }}>{r.delta}</span>}</div>
                        <div style={{ fontSize: 12, color: '#333' }}>total {r.total}</div>
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

  // Final race modal: show placements and bet piles with orders
  if (state.phase === 'final_scoring' && state.raceSummary) {
    return (
      <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, minWidth: 360 }}>
          <h3>Race Finished</h3>
          <div>
            <strong>Placements:</strong>
            <ol>
              {state.raceSummary.placements.map(p => (
                <li key={p.color}>{p.place}: {p.color}</li>
              ))}
            </ol>
          </div>
          <div>
            <strong>Winner Bets (order matters):</strong>
            <ol>
              {(state.raceSummary.winnerBetPile || []).map((c, i) => (
                <li key={i}>{i + 1}. {(state.players.find(p => p.id === c.ownerId) || {}).name || c.ownerId} → {c.color}</li>
              ))}
            </ol>
          </div>
          <div>
            <strong>Loser Bets (order matters):</strong>
            <ol>
              {(state.raceSummary.loserBetPile || []).map((c, i) => (
                <li key={i}>{i + 1}. {(state.players.find(p => p.id === c.ownerId) || {}).name || c.ownerId} → {c.color}</li>
              ))}
            </ol>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => dispatch({ type: 'RESOLVE_RACE' })}>Resolve Race (Apply Bets)</button>
          </div>
        </div>
      </div>
    )
  }

  // After final scoring, show ended summary
  if (state.phase === 'ended') {
    return (
      <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, minWidth: 360 }}>
          <h3>Final Scores</h3>
          <ul>
            {state.players.map(p => (
              <li key={p.id}>{p.name}: {p.coins} coins</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3>Scoreboard</h3>
    </div>
  )
}

export default Scoreboard
