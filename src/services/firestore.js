// Firestore service layer — abstracts Firebase operations and falls back to demo data
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, increment, arrayUnion, arrayRemove,
  serverTimestamp, getCountFromServer,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '../firebase/config';
import { DEMO_PROJECTS, DEMO_CATEGORIES } from '../data/sampleData';

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects({ categoryId, status, tech, type, sortBy = 'createdAt', pageSize = 12, lastDoc = null, approvedOnly = true } = {}) {
  if (!isFirebaseConfigured) {
    let projects = [...DEMO_PROJECTS];
    if (categoryId) projects = projects.filter(p => p.category === categoryId);
    if (status) projects = projects.filter(p => p.status === status);
    if (tech) projects = projects.filter(p => p.technologies.map(t => t.toLowerCase()).includes(tech.toLowerCase()));
    if (type) projects = projects.filter(p => p.projectType === type);
    if (sortBy === 'views') projects.sort((a, b) => b.views - a.views);
    else if (sortBy === 'likes') projects.sort((a, b) => b.likes - a.likes);
    else projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { projects: projects.slice(0, pageSize), lastDoc: null, hasMore: false };
  }

  let q = collection(db, 'projects');
  const constraints = [];
  if (approvedOnly) constraints.push(where('approved', '==', true));
  if (categoryId) constraints.push(where('category', '==', categoryId));
  if (status) constraints.push(where('status', '==', status));
  if (type) constraints.push(where('projectType', '==', type));
  constraints.push(orderBy(sortBy === 'views' ? 'views' : sortBy === 'likes' ? 'likes' : 'createdAt', 'desc'));
  constraints.push(limit(pageSize));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const snapshot = await getDocs(query(q, ...constraints));
  const projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
  return { projects, lastDoc: newLastDoc, hasMore: snapshot.docs.length === pageSize };
}

export async function getProjectById(id) {
  if (!isFirebaseConfigured) {
    const p = DEMO_PROJECTS.find(p => p.id === id);
    return p || null;
  }
  const docSnap = await getDoc(doc(db, 'projects', id));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function searchProjects(searchTerm) {
  if (!isFirebaseConfigured) {
    if (!searchTerm) return DEMO_PROJECTS;
    const term = searchTerm.toLowerCase();
    return DEMO_PROJECTS.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.shortDescription.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.problemStatement.toLowerCase().includes(term) ||
      p.proposedSolution.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.categoryName.toLowerCase().includes(term) ||
      (p.tags || []).some(t => t.toLowerCase().includes(term)) ||
      (p.technologies || []).some(t => t.toLowerCase().includes(term))
    );
  }
  // Client-side search after fetching all approved projects
  const { projects } = await getProjects({ pageSize: 500 });
  if (!searchTerm) return projects;
  const term = searchTerm.toLowerCase();
  return projects.filter(p =>
    p.name?.toLowerCase().includes(term) ||
    p.shortDescription?.toLowerCase().includes(term) ||
    p.description?.toLowerCase().includes(term) ||
    p.problemStatement?.toLowerCase().includes(term) ||
    p.proposedSolution?.toLowerCase().includes(term) ||
    (p.tags || []).some(t => t.toLowerCase().includes(term)) ||
    (p.technologies || []).some(t => t.toLowerCase().includes(term))
  );
}

