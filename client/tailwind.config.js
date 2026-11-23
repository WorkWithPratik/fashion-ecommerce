export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a1a1a', light: '#333' },
        accent: { DEFAULT: '#c8a97e', dark: '#b8935a' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: []
}
