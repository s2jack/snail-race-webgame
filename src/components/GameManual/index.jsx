import React, { useState } from 'react'

const C = {
  cream: '#fff8ee',
  gold: '#b98a49',
  goldLight: '#e0c88a',
  goldDark: '#7a5a2a',
  goldPale: '#f5e8cc',
  goldPaler: '#fdf3e0',
  brown: '#5a3e1b',
  muted: '#9a7a4a',
  divider: '#e8d9bc',
  green: '#56b243',
  greenDark: '#3d8a30',
  amber: '#f59e0b',
}

const SNAIL_HEX = {
  red: '#e53935',
  blue: '#1e88e5',
  green: '#43a047',
  yellow: '#fdd835',
  purple: '#8e24aa',
  black: '#222',
  white: '#ddd',
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: C.muted, marginBottom: 10 }}>
      {children}
    </div>
  )
}

function RuleBox({ children }) {
  return (
    <div style={{ background: C.goldPaler, border: `1px solid ${C.divider}`, borderRadius: 6, padding: '10px 14px', marginBottom: 10, fontSize: 14, color: C.brown, lineHeight: 1.6 }}>
      {children}
    </div>
  )
}

function Table({ headers, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
      <thead>
        <tr style={{ background: C.goldPale }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: '6px 10px', textAlign: 'left', color: C.goldDark, fontWeight: 700, borderBottom: `2px solid ${C.gold}` }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? C.cream : C.goldPaler }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: '6px 10px', color: C.brown, borderBottom: `1px solid ${C.divider}` }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SnailDot({ color, size = 16 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: SNAIL_HEX[color] || color,
      border: `1px solid rgba(0,0,0,0.2)`,
      verticalAlign: 'middle',
      marginRight: 4,
    }} />
  )
}

function Pill({ label, bg, color = '#fff' }) {
  return (
    <span style={{ display: 'inline-block', background: bg, color, borderRadius: 10, padding: '2px 10px', fontSize: 12, fontWeight: 700, margin: '2px 4px 2px 0' }}>{label}</span>
  )
}

function Heading({ children }) {
  return <h2 style={{ fontSize: 18, fontWeight: 800, color: C.brown, margin: '0 0 12px 0', borderBottom: `2px solid ${C.divider}`, paddingBottom: 8 }}>{children}</h2>
}

function SubHeading({ children }) {
  return <h3 style={{ fontSize: 14, fontWeight: 700, color: C.goldDark, margin: '14px 0 6px 0' }}>{children}</h3>
}

// ─── Page Content ─────────────────────────────────────────────────────────────

