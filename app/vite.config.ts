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
    noExternal: ['@astryxdesign/core', '@stylexjs/stylex'],
  },
  optimizeDeps: {
    include: ['@astryxdesign/core'],
  },
  plugins: [
    // StyleX is the single styling authority (Tailwind + shadcn removed). The
    // unplugin extracts atomic CSS into the app's CSS asset and must run before
    // the React plugin per the official Vite integration.
    stylex.vite({
      useCSSLayers: true,
      dev: process.env.NODE_ENV === 'development',
      runtimeInjection: false,
      // Astryx ships its own pre-compiled StyleX output, built with the default
      // 'x' prefix and a `:not(#\#)` specificity boost. Same prefix means the
      // same atomic class name for the same declaration — our `display: flex`
      // and Astryx's are both `.x78zum5` — and Astryx's boosted rule then wins
      // on OUR elements too, so a media query of ours could not turn that
      // display off. Namespacing our classes removes the collision: nothing in
      // Astryx's stylesheet matches a `wt…` class.
      classNamePrefix: 'wt',
    }),
    tanstackStart(),
    viteReact(),
    nitro(),
  ],
})
