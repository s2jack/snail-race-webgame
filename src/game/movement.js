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

  // Arriving placement: forward -> on top, backward -> underneath
  if (dir === 1) {
    toSpace.snails = toSpace.snails.concat(movingStack)
  } else {
    toSpace.snails = movingStack.concat(toSpace.snails)
  }

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

    // Apply boost or trap effect: board-relative +1 (boost) or -1 (trap)
    const effect = tile.side === 'boost' ? 1 : -1

    // remove movingStack from current toSpace (we placed them earlier)
    toSpace.snails = toSpace.snails.filter(s => !movingStack.find(ms => ms.id === s.id))

    const secondaryNumber = toNumber + effect
    const secondarySpace = ensureSpace(track, secondaryNumber)

    // If boosted forward (effect=+1): arriving stack placed on top
    if (effect === 1) {
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

