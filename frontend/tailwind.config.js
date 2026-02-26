/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          0: '#0A0A0F',
          1: '#111118',
          2: '#18181F',
          3: '#1F1F28',
          4: '#26262F',
        },
        accent: {
          DEFAULT: '#7C6FFF',
          light: '#A89FFF',
          dark: '#5A4FDB',
          glow: 'rgba(124, 111, 255, 0.2)',
        },
        emerald: {
          glow: 'rgba(52, 211, 153, 0.2)',
        },
        amber: {
          glow: 'rgba(251, 191, 36, 0.2)',
        },
        rose: {
          glow: 'rgba(251, 113, 133, 0.2)',
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 111, 255, 0.3)',
        'glow-sm': '0 0 10px rgba(124, 111, 255, 0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
