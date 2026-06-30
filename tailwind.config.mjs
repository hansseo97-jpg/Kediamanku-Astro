/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#303A42",
        ivory: "#F7F3EC",
        gold: "#C7A56A",
        greige: "#D8D2C8",
      },
      fontFamily: {
        display: [
          "Kediamanku Display",
          "Manrope",
          "Inter",
          "sans-serif",
        ],
        body: [
          "Kediamanku Text",
          "Inter",
          "Manrope",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
