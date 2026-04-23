// Cache Google Places images to Firebase Storage and rewrite Firestore
// Run with: node scripts/cache-pub-images-to-storage.js

const admin = require('firebase-admin');
const axios = require('axios');

// Configure your Firebase project
const PROJECT_ID = 'pilsen-4134f';
const STORAGE_BUCKET = 'pilsen-4134f.firebasestorage.app';

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function safeDocId(pubName, city) {
  return `${pubName}_${city}`.replace(/\//g, '-');
}

async function downloadImage(url) {
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  const contentType = resp.headers['content-type'] || 'image/jpeg';
  return { buffer: Buffer.from(resp.data), contentType };
}

async function uploadToStorage(id, buffer, contentType) {
  const path = `pub-images/${id}.jpg`;
  const file = bucket.file(path);
  await file.save(buffer, {
    contentType,
    public: true,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });
  // Public URL via GCS
  return `https://storage.googleapis.com/${STORAGE_BUCKET}/${path}`;
}

async function migrateOne(docSnap) {
  const data = docSnap.data();
  const { pub_name, city, image_url } = data;
  const id = safeDocId(pub_name, city);

  if (!image_url) {
    console.log(`SKIP (no image): ${pub_name}, ${city}`);
    return false;
  }

  // If already using storage, skip
  if (image_url.includes('storage.googleapis.com')) {
    console.log(`SKIP (already cached): ${pub_name}, ${city}`);
    return false;
  }

  // Skip placeholders to avoid caching stock photos
  if (image_url.includes('images.unsplash.com')) {
    console.log(`SKIP (placeholder): ${pub_name}, ${city}`);
    return false;
  }

  try {
    const { buffer, contentType } = await downloadImage(image_url);
    const publicUrl = await uploadToStorage(id, buffer, contentType);

    await db.collection('pub_images').doc(docSnap.id).update({
      image_url: publicUrl,
      original_url: image_url,
      image_source: 'storage',
      cached_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Cached: ${pub_name}, ${city}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed: ${pub_name}, ${city}`, err.message || err);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting cache migration to Firebase Storage...');
  const snap = await db.collection('pub_images').get();
  console.log(`Found ${snap.size} docs in pub_images`);

  let processed = 0;
  let migrated = 0;

  for (const doc of snap.docs) {
    processed++;
    const ok = await migrateOne(doc);
    if (ok) migrated++;

    // Small delay to be gentle
    await delay(50);

    if (processed % 50 === 0) {
      console.log(`📈 Progress: ${processed}/${snap.size}, migrated: ${migrated}`);
    }
  }

  console.log('✨ Done');
  console.log(`📊 Total processed: ${processed}`);
  console.log(`✅ Migrated to storage: ${migrated}`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
