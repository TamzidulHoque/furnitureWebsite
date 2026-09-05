import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Open Graph wants an absolute URL. A relative one — which is what index.html
// carries so the file works when opened locally — is ignored by most scrapers,
// so the link would share with no picture. Vercel hands the production domain
// to the build, so the tags are completed there and left alone everywhere else,
// where nothing is scraping them anyway. SITE_URL overrides, for any other host.
const siteUrl = () => {
  const raw = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
  if (!raw) return '';
  return (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/+$/, '');
};

const absoluteSocialUrls = () => ({
  name: 'absolute-social-urls',
  transformIndexHtml(html) {
    const base = siteUrl();
    if (!base) return html;
    return html
      .replace('content="/og.jpg"', `content="${base}/og.jpg"`)
      .replace(
        '<meta property="og:type" content="website" />',
        `<meta property="og:type" content="website" />\n    <meta property="og:url" content="${base}/" />`,
      );
  },
});

export default defineConfig({
  plugins: [react(), absoluteSocialUrls()],
  build: { target: 'es2019' },
});
