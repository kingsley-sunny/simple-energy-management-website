/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js,ejs}"],
  darkMode: "selector",
  theme: {
    extend: {
      backgroundImage: {
        "banner-image": "url('/imgs/seminars-training-header.jpg')",
      },
      colors: {
        primary: "rgb(22 163 74 / var(--tw-bg-opacity))",
      },
    },
  },
  plugins: [],
};
