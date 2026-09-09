/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fef7ee',
          100: '#fdecd3',
          200: '#fad5a5',
          300: '#f7b86d',
          400: '#f39032',
          500: '#f0720f', // primary brand orange
          600: '#e15a08',
          700: '#ba4209',
          800: '#94340f',
          900: '#782d0f',
          950: '#411405',
        },
        surface: {
          DEFAULT: '#0f1117',  // deep dark background
          card:    '#1a1d27',  // card/panel surface
          border:  '#2a2d3a',  // subtle borders
          muted:   '#3a3d4a',  // muted elements
        },
        ink: {
          DEFAULT: '#f8f9fb',  // primary text
          muted:   '#9ba3b5',  // secondary text
          faint:   '#5c6275',  // very muted text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow':      '0 0 20px rgba(240, 114, 15, 0.2)',
        'glow-lg':   '0 0 40px rgba(240, 114, 15, 0.3)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #f0720f 0%, #e15a08 100%)',
        'gradient-surface': 'linear-gradient(180deg, #1a1d27 0%, #0f1117 100%)',
        'gradient-card':    'linear-gradient(145deg, rgba(26,29,39,0.9) 0%, rgba(15,17,23,0.95) 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(240,114,15,0.2)' },
          '50%':      { boxShadow: '0 0 30px rgba(240,114,15,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
