/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        candy: {
          pink: '#FF4081',
          rose: '#F50057',
          gold: '#FFD700',
          amber: '#FFA000',
          mint: '#00E676',
          teal: '#00BFA5',
          cyan: '#00E5FF',
          purple: '#AA00FF',
          grape: '#7C4DFF',
          darkBg: '#13111C',
          boardWood: '#2B1E1A',
          boardBorder: '#5D4037',
          cushion: '#3E2723',
          pocket: '#0A080C',
        }
      },
      boxShadow: {
        'candy': '0 6px 0 0 rgba(0, 0, 0, 0.3)',
        'candy-sm': '0 3px 0 0 rgba(0, 0, 0, 0.25)',
        'candy-lg': '0 8px 0 0 rgba(0, 0, 0, 0.35)',
        'glow-pink': '0 0 20px 4px rgba(255, 64, 129, 0.6)',
        'glow-gold': '0 0 25px 6px rgba(255, 215, 0, 0.7)',
        'glow-cyan': '0 0 20px 4px rgba(0, 229, 255, 0.6)',
      },
      animation: {
        'pop-in': 'popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'float-up': 'floatUp 0.8s ease-out forwards',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '1' },
          '50%': { transform: 'translateY(-30px) scale(1.15)', opacity: '1' },
          '100%': { transform: 'translateY(-60px) scale(1)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 18px rgba(255, 215, 0, 0.9))' },
        }
      }
    },
  },
  plugins: [],
}
