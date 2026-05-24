/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2D3436',
        accent: '#FF6B6B',
        'accent-light': '#FF8E8E',
        'sky-start': '#E8F4FD',
        'sky-end': '#D4EDDA',
        'pink-soft': '#FFD1DC',
        'blue-soft': '#C9E4FF',
        'glass-white': 'rgba(255, 255, 255, 0.25)',
        'glass-border': 'rgba(255, 255, 255, 0.18)',
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
};
