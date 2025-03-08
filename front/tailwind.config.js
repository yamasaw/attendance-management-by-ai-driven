/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0078D4",
        "primary-secondary": "#2B88D8",
        success: "#107C10",
        warning: "#F2C811",
        error: "#D13438",
      },
      fontFamily: {
        sans: ["'Segoe UI'", "'Noto Sans JP'", "sans-serif"],
      },
      fontSize: {
        headline: ["28px", { lineHeight: "1.2", fontWeight: "300" }],
        subhead: ["20px", { lineHeight: "1.4", fontWeight: "400" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      }
    },
  },
  plugins: [],
} 