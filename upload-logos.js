// Run once: node upload-logos.js
const crypto = require('crypto');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const getEnv = k => env.match(new RegExp(`^${k}=(.+)`, 'm'))?.[1]?.trim();
const CLD_CLOUD = getEnv('CLOUDINARY_CLOUD_NAME');
const CLD_KEY   = getEnv('CLOUDINARY_API_KEY');
const CLD_SECRET = getEnv('CLOUDINARY_API_SECRET');

const LOGOS = [
  { id: 'bps101',   url: 'https://www.bps101.net/wp-content/themes/district/assets/logomain-new.png' },
  { id: 'batavia-library', url: 'https://www.bataviapl.org/sites/default/files/2025-10/batavia-footer-logo.png' },
  { id: 'organic-life',   url: 'https://www.organiclifeusa.com/assets/images/logo-2-180w.png' },
];

function cldSign(params) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + CLD_SECRET;
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function uploadUrl(remoteUrl, publicId) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = cldSign(params);
  const form = new FormData();
  form.append('file', remoteUrl);
  form.append('public_id', publicId);
  form.append('timestamp', String(timestamp));
  form.append('api_key', CLD_KEY);
  form.append('signature', signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).secure_url;
}

async function main() {
  const results = {};
  for (const logo of LOGOS) {
    const publicId = `field-experience/logos/${logo.id}`;
    process.stdout.write(`  ${logo.id}... `);
    try {
      const url = await uploadUrl(logo.url, publicId);
      results[logo.id] = url;
      console.log(`✓ ${url}`);
    } catch (err) {
      results[logo.id] = logo.url;
      console.log(`✗ ${err.message} — using original`);
    }
  }
  fs.writeFileSync('logo-urls.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to logo-urls.json');
}
main().catch(console.error);