function PageOverview() {
  return (
    <div>
      <Heading>🐌 Snail Race — Game Overview</Heading>
      <RuleBox>
        <strong>Snail Race</strong> is a multiplayer web game for <strong>2–8 players</strong> where you bet on a snail race while influencing the outcome with special tiles. The race is divided into <strong>Legs</strong> (rounds). Each Leg ends when all 5 dice have been drawn. The full race ends when the first snail crosses the finish line.
      </RuleBox>
      <RuleBox>
        🎯 <strong>Goal:</strong> Earn the most <strong>Slime Coins 🪙</strong> by the time the race ends through well-timed bets and clever tile placement.
      </RuleBox>

      <SubHeading>Starting Resources (per player)</SubHeading>
      <Table
        headers={['Resource', 'Amount', 'Purpose']}
        rows={[
          ['🪙 Slime Coins', '3', 'Currency — win by having the most at the end'],
          ['🏆 Race Bet Cards', '5 (one per snail colour)', 'For betting on the overall race winner/loser'],
          ['🪨 Spectator Tile', '1 (Boost or Trap side)', 'Place on the track to earn coins and affect snails'],
        ]}
      />

      <SubHeading>Track Setup</SubHeading>
      <RuleBox>
        All 5 racing snails start on spaces 1–3 (placed by a hidden initial roll). Crazy snails start near spaces 14–16 and move <em>backwards</em>. The finish line is beyond space 16 — reaching space 17 ends the game.
      </RuleBox>

      <SubHeading>Snail Colours</SubHeading>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {['red','blue','green','yellow','purple'].map(c => (
          <span key={c} style={{ display: 'flex', alignItems: 'center', background: C.goldPaler, border: `1px solid ${C.divider}`, borderRadius: 6, padding: '4px 10px', fontWeight: 600, color: C.brown, fontSize: 13 }}>
            <SnailDot color={c} size={14} /> {c.charAt(0).toUpperCase() + c.slice(1)}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', background: C.goldPaler, border: `1px solid ${C.divider}`, borderRadius: 6, padding: '4px 10px', fontWeight: 600, color: C.muted, fontSize: 13 }}>
          <SnailDot color="black" size={14} /> Black (Crazy)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', background: C.goldPaler, border: `1px solid ${C.divider}`, borderRadius: 6, padding: '4px 10px', fontWeight: 600, color: C.muted, fontSize: 13 }}>
          <SnailDot color="white" size={14} /> White (Crazy)
        </span>
      </div>
    </div>
  )
}

function PageCoreConcepts() {
  return (
    <div>
      <Heading>⚙️ Core Concepts</Heading>

      <SubHeading>🪙 Slime Coins</SubHeading>
      <RuleBox>
        Coins are the sole currency and victory condition. Earned by: correct leg or race bets, placing spectator tiles that snails land on, and rolling dice. Lost by: incorrect bets (−1 coin per wrong card). <strong>A player's coin total is always public. Players can never go below 0 coins.</strong>
      </RuleBox>

      <SubHeading>🐚 Dice Tower (Shell Shaker)</SubHeading>
      <RuleBox>
        Contains <strong>5 coloured dice</strong> (one per racing snail) + <strong>1 grey die</strong> (for crazy snails). Each die can only be used <strong>once per Leg</strong>. A die is randomly <em>drawn</em> from the remaining pool — not rolled freely.
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 18 }}>
          <li><strong>Coloured die:</strong> Faces [1,1,2,2,3,3]. The colour = which snail moves; the number = spaces moved.</li>
          <li><strong>Grey die:</strong> Faces show a crazy-snail colour (black/white) + value (1–3). Moves the indicated crazy snail.</li>
        </ul>
      </RuleBox>

      <SubHeading>🏁 Legs</SubHeading>
      <RuleBox>
        A Leg is a sub-round of the overall race. A Leg ends immediately after the <strong>5th die is drawn</strong> (regardless of whether the grey die was included). After each Leg: scoring occurs, bet tiles reset, all dice return to the tower, and a new Leg begins.
      </RuleBox>

      <SubHeading>Phase Flow</SubHeading>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {['setup','playing','leg_scoring','playing','…','leg_scoring','final_scoring','ended'].map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: C.muted }}>→</span>}
            <Pill label={p} bg={p === 'playing' ? C.green : p === 'leg_scoring' ? C.amber : p === 'final_scoring' || p === 'ended' ? '#c0392b' : C.gold} />
          </React.Fragment>
        ))}
      </div>

      <SubHeading>Ranking</SubHeading>
      <RuleBox>
        Rank is determined by <strong>space position first</strong>, then <strong>stack height</strong> (top of stack = higher rank). The snail at the highest space AND highest position in its stack is in 1st place.
      </RuleBox>
    </div>
  )
}

