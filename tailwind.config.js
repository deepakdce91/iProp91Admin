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
  },
  plugins: [],
}

