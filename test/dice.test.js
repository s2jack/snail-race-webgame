import { describe, it, expect } from 'vitest'
import { createDicePool, drawDie } from '../src/game/dice.js'

describe('dice pool', () => {
  it('creates a pool with 6 dice and drawing assigns a value', () => {
    const pool = createDicePool()
    expect(pool.length).toBe(6)
    const result = drawDie(pool)
    expect(result).toBeTruthy()
    expect(typeof result.die.value).toBe('number')
    expect(result.die.value).toBeGreaterThanOrEqual(1)
    expect(result.die.value).toBeLessThanOrEqual(3)
    expect(result.next.length).toBe(pool.length - 1)
  })
})
