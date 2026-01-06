// Run this script once to fix existing user points based on their comments
// Usage: node fix-user-points.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixUserPoints() {
  console.log('Starting to fix user points...');
  
  // Get all comments
  const commentsSnapshot = await db.collection('comments').get();
  
  // Count comments and votes per user
  const userStats = {};
  
  commentsSnapshot.forEach(doc => {
    const data = doc.data();
    const userId = data.userId;
    
    if (!userId) return;
    
    if (!userStats[userId]) {
      userStats[userId] = {
        commentCount: 0,
        votePoints: 0
      };
    }
    
    userStats[userId].commentCount++;
    userStats[userId].votePoints += (data.score || 0);
  });
  
  console.log(`Found ${Object.keys(userStats).length} users with comments`);
  
  // Update each user's points
  const batch = db.batch();
  let count = 0;
  
  for (const [userId, stats] of Object.entries(userStats)) {
    const totalPoints = stats.commentCount + stats.votePoints;
    const userRef = db.collection('users').doc(userId);
    
    batch.set(userRef, {
      points: totalPoints,
      commentCount: stats.commentCount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    count++;
    console.log(`User ${userId}: ${stats.commentCount} comments + ${stats.votePoints} vote points = ${totalPoints} total points`);
    
    // Firestore batch limit is 500 operations
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Committed batch of ${count} updates`);
    }
  }
  
  // Commit remaining updates
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`✅ Successfully updated ${count} users`);
  process.exit(0);
}

fixUserPoints().catch(err => {
  console.error('Error fixing user points:', err);
  process.exit(1);
});
