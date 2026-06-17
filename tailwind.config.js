/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 24px rgba(20, 241, 214, 0.18)',
        pink: '0 0 22px rgba(255, 58, 166, 0.17)',
      },
    },
  },
  plugins: [],
};
