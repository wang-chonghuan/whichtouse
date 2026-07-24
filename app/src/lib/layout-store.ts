import { create } from 'zustand'

// Sidebar state. The desktop column and the mobile panel are tracked
// separately on purpose: the column is open by default, while the mobile panel
// must start closed. One shared flag would either hide the desktop sidebar on
// load or pop the mobile panel open over the content, and picking between them
// at render time would need the viewport — which the server does not have.
type LayoutState = {
  /** desktop (>900px): the sidebar is a layout column, open by default */
  sidebarOpen: boolean
  /** mobile (≤900px): the same sidebar as a fixed panel, closed by default */
  mobileOpen: boolean
  toggleSidebar: () => void
  setMobile: (open: boolean) => void
  toggleMobile: () => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  sidebarOpen: true,
  mobileOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobile: (mobileOpen) => set({ mobileOpen }),
  toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
}))

/** Matches the sidebar's own breakpoint. */
export const MOBILE_QUERY = '(max-width: 900px)'
