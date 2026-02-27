// Snail movement and stacking logic
import { FINISH_LINE, CRAZY_SNAIL_COLORS } from './constants'

function findSpace(track, snailId) {
  for (const space of track) {
    const idx = space.snails.findIndex(s => s.id === snailId)
    if (idx !== -1) return { space, spaceNumber: space.spaceNumber, index: idx }
  }
  return null
}

function ensureSpace(track, spaceNumber) {
  let sp = track.find(s => s.spaceNumber === spaceNumber)
  if (!sp) {
    sp = { spaceNumber, snails: [], spectatorTile: undefined }
    track.push(sp)
    track.sort((a, b) => a.spaceNumber - b.spaceNumber)
  }
  return sp
}

export function moveSnail(state, snailId, distance, { ignoreSpectator = false } = {}) {
  const next = JSON.parse(JSON.stringify(state))
  const { track } = next

  const found = findSpace(track, snailId)
  if (!found) return next

  const { spaceNumber: fromNumber, index: fromIndex } = found
  const fromSpace = track.find(s => s.spaceNumber === fromNumber)

  // moving stack: snail itself + any snails above it
  const movingStack = fromSpace.snails.slice(fromIndex)
  fromSpace.snails = fromSpace.snails.slice(0, fromIndex)

  // Determine direction: crazy snails move backward
  const isCrazy = CRAZY_SNAIL_COLORS.includes(snailId)
  const dir = isCrazy ? -1 : 1
  let toNumber = fromNumber + dir * distance

  // Place within track bounds (spaces can go below 1)
  ensureSpace(track, toNumber)
  const toSpace = ensureSpace(track, toNumber)

  // Arriving placement: dice movement always lands on top, regardless of direction.
  // Only a trap spectator tile (below) sends a stack underneath.
  toSpace.snails = toSpace.snails.concat(movingStack)

  // Check finish line (only racing snails count toward race end)
  if (!isCrazy && toNumber >= FINISH_LINE) {
    next.raceEnded = true
    next.phase = 'final_scoring'
  }

  // Spectator tile handling (trigger only once per movement)
  if (!ignoreSpectator && toSpace.spectatorTile) {
    const tile = toSpace.spectatorTile
    // Pay owner 1 coin (ensure player exists)
    const owner = next.players.find(p => p.id === tile.ownerId)
    if (owner) {
      owner.coins = (owner.coins || 0) + 1
      const ownerName = owner.name || owner.id
      next.eventLog = (next.eventLog || []).concat([`${ownerName} earned +1 coin from spectator at ${toNumber}`])
    }
    // NOTE: spectator tiles remain on the board until the end of the game
    // Do NOT remove the tile or change owner's spectator state here.

    // Apply boost or trap effect relative to the snail's travel direction.
    // Boost: one extra step in travel direction (+dir).
    // Trap:  one step back against travel direction (-dir).
    // This means a crazy snail (dir=-1) hitting a trap gets pushed +1 (toward finish),
    // and a colored snail (dir=+1) hitting a trap gets pushed -1 (back toward start).
    const effect = tile.side === 'boost' ? dir : -dir

    // remove movingStack from current toSpace (we placed them earlier)
    toSpace.snails = toSpace.snails.filter(s => !movingStack.find(ms => ms.id === s.id))

    const secondaryNumber = toNumber + effect
    const secondarySpace = ensureSpace(track, secondaryNumber)

    // Boost: stack lands on top. Trap: stack lands underneath.
    if (tile.side === 'boost') {
      secondarySpace.snails = secondarySpace.snails.concat(movingStack)
    } else {
      // Trap: arriving stack placed underneath
      secondarySpace.snails = movingStack.concat(secondarySpace.snails)
    }

    // Check finish line after secondary movement
    if (!isCrazy && secondaryNumber >= FINISH_LINE) {
      next.raceEnded = true
      next.phase = 'final_scoring'
    }

    return next
  }

  return next
}

/**
 * Determine which crazy snail to actually move when the grey die is rolled.
 *
 * Rules:
 *  - If exactly ONE crazy snail carries any colored snails (has non-crazy snails
 *    stacked on top of it), always move that carrier — the die's crazyColor is ignored.
 *  - Otherwise (both carry, or neither carries) move the die's crazyColor snail.
 *
 * "Carries" means there is at least one non-crazy snail at a higher index in the
 * same space stack (snails[0] = bottom, snails[last] = top).
 */
export function resolveCrazySnailId(track, dieColor) {
  const carriers = CRAZY_SNAIL_COLORS.filter(color => {
    for (const space of track) {
      const idx = space.snails.findIndex(s => s.id === color)
      if (idx === -1) continue
      // any non-crazy snail above this one in the stack?
      const above = space.snails.slice(idx + 1)
      if (above.some(s => !CRAZY_SNAIL_COLORS.includes(s.id))) return true
    }
    return false
  })

  // Edge case: exactly one crazy snail is carrying colored snails → move it
  if (carriers.length === 1) return carriers[0]

  // Both carrying or neither carrying → honour the die's colour
  return dieColor
}

export function getFirstPlaceSnail(state) {
  // Determine which non-crazy snail is furthest ahead; highest space, then top of stack
  const racingSpaces = state.track.filter(sp => sp.snails && sp.snails.length > 0)
  if (racingSpaces.length === 0) return null
  const sorted = racingSpaces.slice().sort((a, b) => b.spaceNumber - a.spaceNumber)
  for (const sp of sorted) {
    // look from top to bottom for a non-crazy snail
    for (let i = sp.snails.length - 1; i >= 0; i--) {
      const s = sp.snails[i]
      if (!CRAZY_SNAIL_COLORS.includes(s.id)) return s
    }
  }
  return null
}

