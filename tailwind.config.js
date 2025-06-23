/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["NotoSans", "sans-serif"],
      },
      borderRadius: {
        primary: "12px",
      },
    },
  },
  plugins: [],
};