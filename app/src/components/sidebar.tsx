import type { ComponentType } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import {
  AudioLines,
  BarChart3,
  BookOpen,
  Briefcase,
  Calculator,
  Code2,
  FileText,
  Globe,
  Image as ImageIcon,
  Languages,
  Mail,
  MessagesSquare,
  MousePointerClick,
  Network,
  NotebookPen,
  Palette,
  PenLine,
  Presentation,
  Scale,
  Search,
  Share2,
  Telescope,
  Users,
  Video,
  Workflow,
} from 'lucide-react'

import type { Category } from '~/lib/catalog'

const ICONS: Record<string, ComponentType<{ size?: number }>> = {
  'content-writing': PenLine,
  'video-generation': Video,
  'image-generation': ImageIcon,
  'voice-audio': AudioLines,
  'lead-gen': Users,
  'email-outreach': Mail,
  'seo-geo': Search,
  'social-media': Share2,
  'ui-design': Palette,
  presentation: Presentation,
  'data-analysis': BarChart3,
  'research-search': Telescope,
  'customer-support': MessagesSquare,
  'meeting-notes': NotebookPen,
  'pdf-documents': FileText,
  'knowledge-base': BookOpen,
  translation: Languages,
  'resume-jobs': Briefcase,
  bookkeeping: Calculator,
  'legal-contract': Scale,
  coding: Code2,
  'browser-automation': MousePointerClick,
  'web-scraping': Globe,
  'workflow-automation': Workflow,
  'architecture-diagram': Network,
}

const s = stylex.create({
  aside: {
    width: 232,
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    paddingBlock: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100%',
  },
  hideSm: { display: { default: 'flex', '@media (max-width: 900px)': 'none' } },
  list: { display: 'flex', flexDirection: 'column', gap: 1 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
    marginInline: 'var(--spacing-2)',
    borderRadius: 'var(--radius-element)',
    fontSize: 13.5,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    backgroundColor: { default: 'transparent', ':hover': 'var(--color-overlay-hover)' },
  },
  active: {
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-text-accent)',
    fontWeight: 600,
  },
  icon: { display: 'flex', flexShrink: 0, opacity: 0.85 },
  card: {
    marginTop: 'var(--spacing-5)',
    marginInline: 'var(--spacing-4)',
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  cardH: { fontSize: 13, fontWeight: 700, marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' },
  cardB: { fontSize: 12, lineHeight: 1.5, color: 'var(--color-text-secondary)' },
  cardLink: {
    display: 'inline-block',
    marginTop: 'var(--spacing-2)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-accent)',
    textDecoration: 'none',
  },
})

function useActiveSlug(): string | null {
  const pathname = useRouterState({ select: (st) => st.location.pathname })
  const m = pathname.match(/^\/c\/([^/]+)/)
  return m ? m[1] : null
}

export function Sidebar({ categories }: { categories: Category[] }) {
  const active = useActiveSlug()
  return (
    <aside {...stylex.props(s.aside, s.hideSm)}>
      <nav {...stylex.props(s.list)}>
        {categories.map((c) => {
          const Icon = ICONS[c.slug] ?? Code2
          const isActive = c.slug === active
          return (
            <Link
              key={c.slug}
              to="/c/$slug"
              params={{ slug: c.slug }}
              {...stylex.props(s.item, isActive && s.active)}
            >
              <span {...stylex.props(s.icon)}>
                <Icon size={16} />
              </span>
              {c.name}
            </Link>
          )
        })}
      </nav>
      <div {...stylex.props(s.card)}>
        <div {...stylex.props(s.cardH)}>How rankings work</div>
        <div {...stylex.props(s.cardB)}>
          We rank apps and skills from a consensus of independent public sources, graded by
          confidence. Hands-on testing upgrades a pick from 📋 provisional to 🧪 tested.
        </div>
      </div>
    </aside>
  )
}
