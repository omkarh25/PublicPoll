import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";

// ============================
// Types
// ============================

export interface Poll {
  id: string;
  question: string;
  options: string[];
  category: string;
  createdBy: string;
  createdAt: Timestamp;
  status: "active" | "archived";
  totalVotes: number;
}

export interface Vote {
  uid: string;
  optionIndex: number;
  votedAt: Timestamp;
}

export interface Comment {
  id: string;
  uid: string;
  userName: string;
  userPhotoURL: string;
  text: string;
  createdAt: Timestamp;
}

export interface Submission {
  id: string;
  question: string;
  options: string[];
  category: string;
  submittedBy: string;
  submitterName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNote?: string;
}

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: "user" | "admin";
  createdAt: Timestamp;
}

// ============================
// Polls
// ============================

export async function getActivePolls(): Promise<Poll[]> {
  // NOTE: Firestore requires a composite index for where+orderBy on different fields.
  // We query by status only, then sort client-side to avoid index requirements.
  const q = query(collection(db, "polls"), where("status", "==", "active"));
  const snapshot = await getDocs(q);
  const polls = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Poll));
  // Client-side sort by createdAt desc
  polls.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return polls;
}

export async function getAllPolls(): Promise<Poll[]> {
  // orderBy on createdAt alone works with Firestore's auto single-field index
  const q = query(collection(db, "polls"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Poll));
}

export async function getPoll(pollId: string): Promise<Poll | null> {
  const ref = doc(db, "polls", pollId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Poll) : null;
}

export async function createPoll(poll: Omit<Poll, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "polls"), {
    ...poll,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePoll(pollId: string, data: Partial<Poll>) {
  await updateDoc(doc(db, "polls", pollId), data);
}

export async function deletePoll(pollId: string) {
  await deleteDoc(doc(db, "polls", pollId));
}

// ============================
// Votes
// ============================

export async function getUserVote(pollId: string, uid: string): Promise<Vote | null> {
  const ref = doc(db, "polls", pollId, "votes", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Vote) : null;
}

export async function submitVote(pollId: string, uid: string, optionIndex: number) {
  const voteRef = doc(db, "polls", pollId, "votes", uid);
  const pollRef = doc(db, "polls", pollId);

  // Check if already voted
  const existing = await getDoc(voteRef);
  if (existing.exists()) {
    throw new Error("Already voted");
  }

  // Write vote
  await setDoc(voteRef, {
    uid,
    optionIndex,
    votedAt: serverTimestamp(),
  });

  // Increment total votes
  const pollSnap = await getDoc(pollRef);
  if (pollSnap.exists()) {
    const current = pollSnap.data().totalVotes || 0;
    await updateDoc(pollRef, { totalVotes: current + 1 });
  }
}

export async function getVoteCounts(pollId: string): Promise<Map<number, number>> {
  const votesRef = collection(db, "polls", pollId, "votes");
  const snapshot = await getDocs(votesRef);
  const counts = new Map<number, number>();
  snapshot.docs.forEach((doc) => {
    const data = doc.data() as Vote;
    counts.set(data.optionIndex, (counts.get(data.optionIndex) || 0) + 1);
  });
  return counts;
}

export function subscribeToVoteCounts(
  pollId: string,
  callback: (counts: Map<number, number>, total: number) => void
) {
  const votesRef = collection(db, "polls", pollId, "votes");
  return onSnapshot(votesRef, (snapshot) => {
    const counts = new Map<number, number>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Vote;
      counts.set(data.optionIndex, (counts.get(data.optionIndex) || 0) + 1);
    });
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    callback(counts, total);
  });
}

// ============================
// Comments
// ============================

export async function getComments(pollId: string): Promise<Comment[]> {
  // Client-side sort to avoid composite index requirement
  const q = query(collection(db, "polls", pollId, "comments"));
  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
  comments.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return comments;
}

export async function addComment(
  pollId: string,
  comment: Omit<Comment, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "polls", pollId, "comments"), {
    ...comment,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteComment(pollId: string, commentId: string) {
  await deleteDoc(doc(db, "polls", pollId, "comments", commentId));
}

// ============================
// Submissions (User-submitted questions)
// ============================

export async function createSubmission(
  submission: Omit<Submission, "id" | "createdAt" | "status">
): Promise<string> {
  const docRef = await addDoc(collection(db, "submissions"), {
    ...submission,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSubmissions(status?: "pending" | "approved" | "rejected"): Promise<Submission[]> {
  // Client-side filter + sort to avoid composite index requirements
  const q = query(collection(db, "submissions"));
  const snapshot = await getDocs(q);
  let submissions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Submission));

  if (status) {
    submissions = submissions.filter((s) => s.status === status);
  }

  submissions.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });

  return submissions;
}

