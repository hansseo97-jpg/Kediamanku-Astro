import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

const dynamicRewriteRules = [
  {
    pattern: /^\/admin\/blog\/new\/?$/,
    target: "/admin/blog/",
    fixedParams: { mode: "new" },
  },
  {
    pattern: /^\/admin\/blog\/([^/]+)\/edit\/?$/,
    target: "/admin/blog/",
    param: "id",
  },
];

function kediamankuDevRewrites() {
  return {
    name: "kediamanku-dev-rewrites",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (!request.url || request.method !== "GET") return next();

        const url = new URL(request.url, "http://localhost");
        for (const rule of dynamicRewriteRules) {
          const match = url.pathname.match(rule.pattern);
          if (!match) continue;

          const value = match[1];
          if (value && (value.includes(".") || rule.excluded?.has(value))) continue;

          url.pathname = rule.target;
          if (rule.param && value) {
            url.searchParams.set(rule.param, decodeURIComponent(value));
          }
          for (const [key, fixedValue] of Object.entries(rule.fixedParams || {})) {
            url.searchParams.set(key, fixedValue);
          }
          request.url = `${url.pathname}${url.search}`;
          break;
        }

        return next();
      });
    },
  };
}

export default defineConfig({
  site: "https://kediamanku.id",
  trailingSlash: "always",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    plugins: [kediamankuDevRewrites()],
  },
});
