/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        navy: { 950: '#050918', 900: '#080e1f', 800: '#0a1428', 700: '#0d1a35', 600: '#112244' },
        blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        purple: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
        cyan: { 400: '#22d3ee', 500: '#06b6d4' },
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.4s ease both',
        'fade-in': 'fadeIn 0.3s ease both',
        'ping-slow': 'ping-slow 2s ease-out infinite',
      },
      boxShadow: {
        'glow-blue': '0 0 30px rgba(37,99,235,0.3)',
        'glow-purple': '0 0 30px rgba(124,58,237,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      screens: { '3xl': '1920px' },
    },
  },
  plugins: [],
}
