import { CRAZY_SNAIL_COLORS, TRACK_LENGTH } from './constants'

export function canPlaceLegBet(state, playerId, color) {
  const stack = state.legBetStacks && state.legBetStacks[color]
  if (!stack || stack.length === 0) return { valid: false, reason: 'no tiles left for that color' }
  return { valid: true }
}

export function canPlaceRaceBet(state, playerId, color) {
  if (CRAZY_SNAIL_COLORS.includes(color)) return { valid: false, reason: 'cannot bet on crazy snails' }
  const player = state.players.find(p => p.id === playerId)
  if (!player) return { valid: false, reason: 'player not found' }
  if (!player.raceBetCardsInHand || !player.raceBetCardsInHand.includes(color)) return { valid: false, reason: 'card not in hand' }
  return { valid: true }
}

export function canPlaceSpectator(state, playerId, spaceNumber, { move = false } = {}) {
  if (spaceNumber === 1) return { valid: false, reason: 'cannot place on space 1' }
  if (spaceNumber < 1 || spaceNumber > TRACK_LENGTH) return { valid: false, reason: 'invalid space' }
  const space = state.track.find(s => s.spaceNumber === spaceNumber)
  if (!space) return { valid: false, reason: 'space not found' }

  // If player is moving their existing tile to a new space, ensure target is empty
  if (move) {
    if (space.snails && space.snails.length > 0) return { valid: false, reason: 'space occupied by snail' }
    if (space.spectatorTile) return { valid: false, reason: 'space already has a tile' }
  } else {
    // Not moving: if there's an existing tile owned by player, allow side change
    if (space.spectatorTile) {
      if (space.spectatorTile.ownerId !== playerId) return { valid: false, reason: 'space already has another player tile' }
      // owned by player -> allow updating side even if snails present
    } else {
      // placing a new tile (not moving): ensure target is free of snails
      if (space.snails && space.snails.length > 0) return { valid: false, reason: 'space occupied by snail' }
    }
  }

  // adjacent check: when placing or moving to a space, disallow adjacency to other tiles
  const left = state.track.find(s => s.spaceNumber === spaceNumber - 1)
  const right = state.track.find(s => s.spaceNumber === spaceNumber + 1)
  if ((left && left.spectatorTile && left.spectatorTile.ownerId !== playerId) || (right && right.spectatorTile && right.spectatorTile.ownerId !== playerId)) return { valid: false, reason: 'adjacent to another tile' }

  return { valid: true }
}
