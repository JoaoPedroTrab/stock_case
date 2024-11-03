/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', 
  ],
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 7s ease-in-out infinite'
      },
      keyframes: {
        pulse: {
          '0%': { opacity: '1' },
          '50%': { opacity: '.5' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
