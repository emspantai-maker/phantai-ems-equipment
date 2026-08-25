/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ems: {
          navy: '#0B2545',
          dark: '#081D36',
          blue: '#134074',
          primary: '#1D70B8',
          light: '#EEF4F8',
          accent: '#00A6FB',
          red: '#DC2626',
          redDark: '#B91C1C',
          redLight: '#FEE2E2',
          green: '#16A34A',
          greenLight: '#DCFCE7',
          yellow: '#D97706',
          yellowLight: '#FEF3C7',
          gray: '#64748B',
          grayLight: '#F1F5F9'
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 37, 69, 0.08), 0 2px 6px -2px rgba(11, 37, 69, 0.04)',
        'card': '0 10px 25px -5px rgba(11, 37, 69, 0.1), 0 8px 10px -6px rgba(11, 37, 69, 0.05)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
