import { describe, it, expect } from 'vitest'
import { moveSnail } from '../src/game/movement.js'

function makeState() {
  return {
    players: [],
    track: [
      { spaceNumber: 2, snails: [{ id: 'red' }], spectatorTile: undefined },
      { spaceNumber: 4, snails: [{ id: 'blue' }], spectatorTile: undefined },
    ],
    raceEnded: false,
  }
}

describe('movement and stacking', () => {
  it('moves a snail forward and places arriving stack on top', () => {
    const state = makeState()
    const next = moveSnail(state, 'red', 2)
    const space4 = next.track.find(s => s.spaceNumber === 4)
    expect(space4).toBeTruthy()
    expect(space4.snails[0].id).toBe('blue')
    expect(space4.snails[1].id).toBe('red')
  })
})
