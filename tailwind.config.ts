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
      },
      boxShadow: {
        'pop': '4px 4px 0px 0px rgba(0,0,0,1)',
        'pop-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'pop-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'pop-xl': '8px 8px 0px 0px rgba(0,0,0,1)',
        'glow': '0 0 20px rgba(244, 63, 94, 0.4)',
        'glow-lg': '0 0 40px rgba(244, 63, 94, 0.5)',
        'inner-glow': 'inset 0 2px 20px rgba(255,255,255,0.1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse_glow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slide_up: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slide_in_left: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scale_in: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounce_subtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        rotate_slow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        gradient_shift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        float: 'float 3s ease-in-out infinite',
        pulse_glow: 'pulse_glow 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        slide_up: 'slide_up 0.6s ease-out forwards',
        slide_in_left: 'slide_in_left 0.6s ease-out forwards',
        scale_in: 'scale_in 0.4s ease-out forwards',
        bounce_subtle: 'bounce_subtle 2s ease-in-out infinite',
        rotate_slow: 'rotate_slow 20s linear infinite',
        gradient_shift: 'gradient_shift 8s ease infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};

export default config;
