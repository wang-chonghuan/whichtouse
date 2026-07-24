import { Link } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import { Search } from 'lucide-react'

const s = stylex.create({
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-8)',
    height: 60,
    paddingInline: 'var(--spacing-5)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    flexShrink: 0,
  },
  logo: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--color-text-primary)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  logoAccent: { color: 'var(--color-text-accent)' },
  nav: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-5)' },
  link: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    paddingBlock: 'var(--spacing-1)',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
  },
  active: {
    color: 'var(--color-text-accent)',
    borderBottomColor: 'var(--color-text-accent)',
  },
  spacer: { marginInlineStart: 'auto' },
  search: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 'var(--radius-full)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  hideSm: {
    display: { default: 'flex', '@media (max-width: 720px)': 'none' },
  },
})

const LINKS = ['Compare', 'Reviews', 'Methodology', 'About']

export function NavBar() {
  return (
    <header {...stylex.props(s.bar)}>
      <Link to="/" {...stylex.props(s.logo)}>
        Which<span {...stylex.props(s.logoAccent)}>ToUse</span>
      </Link>
      <nav {...stylex.props(s.nav, s.hideSm)}>
        <Link to="/" {...stylex.props(s.link, s.active)}>
          Rankings
        </Link>
        {LINKS.map((l) => (
          <span key={l} {...stylex.props(s.link)}>
            {l}
          </span>
        ))}
      </nav>
      <span {...stylex.props(s.spacer)} />
      <span {...stylex.props(s.search)}>
        <Search size={18} />
      </span>
    </header>
  )
}
