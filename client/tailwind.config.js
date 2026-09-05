/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 1Fi brand — warm orange on deep ink
        brand: {
          50: '#FFF3EC',
          100: '#FFE4D3',
          200: '#FFC9A8',
          300: '#FFA572',
          400: '#FF8A4D',
          500: '#FF6B2C',
          600: '#F05510',
          700: '#C7430C',
          800: '#9E360D',
          900: '#7E2D0E',
        },
        ink: {
          50: '#F6F7F9',
          100: '#ECEEF2',
          200: '#D6DAE2',
          500: '#4A5264',
          700: '#2A3140',
          800: '#161C28',
          900: '#0B0F19',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 15, 25, 0.04), 0 4px 12px rgba(11, 15, 25, 0.06)',
      },
    },
  },
  plugins: [],
};