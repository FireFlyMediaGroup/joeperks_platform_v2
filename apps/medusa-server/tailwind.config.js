/**
 * Minimal Tailwind config for Medusa admin build
 */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.medusa/client/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}

