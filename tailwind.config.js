/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pokemon-red': '#EE1515',
        'pokemon-blue': '#3B4CCA',
        'pokemon-yellow': '#FFDE00',
        'pokemon-gold': '#B69E31',
      },
      fontFamily: {
        'pokemon': ['"Press Start 2P"', 'cursive'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}


