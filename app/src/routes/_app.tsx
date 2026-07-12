import { createFileRoute, Outlet } from '@tanstack/react-router'

// Minimal app shell for the MVP. The category / ranking layout (the real product
// surface) is built in Phase 1 via the seed; for now this is just a pass-through
// wrapper kept for structural parity with the reference architecture.
export const Route = createFileRoute('/_app')({
  component: AppShell,
})

function AppShell() {
  return (
    <div className="wt-app">
      <Outlet />
    </div>
  )
}