function PageActions() {
  return (
    <div>
      <Heading>🎮 Player Actions</Heading>
      <RuleBox>
        Each player takes <strong>exactly 1 action</strong> per turn. Play proceeds clockwise. After all 5 dice are drawn, the Leg ends before the next turn begins.
      </RuleBox>

      {/* Action 1 */}
      <div style={{ background: C.goldPale, border: `2px solid ${C.gold}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
        <SubHeading>🎲 Action 1 — Roll the Dice</SubHeading>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.brown, lineHeight: 1.7 }}>
          <li>Draw one die randomly from the tower.</li>
          <li>The die's colour = which snail moves; the number (1–3) = spaces forward.</li>
          <li>Move that snail <em>and any snails on top of it</em> as a unit.</li>
          <li>The used die is set aside until the Leg ends.</li>
          <li><strong>Reward: +1 coin immediately</strong> for taking this action.</li>
        </ul>
      </div>

      {/* Action 2 */}
      <div style={{ background: C.goldPale, border: `2px solid ${C.gold}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
        <SubHeading>🏅 Action 2 — Place a Leg Bet</SubHeading>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.brown, lineHeight: 1.7 }}>
          <li>Take the <strong>top tile</strong> from any snail colour's betting stack.</li>
          <li>Bet that the chosen snail will be <strong>1st at the end of this Leg</strong>.</li>
          <li>You can hold multiple tiles — even multiples of the same colour.</li>
          <li><strong>No coins spent</strong> to place this bet.</li>
          <li>Tiles show face-up in front of you until Leg scoring.</li>
        </ul>
      </div>

      {/* Action 3 */}
      <div style={{ background: C.goldPale, border: `2px solid ${C.gold}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
        <SubHeading>🏆 Action 3 — Place a Race Bet</SubHeading>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.brown, lineHeight: 1.7 }}>
          <li>Play one of your 5 Race Bet Cards face-down on either the <strong>Winner pile</strong> or <strong>Loser pile</strong>.</li>
          <li>Predict which snail finishes first (winner) or last (loser) for the whole race.</li>
          <li>Once placed, cards <strong>cannot be changed or retrieved</strong>.</li>
          <li>Crazy snails are <strong>not eligible</strong> for race bets.</li>
          <li>Earlier bets yield higher rewards — but carry greater risk.</li>
        </ul>
      </div>

      {/* Action 4 */}
      <div style={{ background: C.goldPale, border: `2px solid ${C.gold}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
        <SubHeading>🪨 Action 4 — Place / Move Spectator Tile</SubHeading>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.brown, lineHeight: 1.7 }}>
          <li>Place your tile on any <strong>eligible empty space</strong> (no snail, no adjacent tile, not space 1).</li>
          <li>Choose a side: <span style={{ color: C.green, fontWeight: 700 }}>🟢 Boost</span> (snail moves +1 forward) or <span style={{ color: '#c0392b', fontWeight: 700 }}>🔴 Trap</span> (snail moves −1 backward).</li>
          <li>If your tile is already on the track, you may <strong>move or flip it</strong>.</li>
          <li><strong>Reward: +1 coin</strong> whenever any snail lands on your tile. The tile <strong>remains on the board</strong> after triggering.</li>
        </ul>
      </div>
    </div>
  )
}

function PageMovementStacking() {
  return (
    <div>
      <Heading>🐌 Movement & Stacking</Heading>

      <SubHeading>Basic Movement</SubHeading>
      <RuleBox>
        When a die is drawn, the matching snail moves forward by 1, 2, or 3 spaces. Any snails <strong>on top</strong> of the moving snail travel with it as a unit. Snails <em>underneath</em> the moving snail do <strong>not</strong> move.
      </RuleBox>

      <SubHeading>Stacking — Forward Movement</SubHeading>
      <RuleBox>
        When a snail (or stack) lands on an occupied space while moving <strong>forward</strong>, the arriving stack is placed <strong>on top</strong> of the existing snails.
        <br />
        <span style={{ color: C.muted, fontSize: 13 }}>Example: Red is on space 4. Blue moves from space 2 to space 4 → order becomes Red (bottom) / Blue (top). Blue is now ahead.</span>
      </RuleBox>

      <SubHeading>Stacking — Backward Movement (Trap Tile)</SubHeading>
      <RuleBox>
        When a snail moves <strong>backward</strong> due to a Trap tile, the arriving snail/stack goes <strong>underneath</strong> any snails already at the destination.
        <br />
        <span style={{ color: C.muted, fontSize: 13 }}>Example: Blue on space 5 hits a Trap and backs up to space 4 where Red sits → order: Blue (bottom) / Red (top).</span>
      </RuleBox>

      <SubHeading>Spectator Tile Effects</SubHeading>
      <Table
        headers={['Tile', 'Effect on landing', 'Stack placement', 'Chain reaction?']}
        rows={[
          ['🟢 Boost (Oasis)', '+1 space forward', 'On top of existing stack', 'No — second tile NOT triggered'],
          ['🔴 Trap (Mirage)', '−1 space backward', 'Underneath existing stack', 'No — second tile NOT triggered'],
        ]}
      />
      <RuleBox>
        <strong>No chain reactions.</strong> If a boosted or trapped snail lands on another spectator tile, that second tile is <em>not</em> triggered. Tile effects apply relative to<em> the snail's direction of travel</em> — crazy snails move in reverse, so a Boost sends them further backward and a Trap sends them further forward.
      </RuleBox>

      <SubHeading>🌀 Crazy Snails (Black & White)</SubHeading>
      <RuleBox>
        Crazy snails move in the <strong>reverse direction</strong> (toward space 1). They are moved by the grey die. Any racing snails stacked on top of a crazy snail are carried backward with it. Crazy snails are <strong>excluded from all bets</strong>.
        <br /><br />
        <strong>Carrier Rule:</strong> If exactly one crazy snail currently has any racing snail on top of it, <em>that</em> crazy snail always moves regardless of the die colour. Otherwise the die colour is honoured.
      </RuleBox>
    </div>
  )
}

