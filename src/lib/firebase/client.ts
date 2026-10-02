import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously as fbSignInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User, 
  Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  Firestore 
} from 'firebase/firestore';
import { SavedResearchItem, UserSearchHistory } from '@/types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'your_api_key'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined' && isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

// Local Storage Fallback Keys
const LOCAL_SAVED_KEY = 'repurpose_local_saved';
const LOCAL_SEARCHES_KEY = 'repurpose_local_searches';
const LOCAL_USER_KEY = 'repurpose_local_user';

export function getLocalUser(): { uid: string; isAnonymous: boolean; displayName: string | null } {
  if (typeof window === 'undefined') return { uid: 'guest', isAnonymous: true, displayName: 'Guest Researcher' };
  const stored = localStorage.getItem(LOCAL_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const newUser = {
    uid: 'guest_' + Math.random().toString(36).substring(2, 9),
    isAnonymous: true,
    displayName: 'Guest Researcher',
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
  return newUser;
}

// AUTH API
export async function signInUserAnonymously(): Promise<{ uid: string; isAnonymous: boolean }> {
  if (auth) {
    const cred = await fbSignInAnonymously(auth);
    return { uid: cred.user.uid, isAnonymous: true };
  }
  return getLocalUser();
}

export async function signInWithGoogle(): Promise<{ uid: string; displayName: string | null; email: string | null } | null> {
  if (auth) {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return {
      uid: cred.user.uid,
      displayName: cred.user.displayName,
      email: cred.user.email,
    };
  }
  alert('Firebase is not yet configured in environment variables. Local guest mode is active.');
  return null;
}

export async function signOutUser(): Promise<void> {
  if (auth) {
    await fbSignOut(auth);
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
}

export function subscribeToAuth(callback: (user: { uid: string; isAnonymous: boolean; displayName: string | null; email?: string | null } | null) => void) {
  if (auth) {
    return onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        callback({
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          displayName: user.displayName,
          email: user.email,
        });
      } else {
        callback(null);
      }
    });
  }
  // Local fallback
  if (typeof window !== 'undefined') {
    callback(getLocalUser());
  }
  return () => {};
}

// FIRESTORE / STORAGE DATA API
export async function saveDrugResearch(userId: string, item: Omit<SavedResearchItem, 'id' | 'userId' | 'savedAt' | 'lastUpdated'> & { id?: string }): Promise<SavedResearchItem> {
  const now = new Date().toISOString();
  const id = item.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  
  const record: SavedResearchItem = {
    id,
    userId,
    drugGenericName: item.drugGenericName,
    rxNormId: item.rxNormId,
    conditionFocus: item.conditionFocus,
    candidateConditionsCount: item.candidateConditionsCount,
    notes: item.notes || '',
    tags: item.tags || [],
    savedAt: now,
    lastUpdated: now,
    evidenceSnapshot: item.evidenceSnapshot,
  };

  if (db && isFirebaseConfigured) {
    try {
      const ref = doc(db, 'users', userId, 'saved_drugs', id);
      await setDoc(ref, record);
      return record;
    } catch (err) {
      console.warn('Firestore write fallback to local storage:', err);
    }
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    const existing: SavedResearchItem[] = JSON.parse(localStorage.getItem(LOCAL_SAVED_KEY) || '[]');
    const filtered = existing.filter(i => i.id !== id);
    filtered.unshift(record);
    localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(filtered));
  }

  return record;
}

export async function fetchUserSavedDrugs(userId: string): Promise<SavedResearchItem[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'users', userId, 'saved_drugs'), orderBy('lastUpdated', 'desc'));
      const snap = await getDocs(q);
      const items: SavedResearchItem[] = [];
      snap.forEach(docSnap => {
        items.push(docSnap.data() as SavedResearchItem);
      });
      return items;
    } catch (err) {
      console.warn('Firestore read error, falling back to local:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_SAVED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function deleteSavedDrug(userId: string, itemId: string): Promise<boolean> {
  if (db && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'saved_drugs', itemId));
    } catch (err) {
      console.warn('Firestore delete error:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const existing: SavedResearchItem[] = JSON.parse(localStorage.getItem(LOCAL_SAVED_KEY) || '[]');
    const updated = existing.filter(i => i.id !== itemId);
    localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(updated));
  }
  return true;
}

export async function recordSearchQuery(userId: string, queryText: string, genericName?: string): Promise<void> {
  const item: UserSearchHistory = {
    id: `search_${Date.now()}`,
    query: queryText,
    genericName,
    timestamp: new Date().toISOString(),
  };

  if (db && isFirebaseConfigured) {
    try {
      const ref = doc(db, 'users', userId, 'searches', item.id);
      await setDoc(ref, item);
      return;
    } catch (err) {
      // Local fallback
    }
  }

  if (typeof window !== 'undefined') {
    const existing: UserSearchHistory[] = JSON.parse(localStorage.getItem(LOCAL_SEARCHES_KEY) || '[]');
    const filtered = existing.filter(s => s.query.toLowerCase() !== queryText.toLowerCase());
    filtered.unshift(item);
    localStorage.setItem(LOCAL_SEARCHES_KEY, JSON.stringify(filtered.slice(0, 10)));
  }
}

export async function fetchRecentSearches(userId: string): Promise<UserSearchHistory[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'users', userId, 'searches'), orderBy('timestamp', 'desc'), limit(8));
      const snap = await getDocs(q);
      const items: UserSearchHistory[] = [];
      snap.forEach(d => items.push(d.data() as UserSearchHistory));
      return items;
    } catch {
      // Local fallback
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  return [];
}
