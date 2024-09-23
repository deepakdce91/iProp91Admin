/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          500: '#FFC107',
          700: '#FFA07A',
        },
      },
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      scaleUp: {
        '0%': { transform: 'scale(0)' },
        '100%': { transform: 'scale(1)' },
      },
     
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in forwards',
      'scale-up': 'scaleUp 0.5s ease-out forwards',

    },
  },
  plugins: [],
}

