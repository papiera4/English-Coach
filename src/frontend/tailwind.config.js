module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'british-navy': '#1a3a52',
        'british-cream': '#f5f1e8',
        'british-gold': '#d4af37',
        'british-maroon': '#8b3a3a',
      },
      fontFamily: {
        'serif': ['Crimson Text', 'Georgia', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
