// theme.config.ts
// NOTE: CSS custom properties in src/styles/global.css must stay in sync with brand.colors.
// If you change a color here, update global.css to match.

export const theme = {
  site: {
    name: 'PurposeBound Strategies',
    tagline: 'Build a Business That Honors Something Greater.',
    description:
      'Sales coaching and management consulting for leaders who build with integrity.',
    url: 'https://purposeboundstrategies.com', // DEBT: update when domain is confirmed
  },
  founder: {
    name: '[Founder Name]', // replace when confirmed
    title: 'Founder, PurposeBound Strategies',
    photo: '/images/founder.jpg', // replace when headshot is delivered
    email: 'hello@purposeboundstrategies.com', // replace with real email
  },
  brand: {
    logo: '/logo-placeholder.svg', // replace when logo is delivered
    // Palette: "Stained Glass" — deep structural colors + single gold accent per section.
    // Gold is used ONCE per section as the moment the light catches. Not a pattern, a highlight.
    colors: {
      deep: '#2c1018',      // dark backgrounds, nav, footer
      rich: '#3d1520',      // hero, dark sections
      accent: '#c9a84c',    // gold — CTAs, labels, the light
      cream: '#f7f5f0',     // light backgrounds, body sections
      burgundy: '#6b1e2e',  // section labels, links, borders
      muted: '#d9c4b8',     // body text on dark backgrounds
      text: '#2c1018',      // body text on light backgrounds
    },
    fonts: {
      heading: ['Georgia', '"Times New Roman"', 'serif'],
      body: ['Georgia', '"Times New Roman"', 'serif'],
    },
  },
  metrics: [
    { value: '[X]+', label: 'Leaders Coached' },
    { value: '[X]%', label: 'Report Stronger Team Culture' },
    { value: '[X] Yrs', label: 'Sales Leadership Experience' },
  ],
  nav: [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Blog', href: '/blog' },
  ],
  calendly: {
    url: 'https://calendly.com/[handle]/discovery', // DEBT: update with real Calendly URL
  },
  email: {
    // DEBT: add webhook URL when email provider is chosen (ConvertKit or MailerLite)
    webhookUrl: '',
  },
  social: {
    linkedin: '', // add when available
    twitter: '',  // add when available
  },
  credibility: [
    { name: '[Publication or Conference]', url: '' },
    { name: '[Certification]', url: '' },
    { name: '[Podcast or Media]', url: '' },
  ],
  leadMagnet: {
    title: 'The 5 Pillars of a Christ-Centered Sales Culture',
    description:
      'A practical framework for sales leaders who want to build something that lasts.',
    bullets: [
      'The biblical foundation for ethical selling',
      'How to build a team culture rooted in integrity',
      'Practical tools for coaching that forms character',
      'A framework for accountability that motivates rather than pressures',
      'How to measure success beyond the scoreboard',
    ],
  },
} as const;

export type Theme = typeof theme;
