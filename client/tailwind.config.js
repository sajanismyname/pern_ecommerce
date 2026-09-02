/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F7FB",
        surface: "#FFFFFF",
        ink: "#12172B",
        muted: "#6B7280",
        border: "#E2E4EC",
        primary: {
          DEFAULT: "#223A6B",
          dark: "#182A4E",
          light: "#3A548C",
        },
        accent: {
          DEFAULT: "#D9A441",
          dark: "#B9862C",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
