/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B1714",
          soft: "#3A332C",
        },
        paper: "#FAF6EF",
        brass: {
          DEFAULT: "#B8863B",
          dark: "#8F6526",
          light: "#D9B172",
        },
        clay: {
          DEFAULT: "#A1402D",
          dark: "#7C2F20",
        },
        line: "#E4DBC8",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "barber-stripe":
          "repeating-linear-gradient(45deg, #A1402D 0, #A1402D 12px, #FAF6EF 12px, #FAF6EF 24px, #1B1714 24px, #1B1714 36px)",
      },
    },
  },
  plugins: [],
};
