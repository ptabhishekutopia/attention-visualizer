import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 40px rgba(56, 189, 248, 0.18)',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(circle at top, rgba(14, 165, 233, 0.22), transparent 38%), linear-gradient(180deg, rgba(2, 6, 23, 0.94), rgba(15, 23, 42, 1))',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
