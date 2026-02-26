import React from 'react'
import { createRoot } from 'react-dom/client'
import { GameProvider } from './context/GameContext'
import { LocalPlayerProvider } from './context/LocalPlayerContext'
import App from './App'

import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <LocalPlayerProvider>
        <App />
      </LocalPlayerProvider>
    </GameProvider>
  </React.StrictMode>
)
