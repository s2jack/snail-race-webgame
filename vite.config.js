import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Ensure the service worker is included in the build output
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Snail Race',
        short_name: 'Snail Race',
        description: 'A browser-based multiplayer snail racing and betting game.',
        theme_color: '#b98a49',       // gold — primary accent colour
        background_color: '#fff8ee',  // cream — parchment background
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable', // supports adaptive icons on Android
          },
        ],
      },
    }),
  ],
})
