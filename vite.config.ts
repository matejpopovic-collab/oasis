// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  // Disable the Cloudflare Workers build target — we deploy to Netlify as a
  // static site, not to Cloudflare. This also lets SPA prerender's preview
  // server find the standard dist/server/server.js entry.
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
    // SPA mode: prerender a static index.html shell that hydrates on the
    // client. All route data is static/synchronous, so no server is needed
    // at runtime — the client build can be hosted on any static CDN (Netlify).
    spa: {
      enabled: true,
      prerender: { outputPath: "/index.html" },
    },
  },
});
