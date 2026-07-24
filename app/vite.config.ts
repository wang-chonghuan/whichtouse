import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import stylex from '@stylexjs/unplugin'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // app/ lives under an npm workspace; the shared .env stays at the repo root
  // (the content skills + n-easyapp read it there), so load env from the parent.
  envDir: '..',
  server: {
    port: 5200,
  },
  resolve: {
    alias: {
      '~': '/src',
    },
    dedupe: ['react', 'react-dom'],
  },
  ssr: {
    // Bundle Astryx with the app so it shares the app's React instance instead
    // of being externalized by Nitro.
    noExternal: [
      '@astryxdesign/core',
      '@astryxdesign/theme-butter',
      '@stylexjs/stylex',
    ],
  },
  optimizeDeps: {
    include: ['@astryxdesign/core', '@astryxdesign/theme-butter'],
  },
  plugins: [
    // StyleX is the single styling authority (Tailwind + shadcn removed). The
    // unplugin extracts atomic CSS into the app's CSS asset and must run before
    // the React plugin per the official Vite integration.
    stylex.vite({
      useCSSLayers: true,
      dev: process.env.NODE_ENV === 'development',
      runtimeInjection: false,
    }),
    tanstackStart(),
    viteReact(),
    nitro(),
  ],
})
