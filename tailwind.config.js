/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: '#f0f7ee',
          100: '#d9e8d4',
          200: '#b3d1ab',
          300: '#85b87a',
          400: '#5c9a4f',
          500: '#3f7d34',
          600: '#2D5A27',
          700: '#244820',
          800: '#1e3a1b',
          900: '#1a3117',
        },
        earth: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#D97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        cream: {
          50: '#fafaf7',
          100: '#f5f5f0',
          200: '#e8e8dc',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
