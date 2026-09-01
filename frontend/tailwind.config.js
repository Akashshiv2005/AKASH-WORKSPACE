/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        notion: {
          dark: {
            bg: '#191919',
            sidebar: '#202020',
            hover: '#2f2f2f',
            border: '#2e2e2e',
            text: '#e6e6e6',
            muted: '#9b9b9b',
            accent: '#2383e2',
          },
          light: {
            bg: '#ffffff',
            sidebar: '#f7f7f5',
            hover: '#efefee',
            border: '#e9e9e7',
            text: '#37352f',
            muted: '#787774',
            accent: '#2383e2',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
