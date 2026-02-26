import React from 'react'
import { GameStateContext, useGameStateHook } from '../hooks/useGameState'

export function GameProvider({ children }) {
  const [state, dispatch] = useGameStateHook()
  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  )
}

export function useGameContext() {
  const ctx = React.useContext(GameStateContext)
  if (!ctx) throw new Error('useGameContext must be used within GameProvider')
  return ctx
}
