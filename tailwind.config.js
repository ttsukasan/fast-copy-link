/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html', './js/**/*.{html,ts,js}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["cupcake"],
  },
}
