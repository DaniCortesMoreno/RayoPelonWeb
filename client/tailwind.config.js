/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rayo: {
          bone: '#DADDDC',
          boneLight: '#F7F9F8',
          gold: '#C5A059',
          goldLight: '#E5C985',
          goldDark: '#8F6E2C',
          goldAccent: '#A67406',
          goldMuted: 'rgba(197, 160, 89, 0.15)',
          navy: '#0E0A2F',
          navyPitch: '#070518',
          navyCard: '#161244',
          navyElevated: '#1E1B3F',
          navyBorder: 'rgba(255, 255, 255, 0.08)',
          burgundy: '#78080A',
          burgundyLight: '#93000A',
          burgundyDark: '#4A080D',
          carbon: '#07070F'
        }
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        crest: ['Cinzel', 'serif']
      },
      boxShadow: {
        'gold-glow': '0 0 24px -4px rgba(166, 116, 6, 0.28), inset 0 1px 0 0 rgba(229, 184, 66, 0.4)',
        'burgundy-glow': '0 8px 32px 0 rgba(120, 8, 10, 0.45)',
      }
    },
  },
  plugins: [],
}
