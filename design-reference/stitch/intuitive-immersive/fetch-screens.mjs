import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = '4566503762483749210';
const API_KEY = process.env.STITCH_API_KEY;

const SCREENS = [
  { slug: 'business-dashboard', screenId: 'c1a2a4645fad4b65b7c546301cfee4ba', route: '/t/:slug/dashboard' },
  { slug: 'product-catalog', screenId: '11f1338fb5944ee4b98a93bb0b85902e', route: '/t/:slug/products' },
  { slug: 'publishing-center', screenId: '98e7c01e1f7649938bf111a6392c56b4', route: '/t/:slug/publish' },
  { slug: 'bookings-inbox', screenId: '60983790c03f453194b8353561a1633c', route: '/t/:slug/bookings' },
  { slug: 'marketing-overview', screenId: '5a288ef67fa5488488269443b1286fd6', route: '/marketing' },
  { slug: 'project-workspace', screenId: 'f5e42aff73b44963bb179ae75585d374', route: '/marketing/projects/:id' },
  { slug: 'agent-studio', screenId: '9eb961b0af3f451c8eabfaf99dc6f1f4', route: '/marketing/projects/:id/content' },
  { slug: 'crm-pipeline', screenId: '94b511a1c0e74718ac359f3c450c6265', route: '/marketing/projects/:id/crm' },
];

mkdirSync(__dirname, { recursive: true });

const manifest = {
  projectId: PROJECT_ID,
  projectTitle: 'Intuitive Immersive Product Design',
  fetchedAt: new Date().toISOString(),
  screens: [],
};

for (const screen of SCREENS) {
  console.log(`Fetching ${screen.slug}...`);
  const raw = execSync(
    `npx -y @_davideast/stitch-mcp tool get_screen -d '${JSON.stringify({ projectId: PROJECT_ID, screenId: screen.screenId })}'`,
    { env: { ...process.env, STITCH_API_KEY: API_KEY }, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
  );
  const data = JSON.parse(raw);
  writeFileSync(join(__dirname, `${screen.slug}.meta.json`), JSON.stringify(data, null, 2));

  const htmlUrl = data.htmlCode?.downloadUrl;
  const imgUrl = data.screenshot?.downloadUrl;

  if (htmlUrl) {
    execSync(`curl -sL "${htmlUrl}" -o "${join(__dirname, `${screen.slug}.html`)}"`);
  }
  if (imgUrl) {
    execSync(`curl -sL "${imgUrl}" -o "${join(__dirname, `${screen.slug}.png`)}"`);
  }

  manifest.screens.push({
    ...screen,
    title: data.title,
    width: data.width,
    height: data.height,
    htmlFile: `${screen.slug}.html`,
    pngFile: `${screen.slug}.png`,
    metaFile: `${screen.slug}.meta.json`,
  });
  console.log(`  done: ${data.title}`);
}

writeFileSync(join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('manifest.json written');
