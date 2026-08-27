import fs from 'node:fs';
import path from 'node:path';

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  if (entry.name === '.git' || entry.name === 'outputs') return [];
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const htmlFiles = walk('.').filter((file) => file.endsWith('.html'));
const failures = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const required = [
    ['title', /<title>[^<]+<\/title>/i],
    ['description', /<meta\s+[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i],
    ['h1', /<h1\b[^>]*>[^<]+<\/h1>/i],
    ['canonical', /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/k1gamehubpk\.com\//i],
  ];
  for (const [label, pattern] of required) {
    if (!pattern.test(html)) failures.push(`${file}: missing ${label}`);
  }
}

for (const file of ['robots.txt', 'sitemap.xml', 'feed.xml', 'site.webmanifest']) {
  if (!fs.existsSync(file)) failures.push(`${file}: missing`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} HTML files and required discovery assets.`);
