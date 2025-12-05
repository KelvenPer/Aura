/** @type {import('tailwindcss').Config} */
module.exports = {
  // Indica onde estão os arquivos React Native para aplicar estilos
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta "Dark Mode Premium"
        void: {
          950: "#0F172A",
          900: "#1E293B",
          800: "#334155",
        },
        primary: {
          500: "#6366F1", // Indigo
        },
        accent: {
          500: "#10B981", // Emerald
        },
      },
    },
  },
  plugins: [],
};
