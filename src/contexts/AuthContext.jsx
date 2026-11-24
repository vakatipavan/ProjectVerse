import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo mode user (when Firebase not configured)
  const [demoUser, setDemoUser] = useState(null);

  async function register(email, password, name) {
    if (!isFirebaseConfigured) {
      // Demo mode: simulate registration
      const user = { uid: 'demo-' + Date.now(), email, displayName: name, isDemo: true };
      setDemoUser(user);
      setCurrentUser(user);
      setUserProfile({ id: user.uid, name, email, role: 'user', createdAt: new Date() });
      return user;
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role: 'user',
      bio: '',
      organization: '',
      skills: [],
      photoURL: '',
      savedProjects: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return user;
  }

  async function login(email, password) {
    if (!isFirebaseConfigured) {
      const user = { uid: 'demo-user', email, displayName: 'Demo User', isDemo: true };
      setDemoUser(user);
      setCurrentUser(user);
      setUserProfile({ id: user.uid, name: 'Demo User', email, role: 'user' });
      return user;
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        role: 'user',
        bio: '',
        organization: '',
        skills: [],
        photoURL: user.photoURL || '',
        savedProjects: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return result;
  }

  async function logout() {
    if (!isFirebaseConfigured) {
      setDemoUser(null);
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    return signOut(auth);
  }

  async function resetPassword(email) {
    if (!isFirebaseConfigured) return;
    return sendPasswordResetEmail(auth, email);
  }

  async function fetchUserProfile(uid) {
    if (!isFirebaseConfigured || !uid) return;
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin: userProfile?.role === 'admin',
    isFirebaseConfigured,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    fetchUserProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
