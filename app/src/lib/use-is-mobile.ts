import { useEffect, useState } from 'react'

import { MOBILE_QUERY } from '~/lib/layout-store'

// Reports whether the viewport is below the sidebar breakpoint. Starts as
// `false` so server and first client render agree (the desktop layout), then
// corrects on mount — never read during render on the server.
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isMobile
}
