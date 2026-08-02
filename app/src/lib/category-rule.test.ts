import { describe, expect, it } from 'vitest'
import { assignCategory, clearsSoloBar, matches } from './category-rule'

// The substring family of defects, each a real misfiled row from production.
describe('word-boundary matching', () => {
  it('does not fire "resume" on "resumable"', () => {
    expect(matches(' persistent resumable sessions ', 'resume')).toBe(false)
  })
  it('does not fire "sql" on "SQLite"', () => {
    expect(matches(' local sqlite index ', 'sql')).toBe(false)
  })
})

describe('assignCategory', () => {
  it('discards a security library that a "resume" query found', () => {
    expect(assignCategory({
      name: 'claude-red',
      description: '58 offensive security skill files: SQL injection, Active Directory, exploit development',
      topics: ['security'], track: 'skill',
    })).toBeNull()
  })

  it('discards a session-resume tool from resume-jobs', () => {
    expect(assignCategory({
      name: 'resume-skills',
      description: 'Migrate conversation context between coding agents',
      topics: [], track: 'skill',
    })?.slug).not.toBe('resume-jobs')
  })

  it('confirms a genuine social-media tool', () => {
    expect(assignCategory({
      name: 'postiz',
      description: 'Self-hosted AI social media scheduling and publishing for 20+ channels',
      topics: ['social-media'], track: 'oss',
    })?.slug).toBe('social-media')
  })

  it('discards an omnibus marketplace that matches every area at once', () => {
    expect(assignCategory({
      name: 'claude-skills',
      description: 'A curated list of 345 skills across every domain — marketing, legal, finance, coding',
      topics: [], track: 'skill',
    })).toBeNull()
  })

  it('judges saas rows on name and tagline only, ignoring topics (D11)', () => {
    const withTopics = assignCategory({
      name: 'Acme', description: 'A tool', topics: ['social-media'], track: 'saas',
    })
    expect(withTopics).toBeNull()
  })
})

describe('clearsSoloBar', () => {
  it('rejects a placement that only just cleared the ordinary bar', () => {
    expect(clearsSoloBar({ slug: 'coding', score: 3, margin: 2, matched: [] })).toBe(false)
  })
})
