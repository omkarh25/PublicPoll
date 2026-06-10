/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        civic: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        neon: {
          cyan: '#00ffff',
          magenta: '#ff00ff',
          lime: '#39ff14',
          yellow: '#fff01f',
          orange: '#ff5f1f',
          pink: '#ff00aa',
        },
        dark: {
          bg: '#0a0a0a',
          card: '#111111',
          border: '#222222',
          surface: '#1a1a1a',
        },
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'glow-cyan': 'glow-cyan 1.5s ease-in-out infinite alternate',
        'glow-magenta': 'glow-magenta 1.5s ease-in-out infinite alternate',
        'glow-lime': 'glow-lime 1.5s ease-in-out infinite alternate',
        'color-cycle': 'color-cycle 4s linear infinite',
      },
      keyframes: {
        'neon-pulse': {
          '0%': { opacity: '0.6', filter: 'brightness(1)' },
          '100%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'glow-cyan': {
          '0%': { boxShadow: '0 0 20px rgba(0,255,255,0.3), 0 0 40px rgba(0,255,255,0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(0,255,255,0.8), 0 0 80px rgba(0,255,255,0.4), 0 0 120px rgba(0,255,255,0.2)' },
        },
        'glow-magenta': {
          '0%': { boxShadow: '0 0 20px rgba(255,0,255,0.3), 0 0 40px rgba(255,0,255,0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(255,0,255,0.8), 0 0 80px rgba(255,0,255,0.4), 0 0 120px rgba(255,0,255,0.2)' },
        },
        'glow-lime': {
          '0%': { boxShadow: '0 0 20px rgba(57,255,20,0.3), 0 0 40px rgba(57,255,20,0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(57,255,20,0.8), 0 0 80px rgba(57,255,20,0.4), 0 0 120px rgba(57,255,20,0.2)' },
        },
        'color-cycle': {
          '0%': { color: '#00ffff', textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff' },
          '33%': { color: '#ff00ff', textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff' },
          '66%': { color: '#39ff14', textShadow: '0 0 20px #39ff14, 0 0 40px #39ff14' },
          '100%': { color: '#00ffff', textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff' },
        },
      },
    },
  },
  plugins: [],
}
