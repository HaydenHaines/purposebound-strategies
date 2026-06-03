import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://subtle-starlight-aab9cb.netlify.app',
  integrations: [tailwind(), sitemap()],
  devToolbar: { enabled: false },
});
