import React, { createContext, useContext, useState, useEffect } from 'react'

const LocalPlayerContext = createContext(null)

export function LocalPlayerProvider({ children }) {
  const [localPlayerId, setLocalPlayerId] = useState(() => {
    try {
      return localStorage.getItem('localPlayerId')
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    try {
      if (localPlayerId) localStorage.setItem('localPlayerId', localPlayerId)
      else localStorage.removeItem('localPlayerId')
    } catch (e) {}
  }, [localPlayerId])

  return (
    <LocalPlayerContext.Provider value={{ localPlayerId, setLocalPlayerId }}>
      {children}
    </LocalPlayerContext.Provider>
  )
}

export function useLocalPlayer() {
  return useContext(LocalPlayerContext)
}
