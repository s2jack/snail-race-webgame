import React, { useState } from 'react'
import Board from './components/Board'
import DiceTower from './components/DiceTower'
import BettingPanel from './components/BettingPanel'
import PlayerPanel from './components/PlayerPanel'
import Scoreboard from './components/Scoreboard'
import Lobby from './components/Lobby'
import { useGameContext } from './context/GameContext'

export default function App() {
  const { state } = useGameContext()

  return (
    <div className="app-root">
      <h1>Snail Race</h1>
      {state.phase === 'setup' ? (
        <Lobby />
      ) : (
        <div className="game-area" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <Board />
          <aside style={{ minWidth: 360, maxWidth: 420 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <DiceTower />
              <hr />
              <BettingPanel />
              <hr />
              <PlayerPanel />
              <hr />
              <Scoreboard />

              {/* Event Log panel (collapsible) */}
              <EventLogWidget eventLog={state.eventLog || []} />
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function EventLogWidget({ eventLog }) {
  const [minimized, setMinimized] = useState(false)

  if (minimized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 6, background: '#fff' }}>
        <div style={{ fontWeight: 700 }}>Event Log</div>
        <div>
          <button onClick={() => setMinimized(false)} style={{ padding: '4px 8px' }}>Open</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 6, background: '#fff', padding: 8, maxHeight: 260, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Event Log</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setMinimized(true)} style={{ padding: '4px 8px' }}>Minimize</button>
        </div>
      </div>
      <div style={{ fontSize: 13, lineHeight: '1.3' }}>
        {eventLog.slice(-200).reverse().map((l, i) => <div key={i} style={{ marginBottom: 6 }}>{l}</div>)}
      </div>
    </div>
  )
}
