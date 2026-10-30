// Paletas do Tailwind apontando para os tokens do Revvo Design System
// (src/cedente/ds/tokens), para as telas antigas seguirem a mesma identidade.
// shortcut: var() não aceita modificador de opacidade (bg-blue-500/50); se precisar, trocar por valores hex.
const escala = (tons) => Object.fromEntries(tons.map(([chave, token]) => [chave, `var(--${token})`]));

const gray = escala([
  [50, 'light-10'], [100, 'light-20'], [200, 'light-30'], [300, 'light-40'], [400, 'dark-20'],
  [500, 'dark-40'], [600, 'dark-60'], [700, 'dark-80'], [800, 'dark-90'], [900, 'dark-100'],
]);

const blue = escala([
  [50, 'soft-blue-100'], [100, 'soft-blue-100'], [200, 'soft-blue-200'], [300, 'soft-blue-300'], [400, 'soft-blue-400'],
  [500, 'soft-blue-500'], [600, 'revvo-blue-500'], [700, 'revvo-blue-600'], [800, 'revvo-blue-700'], [900, 'revvo-blue-700'],
]);

const green = escala([
  [50, 'revvo-green-100'], [100, 'revvo-green-100'], [200, 'revvo-green-200'], [300, 'revvo-green-300'], [400, 'revvo-green-400'],
  [500, 'revvo-green-500'], [600, 'revvo-green-600'], [700, 'revvo-green-700'], [800, 'revvo-green-700'], [900, 'revvo-green-700'],
]);

// O DS só tem 3 tons de alerta e de erro: fundo (100), base (500) e texto (700).
const semantica = (nome) => escala([
  [50, `${nome}-100`], [100, `${nome}-100`], [200, `${nome}-100`], [300, `${nome}-500`], [400, `${nome}-500`],
  [500, `${nome}-500`], [600, `${nome}-700`], [700, `${nome}-700`], [800, `${nome}-700`], [900, `${nome}-700`],
]);

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray,
        blue,
        indigo: blue,
        purple: blue,
        green,
        emerald: green,
        red: semantica('danger'),
        yellow: semantica('warning'),
        orange: semantica('warning'),
      },
      fontFamily: {
        sans: ['Onest', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
