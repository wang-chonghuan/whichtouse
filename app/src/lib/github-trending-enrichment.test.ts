import { describe, expect, it } from 'vitest'

import {
  buildTrendingDetailItem,
  classifyTrendingRepository,
  extractReadmeFeatures,
} from './github-trending-enrichment'

describe('GitHub Trending enrichment', () => {
  it('maps repository descriptions to highlighted WhichToUse categories', () => {
    const classify = (description: string) =>
      classifyTrendingRepository({
        name: 'owner/repo',
        description,
        language: 'TypeScript',
      })

    expect(classify('A curated collection of Claude Skills')).toBe('Workflow Automation')
    expect(classify('A foundation model for financial markets')).toBe('Bookkeeping & Finance')
    expect(classify('A privacy-first grammar checker')).toBe('Content Writing')
    expect(classify('An AI database tool and SQL client')).toBe('Data Analysis')
  })

  it('extracts concise feature fields from the official README', () => {
    const features = extractReadmeFeatures(
      `
## Features
- Record and replay browser workflows
- Run isolated Chromium sessions in parallel
- Export structured results as JSON
      `,
      'Browser Automation',
      ['playwright'],
      'A browser automation toolkit.',
      'TypeScript',
    )

    expect(features).toEqual([
      'Record and replay browser workflows',
      'Run isolated Chromium sessions in parallel',
      'Export structured results as JSON',
      'A browser automation toolkit',
    ])
  })

  it('produces the same complete detail fields used by catalog products', () => {
    const item = buildTrendingDetailItem({
      repository: {
        rank: 2,
        name: 'openai/example',
        url: 'https://github.com/openai/example',
        description: 'A browser automation toolkit.',
        language: 'TypeScript',
        stars: '12,345',
        starsToday: '678',
        category: 'Browser Automation',
      },
      metadata: {
        html_url: 'https://github.com/openai/example',
        homepage: null,
        description: 'A browser automation toolkit.',
        stargazers_count: 12345,
        forks_count: 900,
        open_issues_count: 12,
        language: 'TypeScript',
        topics: ['playwright', 'browser-automation'],
        license: { spdx_id: 'MIT', name: 'MIT License' },
        pushed_at: '2026-07-24T12:00:00Z',
      },
      readme: '## Features\n- Record browser workflows\n- Run sessions in parallel',
      issues: [
        {
          title: 'Session cleanup can leak temporary profiles',
          html_url: 'https://github.com/openai/example/issues/1',
          comments: 18,
        },
      ],
    })

    expect(item.rankBasis).toContain('#2 on GitHub Trending')
    expect(item.pricingFree).toContain('MIT')
    expect(item.pricingPaid).toBeNull()
    expect(item.features?.length).toBeGreaterThanOrEqual(2)
    expect(item.pros?.length).toBeGreaterThanOrEqual(2)
    expect(item.cons?.[0]).toContain('Session cleanup')
    expect(item.sources.map((source) => source.name)).toContain('Community issues')
  })

  it('uses the researched World Monitor review instead of metric-shaped filler', () => {
    const item = buildTrendingDetailItem({
      repository: {
        rank: 2,
        name: 'koala73/worldmonitor',
        url: 'https://github.com/koala73/worldmonitor',
        description: 'Real-time global intelligence dashboard.',
        language: 'TypeScript',
        stars: '72,948',
        starsToday: '2,194',
        category: 'Research & Search',
      },
      metadata: null,
      readme: '',
      issues: [],
    })

    expect(item.rankBasis).toMatch(/^World Monitor ranks near the top because/)
    expect(item.rankBasis).not.toMatch(/^#2 on GitHub Trending/)
    expect(item.pros).toEqual(
      expect.arrayContaining([
        expect.stringContaining('physical signals'),
        expect.stringContaining('no signup'),
        expect.stringContaining('inspectable'),
      ]),
    )
    expect(item.cons).toEqual(
      expect.arrayContaining([
        expect.stringContaining('#5165'),
        expect.stringContaining('#5251'),
        expect.stringContaining('#5233'),
      ]),
    )
    expect(item.pricingPaid).toContain('$39.99/month')
  })
})
