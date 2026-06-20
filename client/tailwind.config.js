/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#172026",
        panel: "#ffffff",
        mist: "#f4f7f8",
        line: "#dce4e8",
        aqua: "#1b9aaa",
        leaf: "#1f9d55",
        amberline: "#d99b17",
        danger: "#d34a3a"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 32, 38, 0.08)"
      }
    }
  },
  plugins: []
};
