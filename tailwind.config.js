/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0A09',         // obsidian warm dark
          surface: '#141311',    // warm charcoal card surface
          input: '#1C1A17',      // darker input background
          border: '#2A2824',     // refined subtle border
          primary: '#F5F3EF',    // warm bone white text
          secondary: '#9E9B95',  // stone grey muted text
          gold: '#D4AF37',       // warm gold / metallic accent
          goldHover: '#E3C165',  // bright warm gold hover state
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 12px 32px -4px rgba(0, 0, 0, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.4)',
        goldGlow: '0 0 20px rgba(212, 175, 55, 0.15)',
      },
    },
  },
  plugins: [],
};