export async function submitProject(projectData, imageFile, userId) {
  if (!isFirebaseConfigured) {
    return { id: 'demo-' + Date.now(), ...projectData, approved: false, status: 'pending' };
  }
  let thumbnailUrl = '';
  if (imageFile) {
    const storageRef = ref(storage, `project-thumbnails/${userId}/${Date.now()}-${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    thumbnailUrl = await getDownloadURL(snapshot.ref);
  }
  const docRef = await addDoc(collection(db, 'projects'), {
    ...projectData,
    thumbnail: thumbnailUrl,
    ownerId: userId,
    approved: false,
    moderationStatus: 'pending',
    views: 0,
    likes: 0,
    likedBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id };
}

export async function incrementProjectViews(projectId) {
  if (!isFirebaseConfigured) return;
  try {
    await updateDoc(doc(db, 'projects', projectId), { views: increment(1) });
  } catch (_) {}
}

// ─── Likes ───────────────────────────────────────────────────────────────────

export async function toggleLike(projectId, userId) {
  if (!isFirebaseConfigured) return { liked: true, count: 1 };
  const projectRef = doc(db, 'projects', projectId);
  const likeRef = doc(db, 'likes', `${userId}_${projectId}`);
  const likeSnap = await getDoc(likeRef);
  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(projectRef, { likes: increment(-1), likedBy: arrayRemove(userId) });
    return { liked: false };
  } else {
    await setDoc(likeRef, { userId, projectId, createdAt: serverTimestamp() });
    await updateDoc(projectRef, { likes: increment(1), likedBy: arrayUnion(userId) });
    return { liked: true };
  }
}

export async function isProjectLiked(projectId, userId) {
  if (!isFirebaseConfigured || !userId) return false;
  const likeRef = doc(db, 'likes', `${userId}_${projectId}`);
  const snap = await getDoc(likeRef);
  return snap.exists();
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export async function toggleBookmark(projectId, userId) {
  if (!isFirebaseConfigured) return { bookmarked: true };
  const bookmarkRef = doc(db, 'bookmarks', `${userId}_${projectId}`);
  const snap = await getDoc(bookmarkRef);
  if (snap.exists()) {
    await deleteDoc(bookmarkRef);
    return { bookmarked: false };
  } else {
    await setDoc(bookmarkRef, { userId, projectId, createdAt: serverTimestamp() });
    return { bookmarked: true };
  }
}

export async function getUserBookmarks(userId) {
  if (!isFirebaseConfigured || !userId) return [];
  const q = query(collection(db, 'bookmarks'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().projectId);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getCategories() {
  if (!isFirebaseConfigured) return DEMO_CATEGORIES;
  const snap = await getDocs(collection(db, 'categories'));
  if (snap.empty) return DEMO_CATEGORIES;
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserProfile(userId) {
  if (!isFirebaseConfigured || !userId) return null;
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(userId, data) {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, 'users', userId), { ...data, updatedAt: serverTimestamp() });
}

export async function getUserProjects(userId) {
  if (!isFirebaseConfigured) return DEMO_PROJECTS.filter(p => p.ownerId === userId);
  const q = query(collection(db, 'projects'), where('ownerId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function reportProject(projectId, userId, reason) {
  if (!isFirebaseConfigured) return;
  await addDoc(collection(db, 'reports'), {
    projectId, userId, reason, createdAt: serverTimestamp(), resolved: false,
  });
}

// ─── Collaboration Requests ───────────────────────────────────────────────────

export async function sendCollaborationRequest(projectId, fromUserId, message) {
  if (!isFirebaseConfigured) return;
  await addDoc(collection(db, 'collaboration_requests'), {
    projectId, fromUserId, message, status: 'pending', createdAt: serverTimestamp(),
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function getPendingProjects() {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db, 'projects'), where('approved', '==', false), where('moderationStatus', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function approveProject(projectId) {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, 'projects', projectId), {
    approved: true, moderationStatus: 'approved', updatedAt: serverTimestamp(),
  });
}

export async function rejectProject(projectId, reason) {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, 'projects', projectId), {
    approved: false, moderationStatus: 'rejected', rejectionReason: reason, updatedAt: serverTimestamp(),
  });
}

export async function getAdminStats() {
  if (!isFirebaseConfigured) {
    return { totalProjects: DEMO_PROJECTS.length, totalUsers: 2, pending: 0, approved: DEMO_PROJECTS.length, rejected: 0 };
  }
  const projectSnap = await getCountFromServer(collection(db, 'projects'));
  const userSnap = await getCountFromServer(collection(db, 'users'));
  const pendingSnap = await getCountFromServer(query(collection(db, 'projects'), where('moderationStatus', '==', 'pending')));
  const approvedSnap = await getCountFromServer(query(collection(db, 'projects'), where('approved', '==', true)));
  const rejectedSnap = await getCountFromServer(query(collection(db, 'projects'), where('moderationStatus', '==', 'rejected')));
  return {
    totalProjects: projectSnap.data().count,
    totalUsers: userSnap.data().count,
    pending: pendingSnap.data().count,
    approved: approvedSnap.data().count,
    rejected: rejectedSnap.data().count,
  };
}

// helper used in toggleLike (setDoc not imported above)
import { setDoc } from 'firebase/firestore';
