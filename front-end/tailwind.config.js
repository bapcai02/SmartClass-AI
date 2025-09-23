/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '1rem',
      },
      colors: {
        brand: {
          blue: '#2563eb',
          green: '#22c55e',
        },
      },
    },
  },
};

