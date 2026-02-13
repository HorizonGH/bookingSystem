/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        'muted-foreground': "var(--muted-foreground)",
        border: "var(--border)",
        card: "var(--card)",
        accent: "var(--accent)",
        'accent-hover': "var(--accent-hover)",
        primary: {
          50: '#e6fffe',
          100: '#ccfffd',
          200: '#99fffb',
          300: '#66fff9',
          400: '#33fff7',
          500: '#00EAE2',
          600: '#00bbb5',
          700: '#008c88',
          800: '#005d5a',
          900: '#002e2d',
        },
        secondary: {
          50: '#e9f3f7',
          100: '#d3e7ef',
          200: '#a7cfdf',
          300: '#7bb7cf',
          400: '#4f9fbf',
          500: '#4B88A2',
          600: '#3c6d82',
          700: '#2d5261',
          800: '#1e3641',
          900: '#0f1b20',
        },
        dark: {
          DEFAULT: '#252323',
          light: '#404244',
          lighter: '#5a5c5e',
        },
        light: {
          DEFAULT: '#FFF9FB',
          darker: '#f5f0f2',
          darkest: '#ebe6e8',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 2px 6px -4px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(0, 234, 226, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 234, 226, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scaleIn': 'scaleIn 0.3s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
