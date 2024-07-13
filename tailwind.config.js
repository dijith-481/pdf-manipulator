/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./static/**/*.js", "./templates/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        Rubik: ['Noto Sans', 'sans-serif'],
      },
      aspectRatio:{
        '9/16': '9/16',
        '3/4': '3/4',
      },
      colors: {
        transparent: 'transparent',
        black: '#000',
        white: '#fff',
        'edgewater': {
          '50': '#f1f8f5',
          '100': '#deede5',
          '200': '#bddbcd',
          '300': '#93c2af',
          '400': '#65a28c',
          '500': '#448570',
          '600': '#316a58',
          '700': '#285448',
          '800': '#21443a',
          '900': '#1c3831',
          '950': '#0f1f1b',
      },
      
      
    },
  },
  plugins: [],
}
}
