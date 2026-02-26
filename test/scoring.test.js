import { describe, it, expect } from 'vitest'
import { scoreRace } from '../src/game/scoring.js'

function makeState() {
  return {
    players: [
      { id: 'p1', coins: 3 },
      { id: 'p2', coins: 3 },
    ],
    track: [
      { spaceNumber: 1, snails: [{ id: 'green' }] },
      { spaceNumber: 5, snails: [{ id: 'blue' }] },
      // order bottom -> top: red bottom, yellow top -> change to have red on top
      { spaceNumber: 8, snails: [{ id: 'yellow' }, { id: 'red' }] },
    ],
    winnerBetPile: [
      { color: 'red', ownerId: 'p1' },
      { color: 'blue', ownerId: 'p2' },
    ],
    loserBetPile: [
      { color: 'green', ownerId: 'p2' },
      { color: 'yellow', ownerId: 'p1' },
    ],
    phase: 'final_scoring',
  }
}

describe('race scoring', () => {
  it('resolves winner and loser piles and adjusts coins', () => {
    const state = makeState()
    const next = scoreRace(state)
    const p1 = next.players.find(p => p.id === 'p1')
    const p2 = next.players.find(p => p.id === 'p2')
    // Expected: p1: +8 (winner correct) and -1 (loser incorrect) => 10
    //           p2: -1 (winner incorrect) and +8 (loser correct) => 10
    expect(p1.coins).toBe(10)
    expect(p2.coins).toBe(10)
    expect(next.phase).toBe('ended')
  })
})
