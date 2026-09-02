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
        'accent-start': '#22d3ee', // Cyan-400
        'accent-end': '#14b8a6',   // Teal-500
        'accent-hover': '#06b6d4', // Cyan-500
        'title-color': '#f8fafc',
        'paragraph-color': '#cbd5e1',
        'muted-color': '#94a3b8',
        'card-bg': '#1e293b',
        'elevated-bg': '#334155',
        'border-color': '#334155',
        'bg-dark': '#0f172a',
      },
      fontFamily: {
        heading: ['"DM Serif Display"', 'serif'],
        sans: ['"Sora"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
