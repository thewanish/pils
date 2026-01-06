import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Cloud Function triggered when a vote is created, updated, or deleted.
 * Updates the comment's score and the author's points atomically.
 *
 * This ensures only trusted server-side code can modify score and points,
 * preventing clients from manipulating other users' data.
 */
/**
 * Cloud Function triggered when a comment is created.
 * Awards the user 1 point for posting a comment.
 */
export const onCommentCreate = functions.firestore
  .document("comments/{commentId}")
  .onCreate(async (snap, context) => {
    const commentData = snap.data();
    const authorId = commentData?.userId as string | undefined;

    if (!authorId) {
      console.warn("Comment created without userId");
      return null;
    }

    const userRef = admin.firestore().doc(`users/${authorId}`);

    return admin.firestore().runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (userSnap.exists) {
        const currentPoints = (userSnap.data()?.points ?? 0) as number;
        const currentCommentCount = (userSnap.data()?.commentCount ?? 0) as number;
        transaction.update(userRef, {
          points: currentPoints + 1,
          commentCount: currentCommentCount + 1,
        });
      } else {
        // Create user profile if it doesn't exist
        transaction.set(userRef, {
          points: 1,
          commentCount: 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });
  });

/**
 * Cloud Function triggered when a vote is created, updated, or deleted.
 * Updates the comment's score and the author's points atomically.
 *
 * This ensures only trusted server-side code can modify score and points,
 * preventing clients from manipulating other users' data.
 */
export const onVoteChange = functions.firestore
  .document("comments/{commentId}/votes/{voteId}")
  .onWrite(async (change, context) => {
    const commentId = context.params.commentId;

    // Calculate the delta in vote value
    const beforeVal = change.before.exists ?
      (change.before.data()?.value ?? 0) : 0;
    const afterVal = change.after.exists ?
      (change.after.data()?.value ?? 0) : 0;
    const delta = afterVal - beforeVal;

    // No change in vote value, nothing to do
    if (delta === 0) {
      return null;
    }

    const commentRef = admin.firestore().doc(`comments/${commentId}`);

    return admin.firestore().runTransaction(async (transaction) => {
      const commentSnap = await transaction.get(commentRef);

      if (!commentSnap.exists) {
        console.warn(`Comment ${commentId} does not exist`);
        return;
      }

      const commentData = commentSnap.data();
      const authorId = commentData?.userId as string | undefined;
      const currentScore = (commentData?.score ?? 0) as number;

      // Update comment score
      transaction.update(commentRef, {score: currentScore + delta});

      // Update author's points
      if (authorId) {
        const userRef = admin.firestore().doc(`users/${authorId}`);
        const userSnap = await transaction.get(userRef);

        if (userSnap.exists) {
          const currentPoints = (userSnap.data()?.points ?? 0) as number;
          transaction.update(userRef, {points: currentPoints + delta});
        } else {
          // Create user profile if it doesn't exist
          transaction.set(userRef, {
            points: delta,
            commentCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    });
  });
