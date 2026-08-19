import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14181F',
        paper: '#F6F5F2',
        accent: {
          DEFAULT: '#E2711D',
          dark: '#B8560F',
          light: '#F6C89F',
        },
        line: '#DEDCD6',
        success: '#2F6F4E',
        danger: '#B23B3B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
};

export default config;
