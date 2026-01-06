// One-time script to fetch pub images from Google Places API (New)
// Run with: node scripts/fetch-pub-images.js

const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Get your Google Places API key from: https://console.cloud.google.com/apis/credentials
const GOOGLE_API_KEY = 'AIzaSyBuerXuXrVhwniO7vDL4TvYvyvhV3urn-c';

// Delay to avoid rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPubImage(pubName, city) {
  try {
    // Use the NEW Places API (Text Search)
    const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
    const searchResponse = await axios.post(
      searchUrl,
      {
        textQuery: `${pubName} ${city}`,
        maxResultCount: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
        },
      }
    );

    if (!searchResponse.data.places || searchResponse.data.places.length === 0) {
      console.log(`❌ No results for: ${pubName}, ${city}`);
      return null;
    }

    const place = searchResponse.data.places[0];
    
    if (!place.photos || place.photos.length === 0) {
      console.log(`❌ No photo for: ${pubName}`);
      return null;
    }

    // Get the first photo using the new API format
    const photo = place.photos[0];
    // Construct photo URL - the photo.name contains the resource name
    const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&key=${GOOGLE_API_KEY}`;
    
    console.log(`✅ Found image for: ${pubName}`);
    return photoUrl;
  } catch (err) {
    console.error(`❌ Error fetching ${pubName}:`, err.response?.data || err.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Starting pub image fetch...');

    // Fetch all beers from the Apify API (same as app uses)
    const response = await axios.get('https://api.apify.com/v2/datasets/Qt6MIZpWAOkLE5W1S/items?format=json&clean=true');
    const beers = response.data;

    console.log(`📊 Found ${beers.length} beers`);

    // Extract unique pub names and cities
    const pubsMap = new Map();
    beers.forEach(beer => {
      const key = `${beer.pub_name}|${beer.city}`;
      if (!pubsMap.has(key)) {
        pubsMap.set(key, {
          name: beer.pub_name,
          city: beer.city
        });
      }
    });

    const pubs = Array.from(pubsMap.values());
    console.log(`🍺 Found ${pubs.length} unique pubs`);

    let processed = 0;
    let found = 0;
    const results = [];

    // Process each pub
    for (const pub of pubs) {
      processed++;
      console.log(`\n[${processed}/${pubs.length}] Processing: ${pub.name}, ${pub.city}`);

      const imageUrl = await fetchPubImage(pub.name, pub.city);
      
      // Always save to Firestore (with placeholder if not found)
      const finalUrl = imageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400';
      
      // Create safe document ID by replacing forward slashes
      const safeDocId = `${pub.name}_${pub.city}`.replace(/\//g, '-');
      
      await db.collection('pub_images').doc(safeDocId).set({
        pub_name: pub.name,
        city: pub.city,
        image_url: finalUrl,
        fetched_at: admin.firestore.FieldValue.serverTimestamp(),
        has_real_image: !!imageUrl
      });

      if (imageUrl) {
        found++;
        results.push({ pub: pub.name, city: pub.city, url: imageUrl });
      }

      // Rate limiting - wait between requests
      await delay(100);

      // Progress update every 50 pubs
      if (processed % 50 === 0) {
        console.log(`\n📈 Progress: ${processed}/${pubs.length} (${((found/processed)*100).toFixed(1)}% success rate)`);
      }
    }

    console.log('\n✨ Done!');
    console.log(`📊 Total processed: ${processed}`);
    console.log(`✅ Images found: ${found}`);
    console.log(`📈 Success rate: ${((found/processed)*100).toFixed(1)}%`);
    
    // Save results to file
    fs.writeFileSync('pub-images-results.json', JSON.stringify(results, null, 2));
    console.log('💾 Results saved to pub-images-results.json');

    // Cost estimate (Text Search: $0.035 per request, Photo: $0.007 per request)
    const estimatedCost = (processed * 0.035) + (found * 0.007);
    console.log(`💰 Estimated cost: $${estimatedCost.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    process.exit(0);
  }
}

main();
