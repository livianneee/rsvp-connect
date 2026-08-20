/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens pulled from the Figma node (85:920)
        navy: '#25406d',       // page background / brand deep blue
        gold: '#d9b682',       // "Yes" button, section labels, accents
        'gold-soft': '#fce1b8',// highlighted values (date, time, venue name)
        ink: '#242424',        // "No" button, dark badges
      },
      fontFamily: {
        // Brand fonts. Montserrat + Poppins are exact; "script" stands in for
        // Linotype Feltpen (proprietary) using a marker-style web font.
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'Segoe Script', 'Bradley Hand', 'cursive'],
      },
      maxWidth: {
        content: '800px',
        wide: '1200px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
      },
    },
  },
  plugins: [],
}
