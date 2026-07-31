/* Design tokens — a direct transcription of DESIGN.md.
 *
 * Nothing in this file is invented. Every value carries the DESIGN.md section it
 * comes from, so a reviewer can diff the prototype against the spec by reading
 * one file. The single exception is marked EXTENSION and explained where it sits.
 *
 * Loaded after the Tailwind Play CDN and before any markup is rendered. */

tailwind.config = {
  theme: {
    extend: {
      /* §1.3 Colour — the shadcn token set as shipped by the reference. */
      colors: {
        background: '#fafaf9',            // page canvas, warm off-white — NOT white
        foreground: '#1a1a1a',

        card: '#ffffff',
        'card-foreground': '#1a1a1a',

        primary: '#1a1a1a',               // primary is BLACK
        'primary-foreground': '#ffffff',

        secondary: '#f4f5f2',
        'secondary-foreground': '#3f3f3c',

        muted: '#f2f2ee',
        'muted-foreground': '#8a8a8a',

        /* The brand hue is the one thing we deliberately do NOT take from the
         * reference — see the note at the bottom of DESIGN.md §5. Everything
         * about the system is hue-agnostic, so only these five values move.
         * The reference lime is retained below so the derivation stays legible. */
        'brand-lime': '#c9f158',          // reference brand, retained, unused

        brand: '#c4b0ff',                 // rationed: <10 uses per page
        'brand-foreground': '#1a1a1a',    // black on brand, never white (9.0:1)

        accent: '#ede8ff',                // brand tinted, the soft-badge / banner surface
        'accent-foreground': '#362073',   // 11.6:1 on accent

        destructive: '#c0564f',

        border: '#e6e6e2',
        input: '#e0e1de',
        ring: '#1a1a1a',                  // focus ring is black, not brand

        sidebar: '#fbfbfa',
        'sidebar-foreground': '#3f3f3c',

        /* §1.3 — the three inline hexes, promoted to tokens as the doc suggests.
         * Re-derived from the brand above at the same tint depths the reference
         * used (#fbfde9 / #fafbf6 / #eef1e6 off its lime). */
        'brand-tint': '#f7f4ff',          // sponsored / highlighted card fill
        'panel-tint': '#faf9ff',          // tinted section panel
        'panel-tint-border': '#efecfa',
        'panel-grey': '#f1f0ea',          // warm grey section panel

        /* EXTENSION (§5) — the valence pair our list format needs and the
         * reference has no token for. With the brand moved off lime these no
         * longer compete with it for meaning, which was the whole point of
         * §5's first option. --con is --destructive rather than a second red. */
        edge: '#0f7a3d',
        con: '#c0564f',                   // = destructive
      },

      /* §1.2 Typography — one typeface, CJK fallbacks inside the family. */
      fontFamily: {
        sans: ['Space Grotesk', 'Avenir Next', 'PingFang SC', 'Hiragino Sans GB',
               'Microsoft YaHei', 'Noto Sans CJK SC', 'Noto Sans SC',
               'ui-sans-serif', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      /* §1.4 Radius — the measured ladder. xl→16 and 2xl→20 deliberately
       * override Tailwind's defaults, because that is what the reference's
       * rounded-xl / rounded-2xl actually compute to. */
      borderRadius: {
        sm: '7px',      // 24px logo tile
        md: '10px',     // small icon button, compact CTA
        lg: '12px',     // nav item
        xl: '16px',     // all standard buttons, search field
        '2xl': '20px',  // cards
        '3xl': '28px',  // section panels
      },

      /* §1.5 Elevation — every shadow shares the same 0 1px 3px base. Applied
       * almost nowhere; borders carry the layering. */
      boxShadow: {
        xs: '0 1px 3px 0 rgba(0,0,0,.05)',
        sm: '0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px rgba(0,0,0,.10)',
        md: '0 1px 3px 0 rgba(0,0,0,.10), 0 2px 4px -1px rgba(0,0,0,.10)',
        lg: '0 1px 3px 0 rgba(0,0,0,.10), 0 4px 6px -1px rgba(0,0,0,.10)',
        xl: '0 1px 3px 0 rgba(0,0,0,.10), 0 8px 10px -1px rgba(0,0,0,.10)',
      },

      /* §1.6 Motion — 150ms, geometric, three transitions in total. */
      transitionDuration: { DEFAULT: '150ms' },
      transitionTimingFunction: { DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)' },

      /* §1.2 — tracking-tight on every heading, nothing else. */
      letterSpacing: {
        tight: '-0.025em',
        label: '0.05em',   // 11px uppercase badges
        micro: '0.025em',  // 9.5px uppercase badges
      },

      maxWidth: { container: '1440px' },  // §2.1
    },
  },
};
