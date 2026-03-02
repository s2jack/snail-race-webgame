import { describe, it, expect } from 'vitest'
import { moveSnail, resolveCrazySnailId } from '../src/game/movement.js'

function makeState(track = [], players = []) {
  return { players, track, raceEnded: false }
}

// ─── helpers ────────────────────────────────────────────────────────────────
function space(n, snailIds, spectatorTile = undefined) {
  return { spaceNumber: n, snails: snailIds.map(id => ({ id })), spectatorTile }
}

function ids(state, spaceNumber) {
  const sp = state.track.find(s => s.spaceNumber === spaceNumber)
  return sp ? sp.snails.map(s => s.id) : []
}

// ─── existing test ───────────────────────────────────────────────────────────
describe('movement and stacking', () => {
  it('moves a snail forward and places arriving stack on top', () => {
    const state = makeState([space(2, ['red']), space(4, ['blue'])])
    const next = moveSnail(state, 'red', 2)
    expect(ids(next, 4)).toEqual(['blue', 'red'])
  })

  // ── backward dice movement always lands on top ───────────────────────────
  it('crazy snail moving backward alone lands on top of existing snails', () => {
    // black at #5, red at #3 — black rolls backward 2, should land on TOP of red
    const state = makeState([space(3, ['red']), space(5, ['black'])])
    const next = moveSnail(state, 'black', 2)
    // bottom = red, top = black
    expect(ids(next, 3)).toEqual(['red', 'black'])
  })

  it('crazy snail carrying colored snails lands the whole stack on top (exact bug scenario)', () => {
    // Reproduce: white carries blue+black at #14, red alone at #11
    // white is at bottom (index 0), black above (index 1), blue above that (index 2)
    // wait — stack order: crazy snail is at bottom index, colored on top
    const state = makeState([
      space(11, ['red']),
      { spaceNumber: 14, snails: [{ id: 'white' }, { id: 'black' }, { id: 'blue' }], spectatorTile: undefined },
    ])
    // white rolls backward 3 → moves from #14 to #11
    const next = moveSnail(state, 'white', 3)
    // Expected: red stays at bottom, entire white+black+blue stack arrives on top
    expect(ids(next, 11)).toEqual(['red', 'white', 'black', 'blue'])
  })

  it('forward-moving colored snail always lands on top (not underneath)', () => {
    // red at #2, blue at #5 — red moves forward 3 to #5, should land ON TOP of blue
    const state = makeState([space(2, ['red']), space(5, ['blue'])])
    const next = moveSnail(state, 'red', 3)
    expect(ids(next, 5)).toEqual(['blue', 'red'])
  })

  it('trap spectator tile still places arriving stack underneath (colored snail)', () => {
    // blue at #3 moves forward 2 → #5 (trap), trap pushes back -1 → #4 where green is.
    // Per rules: trap secondary movement places arriving stack UNDERNEATH existing snails.
    const state = makeState([
      space(3, ['blue']),
      { spaceNumber: 5, snails: [], spectatorTile: { side: 'trap', ownerId: 'p1' } },
      space(4, ['green']),
    ], [{ id: 'p1', name: 'P1', coins: 0 }])
    const next = moveSnail(state, 'blue', 2)
    // blue should end up BELOW green at #4
    expect(ids(next, 4)).toEqual(['blue', 'green'])
    // blue should not still be at #3
    expect(ids(next, 3)).toEqual([])
  })

  it('trap pushes crazy snail forward (+1 relative to its travel direction)', () => {
    // black (crazy, dir=-1) at #16, moves backward 2 → #14 (trap).
    // Trap pushes one step OPPOSITE to travel direction, so black goes to #15 (not #13).
    const state = makeState([
      { spaceNumber: 14, snails: [], spectatorTile: { side: 'trap', ownerId: 'p1' } },
      space(15, ['red']),
      space(16, ['black']),
    ], [{ id: 'p1', name: 'P1', coins: 0 }])
    const next = moveSnail(state, 'black', 2)
    // black should be underneath red at #15
    expect(ids(next, 15)).toEqual(['black', 'red'])
    expect(ids(next, 14)).toEqual([])
    expect(ids(next, 13)).toEqual([])
  })

  it('boost pushes crazy snail further backward (same travel direction)', () => {
    // black (crazy, dir=-1) at #16, moves backward 2 → #14 (boost).
    // Boost continues in travel direction: black goes to #13.
    const state = makeState([
      space(13, ['red']),
      { spaceNumber: 14, snails: [], spectatorTile: { side: 'boost', ownerId: 'p1' } },
      space(16, ['black']),
    ], [{ id: 'p1', name: 'P1', coins: 0 }])
    const next = moveSnail(state, 'black', 2)
    // black should be on top of red at #13
    expect(ids(next, 13)).toEqual(['red', 'black'])
    expect(ids(next, 14)).toEqual([])
  })

  it('crazy snail carrying multiple snails: entire stack moves together', () => {
    // white at #10, carrying yellow (index 1) and purple (index 2)
    // green alone at #7
    const state = makeState([
      space(7, ['green']),
      { spaceNumber: 10, snails: [{ id: 'white' }, { id: 'yellow' }, { id: 'purple' }], spectatorTile: undefined },
    ])
    const next = moveSnail(state, 'white', 3)
    // white+yellow+purple stack should be on top of green at #7
    expect(ids(next, 7)).toEqual(['green', 'white', 'yellow', 'purple'])
    // #10 should be empty
    expect(ids(next, 10)).toEqual([])
  })
})

// ─── resolveCrazySnailId ─────────────────────────────────────────────────────
describe('resolveCrazySnailId — carrier rule', () => {
  // Build a minimal track array directly (no full state needed)
  function track(...spaceDefs) {
    return spaceDefs.map(([n, snailIds]) => ({
      spaceNumber: n,
      snails: snailIds.map(id => ({ id })),
      spectatorTile: undefined,
    }))
  }

  it('exact bug: black die rolled but white carries red — white must move', () => {
    // white has red on top; black is alone → exactly 1 carrier → white moves
    const t = track([3, ['white', 'red']], [8, ['black']])
    expect(resolveCrazySnailId(t, 'black')).toBe('white')
  })

  it('exactly one carrier (black carries blue) → ignore die colour, move black', () => {
    const t = track([5, ['black', 'blue']], [9, ['white']])
    expect(resolveCrazySnailId(t, 'white')).toBe('black')
  })

  it('neither crazy snail carries coloured snails → honour die colour', () => {
    const t = track([3, ['white']], [8, ['black']], [5, ['red']])
    expect(resolveCrazySnailId(t, 'black')).toBe('black')
    expect(resolveCrazySnailId(t, 'white')).toBe('white')
  })

  it('both crazy snails carry coloured snails → honour die colour', () => {
    const t = track([3, ['white', 'red']], [8, ['black', 'blue']])
    expect(resolveCrazySnailId(t, 'black')).toBe('black')
    expect(resolveCrazySnailId(t, 'white')).toBe('white')
  })

  it('crazy snail with only another crazy snail on top is NOT a carrier', () => {
    // white has black on top — but black is crazy too, so white is NOT carrying coloured snails
    const t = track([3, ['white', 'black']], [5, ['red']])
    expect(resolveCrazySnailId(t, 'black')).toBe('black')
  })
})
