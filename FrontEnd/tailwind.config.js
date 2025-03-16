/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Broader path to cover all subdirectories in src
  presets: [require("nativewind/preset")],
  darkMode: "class", // Keep dark mode as 'class'
  theme: {
    extend: {},
  },
  plugins: [],
};