/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // make sure nothing accidentally paints white
      backgroundColor: {
        transparent: 'transparent',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // optional – disable the default white background on <html>
    backgroundColor: true,
  },
};