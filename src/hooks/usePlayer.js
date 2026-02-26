import { useContext, createContext } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children, player }) {
  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
