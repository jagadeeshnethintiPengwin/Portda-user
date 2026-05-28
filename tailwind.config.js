/**
 * PORTDA Tailwind theme — tokens ported verbatim from
 * Portda-Screens-ui/assets/styles.css :root and utility classes.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        'primary-dark': '#1E40AF',
        'primary-light': '#EEF3FB',
        accent: '#C19A4A',
        'accent-dark': '#9C7A2F',
        'accent-light': '#FAF4E6',
        bg: '#FAFAF7',
        'bg-2': '#F4F1EB',
        card: '#FFFFFF',
        'page-bg': '#ECE9E2',
        ink: '#0A1929',
        'ink-2': '#475569',
        'ink-3': '#94A3B8',
        border: '#E4E1D9',
        'border-2': '#F1EEE7',
        success: '#059669',
        'success-light': '#ECFDF5',
        warning: '#D97706',
        'warning-light': '#FFFBEB',
        danger: '#DC2626',
        'danger-light': '#FEF2F2',
        info: '#1E40AF',
        'tab-idle': '#9CA3AF',
        'search-bg': '#F3F4F8',
      },
      fontFamily: {
        // Maps to bundled Inter static weights (assets/fonts).
        sans: ['Inter_400Regular', 'sans-serif'],
        regular: ['Inter_400Regular', 'sans-serif'],
        medium: ['Inter_500Medium', 'sans-serif'],
        semibold: ['Inter_600SemiBold', 'sans-serif'],
        bold: ['Inter_700Bold', 'sans-serif'],
        extrabold: ['Inter_800ExtraBold', 'sans-serif'],
        black: ['Inter_900Black', 'sans-serif'],
      },
      fontSize: {
        // mirrors .txt-* utility classes
        xs: ['10px', '14px'],
        sm: ['11px', '15px'],
        base: ['12px', '17px'],
        md: ['13px', '19px'],
        lg: ['15px', '21px'],
        xl: ['18px', '24px'],
        '2xl': ['22px', '28px'],
        '3xl': ['28px', '34px'],
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '12px',
        xl: '14px',
        '2xl': '18px',
        full: '999px',
      },
    },
  },
  plugins: [],
};
