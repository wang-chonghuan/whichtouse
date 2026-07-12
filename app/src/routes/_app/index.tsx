import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({
  component: Home,
})

// MVP hello-world. Proves the full chain (SSR build → deploy → renders in a real
// browser). The real surface — use-case categories × three form-factor tracks —
// lands via the Phase 1 seed.
function Home() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
        WhichToUse
      </h1>
      <p style={{ fontSize: '1.05rem', opacity: 0.85, margin: 0, maxWidth: '32rem' }}>
        The honest ranking of AI agents, by what you&rsquo;re doing.
      </p>
      <p style={{ fontSize: '0.85rem', opacity: 0.5, margin: 0 }}>Coming soon.</p>
    </main>
  )
}
