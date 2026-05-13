// Run once: node generate-cluster-images.js
// Generates subsector images via Gemini Imagen 3, uploads to Cloudinary, saves URLs to cluster-image-urls.json

const crypto = require('crypto');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const getEnv = k => env.match(new RegExp(`^${k}=(.+)`, 'm'))?.[1]?.trim();

const GEMINI_KEY = getEnv('GEMINI_API_KEY');
const CLD_CLOUD  = getEnv('CLOUDINARY_CLOUD_NAME');
const CLD_KEY    = getEnv('CLOUDINARY_API_KEY');
const CLD_SECRET = getEnv('CLOUDINARY_API_SECRET');

const CLUSTERS = {
  agriculture: {
    name: 'Agriculture, Food & Natural Resources',
    subsectors: [
      { id: 'farming',       label: 'Agriculture & Farming',     prompt: 'Aerial photo of lush green farm fields with crops at golden hour, sustainable agriculture, cinematic wide shot, professional photography, vibrant colors' },
      { id: 'food-science',  label: 'Food Science',              prompt: 'Food scientist in bright modern laboratory testing food samples with clean equipment, professional white coat, sharp focus, high quality photography' },
      { id: 'environmental', label: 'Environmental Science',     prompt: 'Environmental scientist collecting water samples at a clear river in a forest, outdoor field research, natural sunlight, professional photography' },
      { id: 'horticulture',  label: 'Horticulture',              prompt: 'Beautiful greenhouse interior with rows of lush green plants and flowers, warm golden light filtering through glass, professional photography' },
      { id: 'veterinary',    label: 'Veterinary Science',        prompt: 'Veterinarian in professional clinic gently examining a healthy animal, clean clinical environment, warm caring expression, high quality photography' },
    ]
  },
  arts: {
    name: 'Arts & Communication',
    subsectors: [
      { id: 'graphic-design', label: 'Graphic Design',           prompt: 'Graphic designer at modern workstation with dual monitors showing vibrant colorful design work, creative studio, professional lighting, high quality photography' },
      { id: 'journalism',     label: 'Journalism & Media',       prompt: 'News anchor at professional broadcast desk with studio cameras and lighting, modern newsroom, confident professional pose, high quality photography' },
      { id: 'photography',    label: 'Photography',              prompt: 'Photographer with professional camera capturing a dramatic shot in creative studio, colorful backdrop, artistic lighting, high quality photography' },
      { id: 'film',           label: 'Film & Video Production',  prompt: 'Film crew on a cinematic set with camera equipment and professional lighting rigs, behind the scenes production, high quality photography' },
      { id: 'marketing',      label: 'Marketing & Advertising',  prompt: 'Marketing team in bright modern office collaborating around whiteboard with colorful campaign ideas, dynamic energy, professional photography' },
    ]
  },
  finance: {
    name: 'Finance & Business Services',
    subsectors: [
      { id: 'banking',         label: 'Banking & Finance',       prompt: 'Modern bank interior with professional teller windows, clean corporate atmosphere, warm lighting, high quality architectural photography' },
      { id: 'accounting',      label: 'Accounting',              prompt: 'Accountant analyzing financial charts and data on computer screens in modern office, professional business attire, high quality photography' },
      { id: 'management',      label: 'Business Management',     prompt: 'Business team in bright corporate boardroom, leader presenting growth strategy on screen, professional environment, high quality photography' },
      { id: 'entrepreneurship',label: 'Entrepreneurship',        prompt: 'Young entrepreneur in modern startup office with whiteboard business plan, energetic creative workspace, natural light, high quality photography' },
      { id: 'real-estate',     label: 'Real Estate & Insurance', prompt: 'Real estate agent showing beautiful modern home exterior to a young couple, professional handshake, suburban neighborhood, blue sky, high quality photography' },
    ]
  },
  health: {
    name: 'Health Sciences & Technology',
    subsectors: [
      { id: 'nursing',       label: 'Nursing & Patient Care',    prompt: 'Compassionate nurse in bright hospital corridor wearing scrubs, warm smile, clean modern medical environment, professional photography' },
      { id: 'medical-tech',  label: 'Medical Technology',        prompt: 'Medical technician operating advanced MRI diagnostic equipment in clean hospital setting, professional scrubs, high quality photography' },
      { id: 'physical-therapy', label: 'Physical Therapy',       prompt: 'Physical therapist helping patient with rehabilitation exercises in bright therapy room, caring interaction, modern equipment, high quality photography' },
      { id: 'pharmacy',      label: 'Pharmacy',                  prompt: 'Pharmacist in modern pharmacy reviewing prescriptions, organized medicine shelves with warm lighting, professional white coat, high quality photography' },
      { id: 'mental-health', label: 'Mental Health & Counseling',prompt: 'Counselor in warm comfortable therapy office having compassionate conversation, cozy armchairs, soft natural lighting, high quality photography' },
    ]
  },
  human: {
    name: 'Human & Public Services',
    subsectors: [
      { id: 'education',    label: 'Education & Teaching',       prompt: 'Energetic teacher at front of bright modern classroom engaging students with hands raised, colorful classroom, natural light, high quality photography' },
      { id: 'social-work',  label: 'Social Work',                prompt: 'Social worker in community center having supportive conversation with a family, warm compassionate setting, professional photography' },
      { id: 'government',   label: 'Government & Public Admin',  prompt: 'Government official at professional public service building, American flag, clean administrative setting, confident professional, high quality photography' },
      { id: 'public-safety',label: 'Public Safety',              prompt: 'Police officer in friendly community engagement with citizens outdoors, approachable public safety professional, bright daylight, high quality photography' },
      { id: 'nonprofit',    label: 'Nonprofit & Community',      prompt: 'Diverse group of volunteers cheerfully working together at community food bank event, teamwork and positive energy, high quality photography' },
    ]
  },
  it: {
    name: 'Information Technology',
    subsectors: [
      { id: 'software',      label: 'Software Development',      prompt: 'Software developer focused on coding at multiple monitors with glowing code on screens, sleek modern tech office, professional photography' },
      { id: 'cybersecurity', label: 'Cybersecurity',             prompt: 'Cybersecurity analyst at monitoring station with multiple screens displaying network security dashboards, dramatic dark tech environment, high quality photography' },
      { id: 'networking',    label: 'Network Administration',     prompt: 'IT technician working in server room with rows of illuminated blue server racks, professional environment, high quality photography' },
      { id: 'data-science',  label: 'Data Science & Analytics',  prompt: 'Data scientist working with colorful data visualizations and analytics dashboards on large monitors, modern tech office, high quality photography' },
      { id: 'ai-ml',         label: 'AI & Machine Learning',     prompt: 'AI researcher at advanced computing workstation with neural network visualizations on screen, futuristic clean tech lab, high quality photography' },
    ]
  },
  manufacturing: {
    name: 'Manufacturing, Engineering & Trades',
    subsectors: [
      { id: 'engineering',    label: 'Engineering',              prompt: 'Civil engineer in hard hat reviewing blueprints at modern construction site, professional planning, dramatic sky background, high quality photography' },
      { id: 'manufacturing',  label: 'Manufacturing',            prompt: 'Modern automated manufacturing facility with clean production line and robotic equipment in operation, bright industrial environment, high quality photography' },
      { id: 'construction',   label: 'Construction & Carpentry', prompt: 'Skilled construction worker framing a new building structure, professional tools, clear blue sky background, high quality photography' },
      { id: 'automotive',     label: 'Automotive & Mechanics',   prompt: 'Automotive technician working on a vehicle engine in a clean modern garage, professional tools, focused professional, high quality photography' },
      { id: 'electrical',     label: 'Electrical Trades & HVAC', prompt: 'Licensed electrician carefully working on electrical panel in clean residential setting, professional tools and safety gear, high quality photography' },
    ]
  }
};

