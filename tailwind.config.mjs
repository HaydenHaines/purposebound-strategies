// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        deep:     'var(--color-deep)',
        rich:     'var(--color-rich)',
        accent:   'var(--color-accent)',
        cream:    'var(--color-cream)',
        burgundy: 'var(--color-burgundy)',
        muted:    'var(--color-muted)',
        'pb-text': 'var(--color-text)',
        // Note: 'text' is reserved by Tailwind so body text color uses 'pb-text'
        // Use: text-pb-text, bg-cream, text-accent, etc.
      },
      fontFamily: {
        heading: ['Georgia', '"Times New Roman"', 'serif'],
        body:    ['Georgia', '"Times New Roman"', 'serif'],
      },
      letterSpacing: {
        widest: '0.2em',
      },
    },
  },
  plugins: [],
};
