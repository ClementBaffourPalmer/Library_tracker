/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./templates/**/*.html",
    "./static/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        accent: "#3B82F6"
      }
    }
  },
  plugins: []
};
