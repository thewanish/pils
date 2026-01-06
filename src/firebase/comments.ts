import { doc, runTransaction, type DocumentReference } from "firebase/firestore";
import { auth, db } from "./firebase";

type VoteValue = 1 | -1 | 0;

/**
 * Toggle a user's vote on a comment.
 * - pass 1 to like, -1 to dislike, or 0 to remove vote.
 * Ensures each user has at most one vote per comment and updates derived score.
 *
 * Comment doc shape used here:
 * { votes?: Record<string, 1|-1>, score?: number }
 */
export async function setCommentVote(commentId: string, vote: VoteValue): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const voteRef: DocumentReference = doc(db, "comments", commentId, "votes", user.uid);
  const commentRef: DocumentReference = doc(db, "comments", commentId);

  await runTransaction(db, async (tx) => {
    const voteSnap = await tx.get(voteRef);
    const commentSnap = await tx.get(commentRef);
    
    if (!commentSnap.exists()) return;

    const prev = voteSnap.exists() ? (voteSnap.data() as any).value ?? 0 : 0;
    const currScore = (commentSnap.data() as any).score ?? 0;
    let newScore = currScore;

    if (vote === 0 || prev === vote) {
      // remove vote (toggle off)
      tx.delete(voteRef);
      newScore = currScore - prev;
    } else {
      // create or update vote
      tx.set(voteRef, { value: vote });
      newScore = currScore - prev + vote;
    }

    tx.update(commentRef, { score: newScore });
  });
}