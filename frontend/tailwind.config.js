/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', '"Segoe UI Variable"', '"Segoe UI"', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50: '#effcf9', 100: '#c8f6ec', 200: '#92ecdb', 300: '#55dac6', 400: '#27c1ae', 500: '#10a595', 600: '#0b8478', 700: '#0d6a62', 800: '#0f544f', 900: '#10463f' },
        ink: { 950: '#070d1a', 900: '#0b1220', 850: '#0f172a', 800: '#131c31', 700: '#1c2740' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 4px 16px rgba(15,23,42,.06)',
        glow: '0 0 0 4px rgba(16,165,149,.18)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        'slide-in': { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        dots: { '0%,80%,100%': { opacity: 0.2 }, '40%': { opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in .35s ease-out both',
        'slide-in': 'slide-in .3s ease-out both',
        dots: 'dots 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
