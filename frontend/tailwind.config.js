/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#FDF3F2',
          100: '#FBE4E3',
          200: '#F7C4C2',
          300: '#F29C99',
          400: '#EB645D',
          500: '#ca2a22',
          600: '#B5251E',
          700: '#941E18',
          800: '#7A1A14',
          900: '#661813',
          1000: '#1A1A1A',
        },
        surface: {
          DEFAULT: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(202, 42, 34, 0.4)',
      }
    },
  },
  plugins: [],
}
