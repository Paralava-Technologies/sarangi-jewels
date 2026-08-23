import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--oxblood)',
          'primary-dark': 'var(--burgundy-dark)',
          accent: 'var(--champagne)',
          'accent-light': 'var(--gold-light)',
        },
        cream: {
          DEFAULT: 'var(--cream)',
          deep: 'var(--bone)',
          darker: 'var(--stone)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
      },
      fontFamily: {
        sans:        ['"Jost"', 'sans-serif'],
        display:     ['"Cormorant Garamond"', 'serif'],
        serif:       ['"Marcellus"', 'serif'],
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
