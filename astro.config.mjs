import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://HaydenHaines.github.io',
  base: '/purposebound-strategies',
  integrations: [tailwind(), sitemap()],
  devToolbar: { enabled: false },
});