function PageBetting() {
  return (
    <div>
      <Heading>🏅 Betting Systems</Heading>

      <SubHeading>Leg Bet Tiles</SubHeading>
      <RuleBox>
        Each snail colour has a stack of <strong>4 tiles</strong>. Take the top tile to bet that snail leads at the end of the current Leg. No coins are spent to bet — just grab a tile on your turn.
      </RuleBox>
      <Table
        headers={['Stack position', 'Tile value (if correct)']}
        rows={[
          ['1st taken (top)', '5 coins ✅'],
          ['2nd taken', '3 coins ✅'],
          ['3rd taken', '2 coins ✅'],
          ['4th taken (bottom)', '2 coins ✅'],
        ]}
      />

      <SubHeading>Leg Bet Resolution (end of each Leg)</SubHeading>
      <Table
        headers={['Your tile matches…', 'Payout']}
        rows={[
          ['1st place snail', 'Printed tile value (+5, +3, or +2 coins)'],
          ['2nd place snail', '+1 coin'],
          ['Any other snail', '−1 coin (minimum 0)'],
        ]}
      />
      <RuleBox>
        After scoring, all leg bet tiles are returned to their stacks in original order (5 → 3 → 2 → 2). All dice return to the tower. A new Leg begins.
      </RuleBox>

      <SubHeading>Race Bet Cards (Overall)</SubHeading>
      <RuleBox>
        Each player has 5 cards (one per racing snail). Place a card face-down on the <strong>Winner pile</strong> (predicting overall 1st) or <strong>Loser pile</strong> (predicting overall last). Order of placement matters: first correct bet pays most. Cards are revealed only at end game.
      </RuleBox>
      <Table
        headers={['Correct-bet rank', 'Payout', 'Wrong bet']}
        rows={[
          ['1st correct', '+8 coins', '−1 coin'],
          ['2nd correct', '+5 coins', '−1 coin'],
          ['3rd correct', '+3 coins', '−1 coin'],
          ['4th correct', '+2 coins', '−1 coin'],
          ['5th+ correct', '+1 coin', '−1 coin'],
        ]}
      />
    </div>
  )
}

function PageScoring() {
  return (
    <div>
      <Heading>🏆 Scoring & End Game</Heading>

      <SubHeading>Leg Scoring (triggered after each 5th die)</SubHeading>
      <RuleBox>
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>Determine <strong>1st place</strong> and <strong>2nd place</strong> snails at this moment.</li>
          <li>Resolve all leg bet tiles held by all players (see Betting page).</li>
          <li>Return all tiles to stacks in original order (5 → 3 → 2 → 2).</li>
          <li>Return all 5 coloured dice + 1 grey die to the Dice Tower.</li>
          <li>The starting player advances by 1 (clockwise).</li>
          <li>Begin a new Leg.</li>
        </ol>
      </RuleBox>

      <SubHeading>End Game Trigger</SubHeading>
      <RuleBox>
        The game ends <strong>immediately</strong> when any racing snail reaches space 17 or beyond during movement. Complete that movement, then proceed to final scoring — do not wait for the Leg to fully finish.
      </RuleBox>

      <SubHeading>Final Scoring Steps</SubHeading>
      <RuleBox>
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li><strong>Final Leg Scoring</strong> — score all leg bet tiles held at end of race.</li>
          <li><strong>Race Winner pile</strong> — reveal top-to-bottom, pay out in order to correct bettors.</li>
          <li><strong>Race Loser pile</strong> — reveal top-to-bottom, pay out in order to correct bettors.</li>
          <li><strong>Count coins</strong> — the player with the most wins. Ties share the victory.</li>
        </ol>
      </RuleBox>

      <SubHeading>Race Winner &amp; Loser Determination</SubHeading>
      <RuleBox>
        <strong>Race winner:</strong> Furthest snail; highest in stack if tied by space.<br />
        <strong>Race loser:</strong> Snail at the lowest space; bottom of stack if tied by space.<br />
        Crazy snails are <strong>excluded</strong> from winner/loser determination.
      </RuleBox>

      <SubHeading>Key Constraints</SubHeading>
      <Table
        headers={['Rule', 'Detail']}
        rows={[
          ['Coins floor', 'Players can never go below 0 coins'],
          ['Dice rewards', 'Rolling dice = +1 coin immediately'],
          ['Crazy snail bets', 'Not eligible for leg or race bets'],
          ['Race bet visibility', 'Hidden until final scoring reveal'],
        ]}
      />
    </div>
  )
}

