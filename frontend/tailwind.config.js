/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040814',
          900: '#080F22',
          850: '#0C1630',
          800: '#111F3E',
          700: '#1E2F54',
          600: '#2E4374',
        },
        gold: {
          50: '#FDFBF7',
          100: '#FAF4E8',
          200: '#F4E6C8',
          300: '#EBD4A1',
          400: '#D9B870',
          500: '#C5A059', // Regal Champagne Gold
          600: '#A68038',
          700: '#826123',
          800: '#5F4517',
          900: '#3D2B0C',
        },
        saffron: {
          500: '#FF8800',
          600: '#E67A00',
        },
        rupeeGreen: {
          500: '#10B981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'elevated': '0 12px 36px -4px rgba(0, 0, 0, 0.55)',
        'gold-glow': '0 4px 20px -2px rgba(197, 160, 89, 0.25)',
      }
    },
  },
  plugins: [],
}
