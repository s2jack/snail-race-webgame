import { useReducer, createContext, useContext } from 'react'
import { SNAIL_COLORS, CRAZY_SNAIL_COLORS, STARTING_COINS, TRACK_LENGTH, MIN_PLAYERS, FINISH_LINE } from '../game/constants'
import { createDicePool, drawDie } from '../game/dice'
import { moveSnail, resolveCrazySnailId } from '../game/movement'
import { scoreLeg, scoreRace } from '../game/scoring'
import { canPlaceLegBet, canPlaceRaceBet, canPlaceSpectator } from '../game/validation'

// initialize empty track 1..TRACK_LENGTH
function makeEmptyTrack() {
  const track = []
  for (let i = 1; i <= TRACK_LENGTH; i++) track.push({ spaceNumber: i, snails: [], spectatorTile: undefined })
  return track
}

function makeLegBetStacks() {
  return SNAIL_COLORS.reduce((acc, c) => ({ ...acc, [c]: [{ color: c, value: 5 }, { color: c, value: 3 }, { color: c, value: 2 }, { color: c, value: 2 }] }), {})
}

const initialState = {
  players: [],
  track: makeEmptyTrack(),
  dicePool: createDicePool(),
  usedDice: [],
  legBetStacks: makeLegBetStacks(),
  eventLog: [],
  winnerBetPile: [],
  loserBetPile: [],
  currentPlayerIndex: 0,
  legNumber: 1,
  phase: 'setup',
  raceEnded: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const { id, name } = action.player
      // prevent duplicates and max players
      if (!id || !name) return state
      if (state.players.find(p => p.id === id)) return state
      if (state.players.length >= 8) return state
      const nextPlayers = state.players.concat({ id, name, coins: STARTING_COINS, legBetTiles: [], raceBetCardsInHand: [...SNAIL_COLORS], spectatorTile: { onBoard: false } })
      return { ...state, players: nextPlayers }
    }

    case 'START_GAME': {
      // require minimum players
      if (state.players.length < MIN_PLAYERS) return state
      // initialize empty track
      const trackCopy = makeEmptyTrack()

      // helper: shuffle an array copy
      const shuffle = arr => {
        const a = arr.slice()
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const t = a[i]
          a[i] = a[j]
          a[j] = t
        }
        return a
      }

      // Place colored snails using a randomized draw order and face (1-3)
      const colorOrder = shuffle(SNAIL_COLORS)
      for (const color of colorOrder) {
        const value = 1 + Math.floor(Math.random() * 3)
        const spaceNumber = value // 1..3
        const sp = trackCopy.find(s => s.spaceNumber === spaceNumber)
        // arriving forward: place on top (push)
        sp.snails.push({ id: color })
      }

      // Place crazy snails by rolling grey dice (opposite direction)
      const crazyOrder = shuffle(CRAZY_SNAIL_COLORS)
      for (const cc of crazyOrder) {
        const value = 1 + Math.floor(Math.random() * 3)
        const spaceNumber = FINISH_LINE - value // 2 -> second last, etc.
        const sp = trackCopy.find(s => s.spaceNumber === spaceNumber)
        // place crazy snails underneath existing stack
        sp.snails = [{ id: cc }].concat(sp.snails)
      }

      return { ...state, track: trackCopy, phase: 'playing', currentPlayerIndex: 0, dicePool: createDicePool(), usedDice: [], legStarterIndex: 0 }
    }
    case 'INIT_PLAYERS': {
      const players = action.players.map(p => ({ ...p, coins: p.coins ?? STARTING_COINS, legBetTiles: [], raceBetCardsInHand: [...SNAIL_COLORS], spectatorTile: { onBoard: false } }))
      return { ...state, players }
    }

    case 'ROLL_DIE': {
      if (state.phase !== 'playing' && state.phase !== 'setup') return state
      // prevent rolling if 5 dice already used this leg (total dice count)
      const alreadyUsedTotal = (state.usedDice || []).length
      if (alreadyUsedTotal >= 5) return state
      if (!state.dicePool || state.dicePool.length === 0) return state

      // award 1 coin immediately to the player who rolled
      const playerId = action.playerId
      const playersCopy = state.players.map(p => ({ ...p }))
      const roller = playersCopy.find(p => p.id === playerId)
      if (roller) roller.coins = (roller.coins || 0) + 1

      // draw a die
      const { die, next } = drawDie(state.dicePool) || {}
      if (!die) return { ...state }

      // apply used dice update
      const usedDice = (state.usedDice || []).concat(die)

      // move snail according to die (die includes a face `value` set when drawn)
      // For grey dice: check the carrier rule before honouring die colour.
      // If exactly one crazy snail is carrying non-crazy snails, that one must move.
      const snailId = die.type === 'color' ? die.color : resolveCrazySnailId(state.track, die.crazyColor)

      // ── Compute animation path BEFORE moveSnail mutates the track ──
      const _isCrazy = CRAZY_SNAIL_COLORS.includes(snailId)
      const _dir = _isCrazy ? -1 : 1
      let _fromSpace = null
      let _movingStackIds = []
      for (const sp of state.track) {
        const idx = sp.snails.findIndex(s => s.id === snailId)
        if (idx !== -1) {
          _fromSpace = sp.spaceNumber
          _movingStackIds = sp.snails.slice(idx).map(s => s.id)
          break
        }
      }
      const _animSteps = []
      let _spectatorStepIdx = null
      if (_fromSpace !== null) {
        for (let i = 0; i <= die.value; i++) _animSteps.push(_fromSpace + _dir * i)
        const _dest = _fromSpace + _dir * die.value
        const _destSp = state.track.find(sp => sp.spaceNumber === _dest)
        if (_destSp && _destSp.spectatorTile) {
          const _eff = _destSp.spectatorTile.side === 'boost' ? _dir : -_dir
          _animSteps.push(_dest + _eff)
          _spectatorStepIdx = _animSteps.length - 1
        }
      }

      let interimState = { ...state, players: playersCopy, dicePool: next, usedDice }

      interimState = moveSnail(interimState, snailId, die.value)

      // Attach animation metadata for the Board's step-by-step hop display
      interimState.lastMove = {
        id: Date.now(),
        movingStackIds: _movingStackIds,
        steps: _animSteps,
        spectatorStepIndex: _spectatorStepIdx,
      }

      // Log the roll
      const rollerPlayer = interimState.players.find(p => p.id === playerId)
      const playerName = rollerPlayer ? rollerPlayer.name : playerId
      const rollLabel = die.type === 'color' ? `${die.color} ${die.value}` : `${die.crazyColor} ${die.value}`
      interimState.eventLog = (interimState.eventLog || []).concat([`${playerName} rolled: ${rollLabel}`])

      // Log current placements after move
      const racingSpaces = interimState.track.filter(sp => sp.snails && sp.snails.length > 0)
      const sorted = racingSpaces.slice().sort((a, b) => b.spaceNumber - a.spaceNumber)
      const placements = []
      for (const sp of sorted) {
        for (let i = sp.snails.length - 1; i >= 0; i--) {
          const s = sp.snails[i]
          if (CRAZY_SNAIL_COLORS.includes(s.id)) continue
          placements.push(s.id)
        }
      }
      if (placements.length > 0) {
        const leaderText = placements.slice(0, 5).map((c, i) => `${i + 1}st ${c}`).join(', ')
        interimState.eventLog = (interimState.eventLog || []).concat([`Current leaderboard: ${leaderText}`])
      }

      // If 5 dice used (total dice count), transition to leg_scoring
      const totalUsedCount = interimState.usedDice.length
      if (totalUsedCount >= 5) {
        // perform leg scoring (compute payouts and attach legSummary)
        const scored = scoreLeg(interimState)
        // append leg summary log entries
        const payouts = scored.legSummary.payouts || []
        const placementText = scored.legSummary.placements.map(p => `${p.place}st ${p.color}`).join(', ')
        let summaryLines = []
        summaryLines.push(`Leg finished. Placements: ${placementText}`)
        for (const p of payouts) {
          const pl = scored.players.find(x => x.id === p.playerId)
          const name = pl ? pl.name : p.playerId
          summaryLines.push(`${name} change: ${p.delta >= 0 ? '+' : ''}${p.delta}`)
        }
        scored.eventLog = (scored.eventLog || []).concat(summaryLines)
        // set phase to leg_scoring and keep usedDice so UI can show it; do not reset dice yet
        return { ...scored, phase: 'leg_scoring' }
      }

      // If race ended during movement, set phase to final_scoring
      if (interimState.raceEnded) {
        // Build race placements (non-crazy snails ordered furthest to least, top-to-bottom within space)
        const racingSpaces = interimState.track.filter(sp => sp.snails && sp.snails.length > 0)
        const sorted = racingSpaces.slice().sort((a, b) => b.spaceNumber - a.spaceNumber)
        const placements = []
        for (const sp of sorted) {
          for (let i = sp.snails.length - 1; i >= 0; i--) {
            const s = sp.snails[i]
            if (CRAZY_SNAIL_COLORS.includes(s.id)) continue
            placements.push({ place: placements.length + 1, color: s.id })
          }
        }

        // create raceSummary with placements and current bet piles (orders preserved)
        const raceSummary = {
          placements,
          winnerBetPile: interimState.winnerBetPile || [],
          loserBetPile: interimState.loserBetPile || [],
        }

        interimState.raceSummary = raceSummary
        interimState.phase = 'final_scoring'
        return interimState
      }

      // advance to next player
      const playerCount = interimState.players ? interimState.players.length : 0
      if (playerCount > 0) {
        interimState.currentPlayerIndex = (interimState.currentPlayerIndex + 1) % playerCount
      }

      return interimState
    }

    case 'PLACE_LEG_BET': {
      if (state.phase !== 'playing') return state
      const { playerId, color } = action
      const v = canPlaceLegBet(state, playerId, color)
      if (!v.valid) return state
      const nextState = JSON.parse(JSON.stringify(state))
      const tile = nextState.legBetStacks[color].shift()
      const player = nextState.players.find(p => p.id === playerId)
      if (!player) return state
      player.legBetTiles = player.legBetTiles || []
      player.legBetTiles.push(tile)
      // log action
      const playerObj = nextState.players.find(p => p.id === playerId)
      nextState.eventLog = (nextState.eventLog || []).concat([`${playerObj ? playerObj.name : playerId} placed leg bet on ${color}`])
      // advance turn
      if (nextState.players && nextState.players.length > 0) {
        nextState.currentPlayerIndex = (nextState.currentPlayerIndex + 1) % nextState.players.length
      }
      return nextState
    }

    case 'PLACE_RACE_BET': {
      if (state.phase !== 'playing') return state
      const { playerId, color, betType } = action
      const v = canPlaceRaceBet(state, playerId, color)
      if (!v.valid) return state
      const nextState = JSON.parse(JSON.stringify(state))
      const player = nextState.players.find(p => p.id === playerId)
      if (!player) return state
      // remove card from hand (first occurrence)
      const idx = player.raceBetCardsInHand.indexOf(color)
      if (idx === -1) return state
      player.raceBetCardsInHand.splice(idx, 1)
      const pile = betType === 'winner' ? nextState.winnerBetPile : nextState.loserBetPile
      const card = { color, type: betType, ownerId: playerId, placedOrder: pile.length + 1 }
      pile.push(card)
      // log
      const playerObjR = nextState.players.find(p => p.id === playerId)
      nextState.eventLog = (nextState.eventLog || []).concat([`${playerObjR ? playerObjR.name : playerId} placed race ${betType} bet on ${color}`])
      if (nextState.players && nextState.players.length > 0) {
        nextState.currentPlayerIndex = (nextState.currentPlayerIndex + 1) % nextState.players.length
      }
      return nextState
    }

    case 'PLACE_SPECTATOR': {
      if (state.phase !== 'playing') return state
      const { playerId, spaceNumber, side, move = false } = action
      const v = canPlaceSpectator(state, playerId, spaceNumber, { move })
      if (!v.valid) return state
      const nextState = JSON.parse(JSON.stringify(state))
      const player = nextState.players.find(p => p.id === playerId)
      if (!player) return state

      // if moving an existing tile, remove it from its old space first
      if (move && player.spectatorTile && player.spectatorTile.onBoard && player.spectatorTile.position) {
        const old = nextState.track.find(s => s.spaceNumber === player.spectatorTile.position)
        if (old && old.spectatorTile && old.spectatorTile.ownerId === playerId) old.spectatorTile = undefined
      }

      // place tile on new space or update side if same space
      const space = nextState.track.find(s => s.spaceNumber === spaceNumber)
      if (space.spectatorTile && space.spectatorTile.ownerId === playerId) {
        // updating side only
        space.spectatorTile.side = side
        player.spectatorTile = { onBoard: true, position: spaceNumber, side }
      } else {
        space.spectatorTile = { ownerId: playerId, side }
        player.spectatorTile = { onBoard: true, position: spaceNumber, side }
      }
      // log
      nextState.eventLog = (nextState.eventLog || []).concat([`${player.name} placed spectator on ${spaceNumber} (${side})`])
      if (nextState.players && nextState.players.length > 0) {
        nextState.currentPlayerIndex = (nextState.currentPlayerIndex + 1) % nextState.players.length
      }
      return nextState
    }

    case 'START_NEXT_LEG': {
      // reset leg bet stacks, reset dice, advance legNumber, set phase to playing
      const nextState = JSON.parse(JSON.stringify(state))
      nextState.legBetStacks = makeLegBetStacks()
      nextState.dicePool = createDicePool()
      nextState.usedDice = []
      nextState.legNumber = (nextState.legNumber || 1) + 1
      // determine next starter: the player after legStarterIndex
      const playerCount = nextState.players ? nextState.players.length : 0
      if (playerCount > 0) {
        const prevStarter = typeof nextState.legStarterIndex === 'number' ? nextState.legStarterIndex : 0
        const nextStarter = (prevStarter + 1) % playerCount
        nextState.legStarterIndex = nextStarter
        nextState.currentPlayerIndex = nextStarter
      }
      nextState.phase = 'playing'
      // clear leg summary
      delete nextState.legSummary
      return nextState
    }

    case 'RESOLVE_RACE': {
      // Apply race scoring (payouts for winner/loser piles) and end the game.
      const scored = scoreRace(state)
      // Append an event log entry listing placements
      if (scored && scored.raceSummary && scored.raceSummary.placements) {
        const placements = scored.raceSummary.placements.map(p => `${p.place}st ${p.color}`).join(', ')
        scored.eventLog = (scored.eventLog || []).concat([`Race finished. Placements: ${placements}`])
      }
      return scored
    }

    default:
      return state
  }
}

export function useGameStateHook() {
  return useReducer(reducer, initialState)
}

export const GameStateContext = createContext(null)

export function useGameState() {
  return useContext(GameStateContext)
}