export async function reviewSubmission(
  submissionId: string,
  status: "approved" | "rejected",
  adminUid: string,
  note?: string
) {
  const data: any = {
    status,
    reviewedBy: adminUid,
    reviewedAt: serverTimestamp(),
  };
  if (note) data.reviewNote = note;
  await updateDoc(doc(db, "submissions", submissionId), data);
}

// ============================
// Users
// ============================

export async function getAllUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => doc.data() as AppUser);
}

export async function updateUserRole(uid: string, role: "user" | "admin") {
  await updateDoc(doc(db, "users", uid), { role });
}

export async function getUserVotes(uid: string): Promise<{ pollId: string; vote: Vote; poll: Poll }[]> {
  const polls = await getAllPolls();
  const results: { pollId: string; vote: Vote; poll: Poll }[] = [];

  for (const poll of polls) {
    const vote = await getUserVote(poll.id, uid);
    if (vote) {
      results.push({ pollId: poll.id, vote, poll });
    }
  }

  return results;
}

export async function getUserComments(uid: string): Promise<{ comment: Comment; pollId: string; poll: Poll }[]> {
  const polls = await getAllPolls();
  const results: { comment: Comment; pollId: string; poll: Poll }[] = [];

  for (const poll of polls) {
    const comments = await getComments(poll.id);
    comments
      .filter((c) => c.uid === uid)
      .forEach((comment) => {
        results.push({ comment, pollId: poll.id, poll });
      });
  }

  return results;
}

// ============================
// Seed Data
// ============================

const SEED_QUESTIONS = [
  { question: "Should traffic police be banned from collecting cash fines?", options: ["Yes", "No"], category: "traffic" },
  { question: "Should pot holes be fixed within 48 hours of reporting?", options: ["Yes", "No"], category: "infrastructure" },
  { question: "Fitness test required for police officers every year?", options: ["Yes", "No"], category: "law_enforcement" },
  { question: "Should we penalize municipality for not collecting garbage on that day?", options: ["Yes", "No"], category: "sanitation" },
  { question: "Should people be able to revoke an elected politician?", options: ["Yes", "No"], category: "governance" },
  { question: "Should Bangalore Metro be extended to all residential areas?", options: ["Yes", "No"], category: "transport" },
  { question: "Should street vendors be allowed in all neighborhoods?", options: ["Yes", "No"], category: "commerce" },
  { question: "Should mandatory rainwater harvesting be enforced for all buildings?", options: ["Yes", "No"], category: "environment" },
  { question: "Should private hospitals display all charges transparently?", options: ["Yes", "No"], category: "healthcare" },
  { question: "Should school buses have GPS tracking mandatory?", options: ["Yes", "No"], category: "safety" },
  { question: "Should Bengaluru have odd-even vehicle scheme during peak hours?", options: ["Yes", "No"], category: "traffic" },
  { question: "Should farmers get direct income support from government?", options: ["Yes", "No"], category: "agriculture" },
  { question: "Should electric autos be mandatory in Mysore city?", options: ["Yes", "No"], category: "environment" },
  { question: "Should BBMP engineers be held accountable for road quality?", options: ["Yes", "No"], category: "accountability" },
  { question: "Should there be strict penalties for noise pollution during festivals?", options: ["Yes", "No"], category: "environment" },
  { question: "Should government provide free WiFi in all villages?", options: ["Yes", "No"], category: "digital" },
  { question: "Should Bangalore roads have dedicated cycle lanes?", options: ["Yes", "No"], category: "transport" },
  { question: "Should pet owners register their animals with local authorities?", options: ["Yes", "No"], category: "animals" },
  { question: "Should CCTV cameras be mandatory at all public places?", options: ["Yes", "No"], category: "security" },
  { question: "Should auto-rickshaw fares be regulated with maximum caps?", options: ["Yes", "No"], category: "transport" },
];

export async function seedPolls(adminUid: string): Promise<number> {
  const existing = await getActivePolls();
  if (existing.length > 0) {
    console.log("[Seed] Polls already exist, skipping seed.");
    return 0;
  }

  for (const q of SEED_QUESTIONS) {
    await createPoll({
      question: q.question,
      options: q.options,
      category: q.category,
      createdBy: adminUid,
      status: "active",
      totalVotes: 0,
    });
  }
  console.log("[Seed] Seeded", SEED_QUESTIONS.length, "polls.");
  return SEED_QUESTIONS.length;
}
