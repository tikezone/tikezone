import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/services/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          900: '#881337',
        },
      },
      boxShadow: {
        'pop': '4px 4px 0px 0px rgba(0,0,0,1)',
        'pop-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'pop-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;