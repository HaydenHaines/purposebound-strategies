// theme.config.ts
// NOTE: CSS custom properties in src/styles/global.css must stay in sync with brand.colors.
// If you change a color here, update global.css to match.

export const theme = {
  site: {
    name: 'PurposeBound Strategies',
    tagline: 'Equipping Leaders for Marketplace Ministry.',
    description:
      'Corporate ministry and Kingdom-focused coaching for faith-driven leaders committed to bringing the Kingdom into the marketplace.',
    url: 'https://purposeboundstrategies.com', // DEBT: update when domain is confirmed
  },
  founder: {
    name: 'Tory Bryant',
    title: 'Founder & Owner, PurposeBound Strategies',
    photo: '/images/founder.jpg',
    email: 'hello@purposeboundstrategies.com', // DEBT: update with real email
  },
  brand: {
    logo: '/logo.png',
    // Palette: logo-aligned — deep navy + sphere blue + gold accent.
    // Gold is used ONCE per section as the moment the light catches. Not a pattern, a highlight.
    colors: {
      deep:     '#132240',   // nav, footer, darkest backgrounds
      rich:     '#1b3560',   // hero, dark sections
      accent:   '#d09b2a',   // gold — CTAs, labels, the light
      cream:    '#f7f5f0',   // light backgrounds, body sections
      link:     '#2573b6',   // logo sphere blue — section labels, links, borders on cream sections
      muted:    '#6a96b8',   // body text on dark backgrounds
      text:     '#132240',   // body text on light backgrounds
    },
    fonts: {
      heading: ['Georgia', '"Times New Roman"', 'serif'],
      body: ['Georgia', '"Times New Roman"', 'serif'],
      display: ['Oswald', 'Georgia', 'serif'],
    },
  },
  metrics: [
    { value: '25+', label: 'Years of Experience' },
    { value: '6',   label: 'Million-Dollar Leaders Developed' },
    { value: '34',  label: 'Leaders Led on Mission Trips' },
  ],
  benefits: [
    { text: 'Shepherd Hearts, Not Just Systems' },
    { text: 'Cultivate Spiritual Health' },
    { text: 'Tend The Souls In Your Organization' },
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
  credibilityLabel: 'Credentials & Recognition',
  credibility: [
    { name: '2024 Facilis Cares Award', url: '' },
    { name: '$20–25M Revenue Oversight', url: '' },
    { name: 'Domestic & International Mission Leadership', url: '' },
    { name: 'Ministry Integration & Operational Leadership', url: '' },
    { name: '2 TAPPS State Championships', url: '' },
    { name: 'M.S. Leadership & Professional Development', url: '' },
  ],
  leadMagnet: {
    title: 'The 5 Pillars of a Christ-Centered Sales Culture',
    description:
      'A practical framework for faith-driven leaders who want to build something that lasts.',
    bullets: [
      'The biblical foundation for ethical selling',
      'How to build a team culture rooted in integrity',
      'Practical tools for coaching that forms character',
      'A framework for accountability that motivates rather than pressures',
      'How to measure success beyond the scoreboard',
    ],
  },
  howItWorks: {
    steps: [
      {
        title: "Let's Talk",
        body: "A candid conversation about where your organization is, where you sense it's called to go, and whether Tory is the right fit for that journey. No pitch — just discernment.",
      },
      {
        title: 'Walk Together',
        body: "An engagement shaped around your people, your culture, and the specific work God seems to be calling your organization into.",
      },
      {
        title: 'Stop Building Alone',
        body: "Ongoing presence, accountability, and equipping — because the most meaningful work isn't meant to be done in isolation.",
      },
    ],
  },
  contact: {
    faq: [
      {
        q: 'What happens on the call?',
        a: "We talk honestly about where your organization is, what you're sensing God may be calling it toward, and whether a coaching relationship makes sense. There's no pitch — just a real conversation.",
      },
      {
        q: 'How long is the call?',
        a: "30 minutes. That's enough to know if it's worth going deeper.",
      },
      {
        q: 'Who is this for?',
        a: "Faith-driven business owners, executives, and leaders who sense their organization has a higher calling — and want a trusted guide to help them build it.",
      },
      {
        q: 'What happens after the call?',
        a: "If we're a fit, I'll send a proposal for a coaching engagement. If we're not, I'll tell you honestly — and point you toward someone who might be better suited.",
      },
    ],
  },
} as const;

export type Theme = typeof theme;
