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
        healium: {
          deepForest: '#34451D', // Main dark backgrounds, text
          olive:      '#596B32', // Primary brand color
          moss:       '#7F9148', // Cards, accents, gradients
          sage:       '#AAB58A', // Secondary backgrounds
          lightSage:  '#DCE3D2', // Soft sections / highlights
          paleGreen:  '#EBF0E4', // Fresh light accents
          cream:      '#F8F9F5', // Soft, eye-pleasing neutral light background
          warmWhite:  '#FFFFFF', // Crisp clean white for cards and surfaces
          charcoal:   '#20231B', // Primary typography
          mutedGray:  '#707365', // Secondary text
          lime:       '#B7D85A', // Buttons, indicators, highlights
        },
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
          DEFAULT: '#20231B',  // charcoal
          card:    '#34451D',  // deep forest
          border:  '#596B32',  // olive border
          muted:   '#707365',  // muted gray
        },
        editorial: {
          bg: '#F8F9F5',       // Soothing light background
          card: '#FFFFFF',     // Crisp white cards
          border: '#E2E7D8',   // Clear distinction border
          ink: '#20231B',
          muted: '#707365',
          faint: '#8E967D',
          obsidian: '#20231B',
          obsidianLight: '#34451D',
          moss: '#596B32',
          mossLight: '#7F9148',
        },
        forest: {
          50:  '#F8F9F5',
          100: '#EBF0E4',
          200: '#DCE3D2',
          300: '#AAB58A',
          400: '#7F9148',
          500: '#596B32',  // primary olive
          600: '#475628',
          700: '#34451D',  // deep forest
          800: '#283616',
          900: '#20231B',  // charcoal
          950: '#141811',
          deep: '#34451D',
          mid:  '#596B32',
          leaf: '#7F9148',
        },
        ink: {
          DEFAULT: '#20231B',  // primary text
          muted:   '#707365',  // secondary text
          faint:   '#8E967D',  // very muted text
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      fontFamily: {
        sans:    ['var(--font-manrope)', 'Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-sora)', 'Sora', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        reina:   ['Reina Neue', 'Georgia', 'serif'],
        serif:   ['Reina Neue', 'Georgia', 'serif'],
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
