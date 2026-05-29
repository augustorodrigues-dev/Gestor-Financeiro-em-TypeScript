import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Paletas de cores (aditivas: não substituem as cores padrão do Tailwind) ──
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Semânticas para o domínio financeiro
        income: {
          light: '#d1fae5',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        expense: {
          light: '#fee2e2',
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
        },
      },

      // ── Fontes (Inter como preferência, com fallback gracioso ao stack do sistema) ──
      fontFamily: {
        sans: [
          'Inter', 'ui-sans-serif', 'system-ui', '-apple-system',
          'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"',
          'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"',
          '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"',
        ],
        display: [
          'Lexend', 'Inter', 'ui-sans-serif', 'system-ui',
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif',
        ],
        mono: [
          'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco',
          'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace',
        ],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      // ── Espaçamentos extras ──
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '128': '32rem',
        '144': '36rem',
      },

      borderRadius: {
        'xl2': '1rem',
        '4xl': '2rem',
      },

      // ── Sombras ──
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        soft: '0 2px 15px -3px rgb(0 0 0 / 0.07), 0 10px 20px -2px rgb(0 0 0 / 0.04)',
        glow: '0 0 0 3px rgb(37 99 235 / 0.15)',
        'glow-success': '0 0 20px -2px rgb(16 185 129 / 0.35)',
        'glow-danger': '0 0 20px -2px rgb(239 68 68 / 0.35)',
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },

      // ── Breakpoints adicionais (aditivos) ──
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },

      // ── Gradientes utilitários ──
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-sheen': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ── Animações ──
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in-down': 'fade-in-down 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.35s ease-out',
        'slide-in-left': 'slide-in-left 0.35s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [
    // Plugin inline (via tailwindcss/plugin, já incluso no Tailwind) com
    // componentes e utilitários visuais reutilizáveis — sem dependências extras.
    plugin(function ({ addComponents, addUtilities, theme }) {
      addComponents({
        '.card': {
          backgroundColor: '#ffffff',
          borderRadius: theme('borderRadius.xl'),
          borderWidth: '1px',
          borderColor: theme('colors.neutral.200'),
          boxShadow: theme('boxShadow.card'),
          padding: theme('spacing.6'),
        },
        '.card-interactive': {
          transitionProperty: 'transform, box-shadow',
          transitionDuration: '200ms',
          transitionTimingFunction: theme('transitionTimingFunction.smooth'),
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.card-hover'),
          },
        },
        '.glass': {
          backgroundColor: 'rgb(255 255 255 / 0.7)',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          borderWidth: '1px',
          borderColor: 'rgb(255 255 255 / 0.3)',
        },
      })

      addUtilities({
        '.text-gradient': {
          backgroundImage: theme('backgroundImage.gradient-brand'),
          '-webkit-background-clip': 'text',
          backgroundClip: 'text',
          color: 'transparent',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-shadow-sm': { textShadow: '0 1px 2px rgb(0 0 0 / 0.12)' },
        '.text-shadow': { textShadow: '0 2px 4px rgb(0 0 0 / 0.15)' },
        '.text-shadow-lg': { textShadow: '0 4px 8px rgb(0 0 0 / 0.20)' },
        '.text-shadow-none': { textShadow: 'none' },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme('colors.neutral.300'),
            borderRadius: '9999px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme('colors.neutral.400'),
          },
        },
      })
    }),
  ],
}
