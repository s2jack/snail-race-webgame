// Scoring utilities (implementations per GAME_DESIGN.md)
import { CRAZY_SNAIL_COLORS } from './constants'

// Payouts by prediction order: 1st, 2nd, 3rd, 4th, 5th+
// Per rules: 4th and others get 2 coins
const RACE_PAYOUTS = [8, 5, 3, 2, 2]

// returns summary and applies coin changes; does NOT change phase or clear usedDice
export function scoreLeg(state) {
  const next = JSON.parse(JSON.stringify(state))
  // determine ordered non-crazy snails: from furthest to least
  const racingSpaces = next.track.filter(sp => sp.snails && sp.snails.length > 0)
  const sorted = racingSpaces.slice().sort((a, b) => b.spaceNumber - a.spaceNumber)
  const placements = [] // [{ pos: 1, color: 'red' }, ...]
  for (const sp of sorted) {
    // from top to bottom
    for (let i = sp.snails.length - 1; i >= 0; i--) {
      const s = sp.snails[i]
      if (CRAZY_SNAIL_COLORS.includes(s.id)) continue
      placements.push({ color: s.id, space: sp.spaceNumber })
    }
  }

  const first = placements[0] ? placements[0].color : null
  const second = placements[1] ? placements[1].color : null

  // Resolve leg bets for each player and record payouts
  const payouts = []
  for (const player of next.players) {
    let delta = 0
    const tiles = player.legBetTiles || []
    for (const tile of tiles) {
      if (first && tile.color === first) {
        delta += tile.value
      } else if (second && tile.color === second) {
        delta += 1
      } else {
        delta -= 1
      }
    }
    player.coins = Math.max(0, (player.coins || 0) + delta)
    // record picks as color+value strings
    const picks = tiles.map(t => `${t.color}${t.value}`)
    payouts.push({ playerId: player.id, delta, total: player.coins, picks })
    player.legBetTiles = []
  }

  // return next state with a leg summary but do NOT clear usedDice or change phase here
  next.legSummary = { placements: placements.map((p, i) => ({ place: i + 1, color: p.color })), payouts }
  return next
}

function findRaceWinnerAndLoser(state) {
  // winner: furthest non-crazy snail; top of stack
  // loser: least forward non-crazy snail; bottom of stack
  let winner = null
  let winnerSpace = -Infinity
  let loser = null
  let loserSpace = Infinity

  for (const sp of state.track) {
    if (!sp.snails || sp.snails.length === 0) continue
    // check from top to bottom for winner
    for (let i = sp.snails.length - 1; i >= 0; i--) {
      const s = sp.snails[i]
      if (CRAZY_SNAIL_COLORS.includes(s.id)) continue
      if (sp.spaceNumber > winnerSpace) {
        winnerSpace = sp.spaceNumber
        winner = s
      }
      break
    }
    // check bottom to top for loser
    for (let i = 0; i < sp.snails.length; i++) {
      const s = sp.snails[i]
      if (CRAZY_SNAIL_COLORS.includes(s.id)) continue
      if (sp.spaceNumber < loserSpace) {
        loserSpace = sp.spaceNumber
        loser = s
      }
      break
    }
  }
  return { winner, loser }
}

export function scoreRace(state) {
  const next = JSON.parse(JSON.stringify(state))
  const { winner, loser } = findRaceWinnerAndLoser(next)

  function resolvePile(pile, targetId) {
    // Payout rank is determined by position among CORRECT bets only.
    // Wrong bets always lose 1 coin regardless of their pile position.
    let correctRank = 0
    for (let i = 0; i < pile.length; i++) {
      const card = pile[i]
      const owner = next.players.find(p => p.id === card.ownerId)
      if (!owner) continue
      if (card.color === targetId) {
        const payout = RACE_PAYOUTS[Math.min(correctRank, RACE_PAYOUTS.length - 1)]
        owner.coins = (owner.coins || 0) + payout
        correctRank++
      } else {
        owner.coins = Math.max(0, (owner.coins || 0) - 1)
      }
    }
  }

  if (winner) resolvePile(next.winnerBetPile, winner.id)
  if (loser) resolvePile(next.loserBetPile, loser.id)

  next.phase = 'ended'
  return next
}


