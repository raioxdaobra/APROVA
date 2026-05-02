import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1100px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
          foreground: 'var(--primary-foreground)',
        },
        neutral: {
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          500: 'var(--neutral-500)',
          900: 'var(--neutral-900)',
        },
        success: {
          DEFAULT: 'var(--success)',
          bg: 'var(--success-bg)',
        },
        error: {
          DEFAULT: 'var(--error)',
          bg: 'var(--error-bg)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          bg: 'var(--warning-bg)',
        },
        // Acentos de disciplina (chips finos, nunca blocos grandes)
        discipline: {
          matematica: '#6366F1',
          fisica: '#0891B2',
          quimica: '#15803D',
          biologia: '#DC2626',
          humanas: '#9333EA',
          linguagens: '#DB2777',
        },
        // Aliases semânticos para o tema (usados pelo shadcn)
        background: 'var(--page-bg)',
        foreground: 'var(--text-primary)',
        muted: {
          DEFAULT: 'var(--neutral-100)',
          foreground: 'var(--text-secondary)',
        },
        card: {
          DEFAULT: 'var(--card-bg)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--card-bg)',
          foreground: 'var(--text-primary)',
        },
        border: 'var(--border)',
        input: 'var(--border)',
        ring: 'var(--primary)',
        destructive: {
          DEFAULT: 'var(--error)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--neutral-100)',
          foreground: 'var(--text-primary)',
        },
        accent: {
          DEFAULT: 'var(--neutral-100)',
          foreground: 'var(--text-primary)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
      },
      fontWeight: {
        normal: '400',
        semibold: '600',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.04)',
        sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 12px 32px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        'motion-fast': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'motion-base': 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'motion-fast': '150ms',
        'motion-base': '200ms',
        'motion-slow': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
