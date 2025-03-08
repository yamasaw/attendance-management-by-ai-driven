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
        // メインカラー
        primary: {
          DEFAULT: "#0078D4", // プライマリブルー
          secondary: "#2B88D8", // セカンダリブルー
        },
        // サブカラー
        gray: {
          light: "#F3F2F1", // ライトグレー
          dark: "#323130", // ダークグレー
        },
        // アクセントカラー
        success: "#107C10", // 成功緑
        warning: "#F2C811", // 警告オレンジ
        error: "#D13438", // エラー赤
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