async function generateImage(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '16:9' }
      })
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.predictions[0].bytesBase64Encoded;
}

function cldSign(params) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + CLD_SECRET;
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function uploadToCloudinary(base64, publicId) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = cldSign(params);

  const form = new FormData();
  form.append('file', `data:image/png;base64,${base64}`);
  form.append('public_id', publicId);
  form.append('timestamp', String(timestamp));
  form.append('api_key', CLD_KEY);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLD_CLOUD}/image/upload`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary ${res.status}: ${txt.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.secure_url;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const results = {};
  let total = 0, done = 0;
  for (const c of Object.values(CLUSTERS)) total += c.subsectors.length;
  console.log(`Generating ${total} images...\n`);

  for (const [clusterId, cluster] of Object.entries(CLUSTERS)) {
    results[clusterId] = { name: cluster.name, subsectors: [] };
    console.log(`\n[${cluster.name}]`);

    for (const sub of cluster.subsectors) {
      const publicId = `field-experience/clusters/${clusterId}/${sub.id}`;
      try {
        process.stdout.write(`  ${sub.label}... `);
        const base64 = await generateImage(sub.prompt);
        const url = await uploadToCloudinary(base64, publicId);
        results[clusterId].subsectors.push({ ...sub, url });
        done++;
        console.log(`✓ (${done}/${total})`);
      } catch (err) {
        results[clusterId].subsectors.push({ ...sub, url: null, error: err.message });
        console.log(`✗ ${err.message}`);
      }
      await sleep(1500);
    }
  }

  fs.writeFileSync('cluster-image-urls.json', JSON.stringify(results, null, 2));
  console.log(`\nDone. URLs saved to cluster-image-urls.json`);
}

main().catch(console.error);
