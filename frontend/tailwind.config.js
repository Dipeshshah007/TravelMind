/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0E1520", 800: "#141E2C", 700: "#1B283A", 600: "#233248" },
        parchment: { DEFAULT: "#F4EEDE", dim: "#E7DEC7" },
        brass: { DEFAULT: "#C6963B", light: "#DDB05C", dark: "#9A7229" },
        route: { DEFAULT: "#3E8F89", light: "#5FB0A9" },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Space Grotesk'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
