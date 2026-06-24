/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        noir: '#1C1C1C',
        'noir-dark': '#161616',
        'noir-card': '#222222',
        rouge: '#CC1F1F',
        'rouge-hover': '#E02222',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
