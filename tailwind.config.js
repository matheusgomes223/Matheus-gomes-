/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Corporate Layout
        sidebar: '#1A1A1A', // Vale Dark Gray (Sidebar)
        background: '#F8F9FA', // Vale Light Gray (Main Content)
        card: '#FFFFFF', // White (Cards)
        
        // Text
        dark: '#333333', // Primary Text
        muted: '#666666', // Secondary Text
        
        // Brand Colors
        primary: '#007E7A', // Vale Green (Action/Success/Entry)
        secondary: '#F1C40F', // Vale Gold (Warning/Alert/Exit)
        
        // Semantics
        success: '#007E7A', // Using Brand Green for success
        warning: '#F1C40F', // Using Brand Gold for warning
        danger: '#D32F2F', // Standard Red for Critical
        info: '#006B9E', // Blue
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 10px rgba(0, 126, 122, 0.2)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [],
}
