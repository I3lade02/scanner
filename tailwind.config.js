/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        parchment: '#f6f0e6',
        sand: '#e7dcc8',
        ivory: '#fbfaf6',
        obsidian: '#10130f',
        ember: '#dc6a40',
        brass: '#b98f53',
        moss: '#2e6f5e',
        pine: '#15231b',
        slate: '#66716b',
        fog: '#a7b4ac',
        night: '#151915',
        ink: '#20261f',
      },
      boxShadow: {
        card: '0px 18px 36px rgba(20, 24, 18, 0.14)',
      },
      fontFamily: {
        body: ['DarkerGrotesque_500Medium'],
        semibold: ['DarkerGrotesque_700Bold'],
        display: ['DarkerGrotesque_800ExtraBold'],
      },
      letterSpacing: {
        tightest: '-0.05em',
      },
    },
  },
};