function PageGlossary() {
  return (
    <div>
      <Heading>📖 Glossary</Heading>
      <Table
        headers={['Term', 'Definition']}
        rows={[
          ['Leg', 'A sub-round of the race that ends when all 5 dice have been drawn once'],
          ['Leg Bet', 'A bet on which snail will lead at the end of the current Leg'],
          ['Race Bet', 'A bet on which snail wins or loses the entire race'],
          ['Dice Tower (Shell Shaker 🐚)', 'Randomly ejects one die at a time from the remaining pool'],
          ['Snail Stack', 'Multiple snails on the same space, stacked vertically'],
          ['Spectator Tile', 'Your personal tile that boosts or traps snails that land on it'],
          ['Boost (Oasis 🟢)', 'Moves a snail +1 forward; snail lands on top of existing stack'],
          ['Trap (Mirage 🔴)', 'Moves a snail −1 backward; snail placed under existing stack'],
          ['Crazy Snail', 'Black or white snail that moves in reverse; not eligible for bets'],
          ['Carrier Rule', 'If exactly one crazy snail carries racing snails, that one always moves'],
          ['Slime Coins 🪙', 'The in-game currency and victory condition'],
          ['Finish Line', 'Space 17 or beyond; crossing it ends the game immediately'],
          ['Chain Reaction', 'NOT allowed — a tile triggered by Boost/Trap does not itself trigger'],
        ]}
      />
    </div>
  )
}

// ─── Pages config ─────────────────────────────────────────────────────────────

const PAGES = [
  { label: '📋 Overview',       icon: '📋', component: PageOverview },
  { label: '⚙️ Core Concepts',  icon: '⚙️', component: PageCoreConcepts },
  { label: '🎮 Actions',        icon: '🎮', component: PageActions },
  { label: '🐌 Movement',       icon: '🐌', component: PageMovementStacking },
  { label: '🏅 Betting',        icon: '🏅', component: PageBetting },
  { label: '🏆 Scoring',        icon: '🏆', component: PageScoring },
  { label: '📖 Glossary',       icon: '📖', component: PageGlossary },
]

// ─── Main modal component ─────────────────────────────────────────────────────

export function GameManual({ onClose }) {
  const [pageIndex, setPageIndex] = useState(0)
  const PageComponent = PAGES[pageIndex].component

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(60, 35, 5, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 760, maxHeight: '90vh',
        background: C.cream,
        border: `4px solid ${C.gold}`,
        borderRadius: 8,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: `2px solid ${C.gold}`,
          background: C.goldPale,
          flexShrink: 0,
        }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: C.brown }}>
            🐌 Game Manual
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 22, lineHeight: 1, color: C.muted, padding: '0 4px',
            }}
            aria-label="Close manual"
          >
            ×
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 0,
          borderBottom: `2px solid ${C.gold}`,
          background: C.goldPaler,
          flexShrink: 0,
        }}>
          {PAGES.map((p, i) => (
            <button
              key={i}
              onClick={() => setPageIndex(i)}
              style={{
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                background: i === pageIndex ? C.cream : 'transparent',
                color: i === pageIndex ? C.brown : C.muted,
                border: 'none',
                borderBottom: i === pageIndex ? `3px solid ${C.gold}` : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Page content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <PageComponent />
        </div>

        {/* ── Footer nav ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 18px',
          borderTop: `2px solid ${C.divider}`,
          background: C.goldPaler,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setPageIndex(i => Math.max(0, i - 1))}
            disabled={pageIndex === 0}
            style={{
              padding: '7px 18px', fontSize: 13, fontWeight: 700,
              background: pageIndex === 0 ? '#d0bfa0' : C.gold,
              color: pageIndex === 0 ? '#bfae8a' : '#fff',
              border: 'none', borderRadius: 6, cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
            {pageIndex + 1} / {PAGES.length}
          </span>
          <button
            onClick={() => setPageIndex(i => Math.min(PAGES.length - 1, i + 1))}
            disabled={pageIndex === PAGES.length - 1}
            style={{
              padding: '7px 18px', fontSize: 13, fontWeight: 700,
              background: pageIndex === PAGES.length - 1 ? '#d0bfa0' : C.gold,
              color: pageIndex === PAGES.length - 1 ? '#bfae8a' : '#fff',
              border: 'none', borderRadius: 6, cursor: pageIndex === PAGES.length - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameManual
