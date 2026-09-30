/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          lime: '#39FF14',
          pink: '#FF007F',
          yellow: '#FFFF00',
          blue: '#00F0FF',
          magenta: '#FF00FF',
          purple: '#9D00FF',
          orange: '#FF5F00',
          red: '#FF0033',
          vomit: '#808000',
          screamingCyan: '#0DFFFF',
        }
      },
      fontFamily: {
        comic: ['"Comic Sans MS"', '"Comic Neue"', 'cursive', 'sans-serif'],
        papyrus: ['Papyrus', '"Herculanum"', 'fantasy'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
        impact: ['Impact', 'Haettenschweiler', 'Arial Black', 'sans-serif'],
      },
      animation: {
        'strobe-bg': 'strobeBg 3s infinite alternate',
        'nauseating-hue': 'hueRotate 6s linear infinite',
        'violent-shake': 'shake 0.15s infinite',
        'mild-jitter': 'jitter 0.3s infinite',
        'upside-down-spin': 'upsideDown 4s ease-in-out infinite alternate',
        'marquee-fast': 'marqueeFast 8s linear infinite',
        'marquee-reverse': 'marqueeReverse 10s linear infinite',
        'flashing-border': 'borderFlash 0.5s infinite',
        'disco-text': 'discoText 1.5s infinite',
      },
      keyframes: {
        strobeBg: {
          '0%': { backgroundColor: '#39FF14' },
          '25%': { backgroundColor: '#FF007F' },
          '50%': { backgroundColor: '#FFFF00' },
          '75%': { backgroundColor: '#00F0FF' },
          '100%': { backgroundColor: '#39FF14' },
        },
        hueRotate: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(180deg) saturate(300%)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '20%': { transform: 'translate(-5px, 5px) rotate(-3deg)' },
          '40%': { transform: 'translate(6px, -4px) rotate(4deg)' },
          '60%': { transform: 'translate(-4px, -6px) rotate(-2deg)' },
          '80%': { transform: 'translate(5px, 4px) rotate(3deg)' },
        },
        jitter: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(2px, -3px) skewX(2deg)' },
          '50%': { transform: 'translate(-2px, 3px) skewY(-2deg)' },
          '75%': { transform: 'translate(3px, 1px) scale(1.02)' },
        },
        upsideDown: {
          '0%, 40%': { transform: 'rotate(0deg)' },
          '50%, 90%': { transform: 'rotate(180deg) scale(0.95)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        marqueeFast: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marqueeReverse: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        borderFlash: {
          '0%, 100%': { borderColor: '#FF007F' },
          '50%': { borderColor: '#FFFF00' },
        },
        discoText: {
          '0%': { color: '#FF007F' },
          '25%': { color: '#FFFF00' },
          '50%': { color: '#00F0FF' },
          '75%': { color: '#39FF14' },
          '100%': { color: '#FF007F' },
        },
      }
    },
  },
  plugins: [],
}
