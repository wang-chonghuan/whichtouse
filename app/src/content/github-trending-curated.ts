import type { Confidence, Source } from '~/lib/catalog'

export type CuratedTrendingReview = {
  homepage: string
  bestFor: string
  confidence: Confidence
  rankBasis: string
  pricing: string
  pricingFree: string | null
  pricingPaid: string | null
  features: string[]
  pros: string[]
  cons: string[]
  sources: Source[]
}

export const CURATED_TRENDING_REVIEWS: Record<string, CuratedTrendingReview> = {
  'koala73/worldmonitor': {
    homepage: 'https://www.worldmonitor.app',
    bestFor:
      'A browser-first global intelligence workspace that connects geopolitical news with military, maritime, infrastructure, market, cyber, and natural-hazard signals on one live map.',
    confidence: 'high',
    rankBasis:
      'World Monitor ranks near the top because it compresses a fragmented, institution-grade OSINT workflow into a no-signup browser product: 500+ feeds and 56 map layers converge on one operational view, while cross-source correlation helps users see when physical, market, and editorial signals reinforce each other. Its rise from a January 2026 weekend project to 2M+ users and roughly 73k GitHub stars confirms that the accessible “global control room” framing solved a real information-overload problem; those adoption numbers validate the product thesis rather than constitute the thesis.',
    pricing: 'Free dashboard; Pro and API tiers available',
    pricingFree:
      'Free public dashboard with no signup — 56 map layers, 500+ feeds, country briefs, instability scores, chokepoints, alerts, and watchlists; AGPL-3.0 source is available for self-hosting',
    pricingPaid:
      'Pro $39.99/month or $399.99/year — WM Analyst chat, Scenario Engine, AI digests, custom widgets, and MCP access',
    features: [
      '500+ feeds and 56 live layers across dual 3D/WebGL maps',
      'Cross-source correlation, corroborated alerts, and Country Instability Index',
      'AI briefs, scenario analysis, custom monitors, and 40-tool MCP access',
      'Browser, Tauri desktop, Docker/self-host, API, CLI, and SDK access',
    ],
    pros: [
      'Connects physical signals, reporting, infrastructure, and markets in one workspace, so analysts can investigate convergence without assembling separate tracking tools',
      'Runs immediately in the browser with no signup, while desktop and self-hosted deployments provide a path for local or controlled environments',
      'Keeps conclusions inspectable through source links, freshness metadata, documented scoring algorithms, and an open processing pipeline rather than presenting an unexplained AI verdict',
    ],
    cons: [
      'The breadth produces a heavy mobile runtime: issue #5165 records 20 post-hydration long tasks, 9.5s total blocking time, and 35.3s time-to-interactive in a throttled mobile trace',
      'Anonymous-session failures can blank many widgets at once: issue #5251 measured recurring fresh-session 401 failures followed by a 15-minute client cooldown',
      'Forecasting is not yet a proven intelligence edge: issue #5233 reports a narrow, 37%-synthetic input funnel and says the current Brier score cannot validate real forecasting skill',
    ],
    sources: [
      {
        name: 'Official overview',
        url: 'https://www.worldmonitor.app/docs/about',
      },
      {
        name: 'Repository README',
        url: 'https://github.com/koala73/worldmonitor',
      },
      {
        name: 'Architecture & entry flow',
        url: 'https://github.com/koala73/worldmonitor/blob/main/ARCHITECTURE.md',
      },
      {
        name: 'Independent OSINT analysis',
        url: 'https://projectosint.com/world-monitor-osint-real-time-conflict-tracking/',
      },
      {
        name: 'Mobile performance issue',
        url: 'https://github.com/koala73/worldmonitor/issues/5165',
      },
      {
        name: 'Session reliability issue',
        url: 'https://github.com/koala73/worldmonitor/issues/5251',
      },
      {
        name: 'Forecast validation issue',
        url: 'https://github.com/koala73/worldmonitor/issues/5233',
      },
    ],
  },
}
