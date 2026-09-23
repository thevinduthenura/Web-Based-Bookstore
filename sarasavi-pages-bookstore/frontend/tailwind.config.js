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
        editorial: {
          bg: '#fbfbf9',
          card: '#ffffff',
          border: '#e8e8e2',
          ink: '#0d0f12',
          muted: '#666b75',
          faint: '#989ea9',
          obsidian: '#0d110e',
          obsidianLight: '#161d18',
          moss: '#1d3326',
          mossLight: '#2a4a37',
        },
        forest: {
          50:  '#edfaf2',
          100: '#d2f5e2',
          200: '#a8eac7',
          300: '#6dd8a7',
          400: '#33be82',
          500: '#10a165',  // primary forest green
          600: '#068052',
          700: '#066641',
          800: '#075133',
          900: '#064429',
          950: '#022317',
          deep: '#0a1a10',
          mid:  '#122a1b',
          leaf: '#2d6a45',
        },
        ink: {
          DEFAULT: '#f8f9fb',  // primary text
          muted:   '#9ba3b5',  // secondary text
          faint:   '#5c6275',  // very muted text
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif:   ['Georgia', 'Times New Roman', 'serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      boxShadow: {
        'glow':        '0 0 20px rgba(16, 161, 101, 0.25)',
        'glow-lg':     '0 0 40px rgba(16, 161, 101, 0.35)',
        'card':        '0 4px 24px rgba(0,0,0,0.07)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.12)',
        'ios-glass':   '0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.28)',
        'ios-card':    '0 4px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
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
