// Fallback: uploads curated Unsplash images to Cloudinary via remote URL upload
// Run once: node upload-unsplash-images.js

const crypto = require('crypto');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const getEnv = k => env.match(new RegExp(`^${k}=(.+)`, 'm'))?.[1]?.trim();

const CLD_CLOUD  = getEnv('CLOUDINARY_CLOUD_NAME');
const CLD_KEY    = getEnv('CLOUDINARY_API_KEY');
const CLD_SECRET = getEnv('CLOUDINARY_API_SECRET');

const IMAGES = [
  // Agriculture
  { cluster: 'agriculture', id: 'farming',       url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=85' },
  { cluster: 'agriculture', id: 'food-science',  url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&q=85' },
  { cluster: 'agriculture', id: 'environmental', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=85' },
  { cluster: 'agriculture', id: 'horticulture',  url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=85' },
  { cluster: 'agriculture', id: 'veterinary',    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=1920&q=85' },
  // Arts
  { cluster: 'arts', id: 'graphic-design', url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1920&q=85' },
  { cluster: 'arts', id: 'journalism',     url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=85' },
  { cluster: 'arts', id: 'photography',   url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=85' },
  { cluster: 'arts', id: 'film',           url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=85' },
  { cluster: 'arts', id: 'marketing',     url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=85' },
  // Finance
  { cluster: 'finance', id: 'banking',          url: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=1920&q=85' },
  { cluster: 'finance', id: 'accounting',       url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=85' },
  { cluster: 'finance', id: 'management',       url: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=1920&q=85' },
  { cluster: 'finance', id: 'entrepreneurship', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920&q=85' },
  { cluster: 'finance', id: 'real-estate',      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=85' },
  // Health
  { cluster: 'health', id: 'nursing',        url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920&q=85' },
  { cluster: 'health', id: 'medical-tech',   url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1920&q=85' },
  { cluster: 'health', id: 'physical-therapy', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=85' },
  { cluster: 'health', id: 'pharmacy',       url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1920&q=85' },
  { cluster: 'health', id: 'mental-health',  url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1920&q=85' },
  // Human
  { cluster: 'human', id: 'education',    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=85' },
  { cluster: 'human', id: 'social-work',  url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=85' },
  { cluster: 'human', id: 'government',   url: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=1920&q=85' },
  { cluster: 'human', id: 'public-safety',url: 'https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?w=1920&q=85' },
  { cluster: 'human', id: 'nonprofit',    url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=1920&q=85' },
  // IT
  { cluster: 'it', id: 'software',      url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920&q=85' },
  { cluster: 'it', id: 'cybersecurity', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=85' },
  { cluster: 'it', id: 'networking',    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=85' },
  { cluster: 'it', id: 'data-science',  url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=85' },
  { cluster: 'it', id: 'ai-ml',         url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1920&q=85' },
  // Manufacturing
  { cluster: 'manufacturing', id: 'engineering',   url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=85' },
  { cluster: 'manufacturing', id: 'manufacturing', url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=85' },
  { cluster: 'manufacturing', id: 'construction',  url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=85' },
  { cluster: 'manufacturing', id: 'automotive',    url: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=1920&q=85' },
  { cluster: 'manufacturing', id: 'electrical',    url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1920&q=85' },
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

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`, {
    method: 'POST', body: form
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary ${res.status}: ${txt.slice(0, 200)}`);
  }
  return (await res.json()).secure_url;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const results = {};
  let done = 0;
  console.log(`Uploading ${IMAGES.length} images to Cloudinary...\n`);

  for (const img of IMAGES) {
    const publicId = `field-experience/clusters/${img.cluster}/${img.id}`;
    if (!results[img.cluster]) results[img.cluster] = [];
    try {
      process.stdout.write(`  ${img.cluster}/${img.id}... `);
      const url = await uploadUrl(img.url, publicId);
      results[img.cluster].push({ id: img.id, url });
      done++;
      console.log(`✓ (${done}/${IMAGES.length})`);
    } catch (err) {
      results[img.cluster].push({ id: img.id, url: img.url, error: err.message });
      console.log(`✗ ${err.message} — using original URL`);
    }
    await sleep(300);
  }

  fs.writeFileSync('cluster-image-urls.json', JSON.stringify(results, null, 2));
  console.log(`\nDone. URLs saved to cluster-image-urls.json`);
}

main().catch(console.error);
