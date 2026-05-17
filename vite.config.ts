import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/lplates/',
  preview: {
    allowedHosts: true
  },
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      srcDir: 'src',
      filename: 'sw.ts',
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp}'],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
      },
      devOptions: {
        enabled: true
      },
      includeAssets: ['pwa-icon.png'],
      manifest: {
        name: 'License Plates Lookup',
        short_name: 'LPlates',
        description: 'License plate regions lookup application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/lplates/',
        start_url: '/lplates/',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
