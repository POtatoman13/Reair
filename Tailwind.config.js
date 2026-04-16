/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mappatura colori ufficiali ReAir per uso professionale
        reair: {
          blue: "#005A8C",
          light: "#8EBCD6",
          orange: "#f97316",
          dark: "#0f172a"
        }
      },
      fontFamily: {
        // Utilizziamo un font sans-serif moderno e pulito
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
