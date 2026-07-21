// node upload-partner-heroes.js
const crypto = require('crypto');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const getEnv = k => env.match(new RegExp(`^${k}=(.+)`, 'm'))?.[1]?.trim();
const CLD_CLOUD  = getEnv('CLOUDINARY_CLOUD_NAME');
const CLD_KEY    = getEnv('CLOUDINARY_API_KEY');
const CLD_SECRET = getEnv('CLOUDINARY_API_SECRET');

const HEROES = [
  { file: 'partner-heroes/bps-business-office.png',  id: 'bps-business-office'  },
  { file: 'partner-heroes/bps-athletics.png',         id: 'bps-athletics'         },
  { file: 'partner-heroes/bps-superintendent.png',    id: 'bps-superintendent'    },
  { file: 'partner-heroes/bps-athletic-training.png', id: 'bps-athletic-training' },
  { file: 'partner-heroes/bps-nursing.png',           id: 'bps-nursing'           },
  { file: 'partner-heroes/batavia-library.png',       id: 'batavia-library'       },
  { file: 'partner-heroes/organic-life.png',          id: 'organic-life'          },
  { file: 'partner-heroes/bps-building-grounds.png',  id: 'bps-building-grounds'  },
  { file: 'partner-heroes/bps-technology.png',        id: 'bps-technology'        },
];

function cldSign(params) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + CLD_SECRET;
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function uploadFile(filePath, id) {
  const timestamp = Math.round(Date.now() / 1000);
  const publicId = `field-experience/partner-heroes/${id}`;
  const params = { public_id: publicId, timestamp };
  const signature = cldSign(params);

  const fileBytes = fs.readFileSync(filePath);
  const b64 = fileBytes.toString('base64');
  const dataUri = `data:image/png;base64,${b64}`;

  const form = new FormData();
  form.append('file', dataUri);
  form.append('public_id', publicId);
  form.append('timestamp', String(timestamp));
  form.append('api_key', CLD_KEY);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).secure_url;
}

async function main() {
  if (!CLD_CLOUD || !CLD_KEY || !CLD_SECRET) {
    console.error('Missing Cloudinary credentials in .env');
    process.exit(1);
  }
  console.log(`Uploading to Cloudinary cloud: ${CLD_CLOUD}`);

  const results = {};
  for (const hero of HEROES) {
    process.stdout.write(`  ${hero.id}... `);
    try {
      const url = await uploadFile(hero.file, hero.id);
      results[hero.id] = url;
      console.log(`✓ ${url}`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
      results[hero.id] = null;
    }
  }

  fs.writeFileSync('partner-hero-urls.json', JSON.stringify(results, null, 2));
  console.log('\nSaved to partner-hero-urls.json');
}
main().catch(console.error);
