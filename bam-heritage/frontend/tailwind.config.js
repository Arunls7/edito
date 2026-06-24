/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: '#1C1C1C',
        'noir-dark': '#161616',
        'noir-card': '#222222',
        rouge: '#CC1F1F',
        'rouge-hover': '#E02222',
        gris: 'rgba(255,255,255,0.4)',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '2px', none: '0' },
    },
  },
  plugins: [],
};
