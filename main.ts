import { cpSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
const screenshots = join(root, 'screenshots');
const images = readdirSync(screenshots, { withFileTypes: true })
  .filter(entry => entry.isFile() && !entry.name.startsWith('.'));

if (images.length < 3 || images.length > 4) {
  throw new Error('The dossier needs three or four browser screenshots.');
}

mkdirSync(output, { recursive: true });
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });
mkdirSync(join(output, 'screenshots'), { recursive: true });
for (const { name } of images) {
  cpSync(join(screenshots, name), join(output, 'screenshots', name));
}

const limits = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024
};
writeFileSync(join(output, 'dossier.json'), buildDossier(output, limits));
