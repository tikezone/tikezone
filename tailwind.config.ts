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
          200: '#fecdd3',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        cartoon: {
          yellow: '#FFE066',
          orange: '#FF9F43',
          pink: '#FF6B9D',
          purple: '#A55EEA',
          blue: '#45AAF2',
          green: '#26DE81',
          red: '#FC5C65',
          cream: '#FFF9E6',
        },
      },
      boxShadow: {
        'pop': '4px 4px 0px 0px rgba(0,0,0,1)',
        'pop-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'pop-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'pop-xl': '8px 8px 0px 0px rgba(0,0,0,1)',
        'cartoon': '3px 3px 0px 0px rgba(0,0,0,0.9)',
        'cartoon-lg': '5px 5px 0px 0px rgba(0,0,0,0.9)',
        'soft': '0 4px 14px 0 rgba(0,0,0,0.1)',
        'glow': '0 0 20px rgba(244,63,94,0.3)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        wiggle: 'wiggle 0.3s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;