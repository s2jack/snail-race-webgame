// Dice pool management
import { SNAIL_COLORS } from './constants'

// Create dice pool: 5 colored dice and 1 grey die.
// Colored dice have 6 faces: [1,1,2,2,3,3].
// Grey die has 6 faces: three white faces (value 1..3) and three black faces (value 1..3).
export function createDicePool() {
  const pool = []
  for (const c of SNAIL_COLORS) {
    pool.push({ id: c, type: 'color', color: c, faces: [1, 1, 2, 2, 3, 3] })
  }
  // single grey die
  const greyFaces = [
    { crazy: 'white', value: 1 },
    { crazy: 'white', value: 2 },
    { crazy: 'white', value: 3 },
    { crazy: 'black', value: 1 },
    { crazy: 'black', value: 2 },
    { crazy: 'black', value: 3 },
  ]
  pool.push({ id: 'grey', type: 'grey', faces: greyFaces })
  return pool
}

export function drawDie(pool) {
  if (!pool || pool.length === 0) return null
  const idx = Math.floor(Math.random() * pool.length)
  const die = pool[idx]
  const next = pool.slice(0, idx).concat(pool.slice(idx + 1))

  // pick a random face from die.faces
  if (!die.faces) return null
  const faceIdx = Math.floor(Math.random() * die.faces.length)
  const face = die.faces[faceIdx]

  if (die.type === 'color') {
    return { die: { type: 'color', color: die.color, value: face }, next }
  }

  // grey die: face contains {crazy, value}
  if (die.type === 'grey') {
    return { die: { type: 'crazy', crazyColor: face.crazy, value: face.value }, next }
  }

  return null
}

