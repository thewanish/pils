// Audits Firestore pub_images documents and reports any non-Storage URLs
// Usage: Ensure GOOGLE_APPLICATION_CREDENTIALS is set to a service account JSON
//   node scripts/audit-pub-images-storage.js

const admin = require('firebase-admin');

function isGoogleUrl(url) {
  return !!url && /(places|maps)\.googleapis\.com\//i.test(url);
}

function isStorageUrl(url) {
  return !!url && (String(url).startsWith('https://firebasestorage.googleapis.com/') || String(url).startsWith('gs://'));
}

async function main() {
  try {
    admin.initializeApp();
  } catch (_) {}

  const db = admin.firestore();
  const snap = await db.collection('pub_images').get();

  let total = 0;
  let storage = 0;
  let google = 0;
  let other = 0;
  const nonStorage = [];

  snap.forEach((doc) => {
    total += 1;
    const data = doc.data() || {};
    const url = data.image_url;

    if (isStorageUrl(url)) {
      storage += 1;
    } else if (isGoogleUrl(url)) {
      google += 1;
      nonStorage.push({ id: doc.id, url });
    } else {
      other += 1;
      nonStorage.push({ id: doc.id, url });
    }
  });

  console.log(`\nPub images audit summary:`);
  console.log(` - Total docs: ${total}`);
  console.log(` - Storage URLs: ${storage}`);
  console.log(` - Google media URLs: ${google}`);
  console.log(` - Other/non-storage URLs: ${other}`);

  if (nonStorage.length) {
    console.log(`\nNon-storage entries:`);
    nonStorage.slice(0, 50).forEach((e) => {
      console.log(` - ${e.id}: ${e.url || '(missing)'} `);
    });
    if (nonStorage.length > 50) {
      console.log(` ...and ${nonStorage.length - 50} more`);
    }
    process.exitCode = 2;
  } else {
    console.log('\n✅ All pub_images point to Firebase Storage.');
  }
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
