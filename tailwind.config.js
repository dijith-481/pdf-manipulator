/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./static/**/*.js", "./templates/**/*.html"],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        black: '#000',
        white: '#fff',
        gray: {
          100: '#008080',
          // ...
          900: '#1a202c',
        },
    },
  },
  plugins: [],
}

