// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info

// I added fallback app.html due to slug routes not building due to not being prerendered? so in layout.js we also turn prerender to false
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      strict: true,
      fallback: "app.html"
    }),
  },
  preprocess: [vitePreprocess({})],
};


export default config;
