/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightBg: "#F8FAFC",
        lightCard: "#FFFFFF",
        accent: "#6366F1",
      }
    },
  },
  plugins: [],
}
