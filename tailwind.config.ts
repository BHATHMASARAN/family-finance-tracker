import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefcf5",
          100: "#d6f7e6",
          200: "#aeeecd",
          300: "#78dfae",
          400: "#42c98c",
          500: "#22b072",
          600: "#158f5c",
          700: "#13724b",
          800: "#135a3d",
          900: "#114a34",
          950: "#062a1e",
        },
        income: "#22b072",
        expense: "#e5484d",
        debt: "#f5a524",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
