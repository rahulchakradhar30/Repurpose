import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously as fbSignInAnonymously, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
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

/**
 * Resolves the optimal authDomain.
 * When running in the browser on drugrepurpose.vercel.app or custom domains,
 * routing through window.location.host uses Next.js /__/auth rewrites.
 * This converts all auth cookies into 100% first-party cookies, eliminating browser 3P cookie blocks.
 */
export function getEffectiveAuthDomain(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    if (host && (host.includes('vercel.app') || host.includes('localhost') || host.includes('127.0.0.1'))) {
      return host;
    }
  }
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'repurpose-6bbab.firebaseapp.com';
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!app && isFirebaseConfigured) {
    try {
      const dynamicConfig = {
        ...firebaseConfig,
        authDomain: getEffectiveAuthDomain(),
      };
      app = getApps().length > 0 ? getApp() : initializeApp(dynamicConfig);
    } catch (err) {
      console.warn('Firebase app init warning:', err);
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (!auth) {
    const currentApp = getFirebaseApp();
    if (currentApp) {
      try {
        auth = getAuth(currentApp);
      } catch (err) {
        console.warn('Firebase auth init warning:', err);
      }
    }
  }
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (!db) {
    const currentApp = getFirebaseApp();
    if (currentApp) {
      try {
        db = getFirestore(currentApp);
      } catch (err) {
        console.warn('Firebase firestore init warning:', err);
      }
    }
  }
  return db;
}

// Local Storage Fallback Keys
const LOCAL_SAVED_KEY = 'repurpose_local_saved';
const LOCAL_SEARCHES_KEY = 'repurpose_local_searches';
const LOCAL_USER_KEY = 'repurpose_local_user';
export const AUTH_CHANGED_EVENT = 'repurpose_auth_state_changed';

export function getLocalUser(): { uid: string; isAnonymous: boolean; displayName: string | null; email?: string | null } {
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
  const currentAuth = getFirebaseAuth();
  if (currentAuth) {
    const cred = await fbSignInAnonymously(currentAuth);
    return { uid: cred.user.uid, isAnonymous: true };
  }
  return getLocalUser();
}

export interface GoogleSignInResult {
  success: boolean;
  user?: { uid: string; displayName: string | null; email: string | null };
  error?: string;
  code?: string;
  domain?: string;
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    return {
      success: false,
      error: 'Firebase is not initialized. Please ensure NEXT_PUBLIC_FIREBASE_* environment variables are set in .env.local.',
    };
  }

  try {
    // Explicitly configure local browser persistence (IndexedDB/localStorage)
    await setPersistence(currentAuth, browserLocalPersistence);
  } catch (pErr) {
    console.warn('Firebase persistence warning:', pErr);
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(currentAuth, provider);
    
    const userProfile = {
      uid: cred.user.uid,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Researcher',
      email: cred.user.email,
      isAnonymous: false,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));
      const credential = GoogleAuthProvider.credentialFromResult(cred);
      if (credential?.accessToken) {
        sessionStorage.setItem('repurpose_drive_access_token', credential.accessToken);
        localStorage.setItem('repurpose_drive_access_token', credential.accessToken);
      }
      window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: userProfile }));
    }

    return {
      success: true,
      user: {
        uid: cred.user.uid,
        displayName: cred.user.displayName,
        email: cred.user.email,
      },
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase Google Sign-In error:', error);

    let friendlyMessage = 'Sign-in failed. Please try again.';
    const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';

    if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage = `Domain '${host}' is not authorized in your Firebase project. Go to Firebase Console > Authentication > Settings > Authorized domains and add '${host}'.`;
    } else if (error.code === 'auth/operation-not-allowed') {
      friendlyMessage = 'Google Sign-in is not enabled in Firebase Console. Go to Authentication > Sign-in method > Google, enable it, and make sure a Project support email is selected.';
    } else if (error.code === 'auth/popup-blocked') {
      friendlyMessage = 'The Google sign-in popup was blocked by your browser. Please allow popups for this site or use the redirect sign-in option below.';
    } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      friendlyMessage = 'Sign-in popup was closed before authentication finished. If your browser blocks popups or cookies, please use the redirect sign-in option below.';
    } else if (error.code === 'auth/network-request-failed') {
      friendlyMessage = 'Network connection failed. Please verify your internet connection or ad-blocker privacy settings.';
    } else if (error.message) {
      friendlyMessage = error.message;
    }

    return {
      success: false,
      error: friendlyMessage,
      code: error.code,
      domain: host,
    };
  }
}

/**
 * Requests scoped Google Drive access (https://www.googleapis.com/auth/drive.file)
 * to save research notebook PDFs directly into the investigator's personal Google Drive.
 */
export async function requestGoogleDriveAccess(): Promise<{ success: boolean; token?: string; error?: string }> {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    return { success: false, error: 'Firebase is not initialized.' };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.setCustomParameters({ prompt: 'consent' });
    const cred = await signInWithPopup(currentAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(cred);
    const token = credential?.accessToken;

    if (token) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('repurpose_drive_access_token', token);
        localStorage.setItem('repurpose_drive_access_token', token);
      }
      return { success: true, token };
    }
    return { success: false, error: 'Could not obtain Google Drive access token.' };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Drive access request error:', error);
    return {
      success: false,
      error: error.message || 'Google Drive authorization request was cancelled.',
    };
  }
}

export async function signInWithGoogleRedirect(): Promise<{ success: boolean; error?: string }> {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    return {
      success: false,
      error: 'Firebase is not initialized. Please ensure NEXT_PUBLIC_FIREBASE_* environment variables are set.',
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithRedirect(currentAuth, provider);
    return { success: true };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase Google Redirect Sign-In error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initiate redirect sign-in.',
    };
  }
}

export async function checkRedirectResult(): Promise<GoogleSignInResult | null> {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) return null;

  try {
    const cred = await getRedirectResult(currentAuth);
    if (!cred || !cred.user) return null;

    const userProfile = {
      uid: cred.user.uid,
      displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Researcher',
      email: cred.user.email,
      isAnonymous: false,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));
      const credential = GoogleAuthProvider.credentialFromResult(cred);
      if (credential?.accessToken) {
        sessionStorage.setItem('repurpose_drive_access_token', credential.accessToken);
        localStorage.setItem('repurpose_drive_access_token', credential.accessToken);
      }
      window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: userProfile }));
    }

    return {
      success: true,
      user: {
        uid: cred.user.uid,
        displayName: cred.user.displayName,
        email: cred.user.email,
      },
    };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.warn('Redirect result check warning:', error);
    return null;
  }
}

export async function signOutUser(): Promise<void> {
  const currentAuth = getFirebaseAuth();
  if (currentAuth) {
    try {
      await fbSignOut(currentAuth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_USER_KEY);
    sessionStorage.removeItem('repurpose_drive_access_token');
    localStorage.removeItem('repurpose_drive_access_token');
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: null }));
  }
}

export function subscribeToAuth(callback: (user: { uid: string; isAnonymous: boolean; displayName: string | null; email?: string | null } | null) => void) {
  const currentAuth = getFirebaseAuth();
  if (currentAuth) {
    const unsub = onAuthStateChanged(currentAuth, (user: User | null) => {
      if (user) {
        const profile = {
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          displayName: user.displayName,
          email: user.email,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        }
        callback(profile);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LOCAL_USER_KEY);
        }
        callback(null);
      }
    });
    return unsub;
  }

  // Local fallback
  if (typeof window !== 'undefined') {
    callback(getLocalUser());
    const customHandler = (e: Event) => {
      callback((e as CustomEvent).detail);
    };
    window.addEventListener(AUTH_CHANGED_EVENT, customHandler);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, customHandler);
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

  const currentDb = getFirebaseDb();
  if (currentDb && isFirebaseConfigured) {
    try {
      const ref = doc(currentDb, 'users', userId, 'saved_drugs', id);
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
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const currentDb = getFirebaseDb();
  if (currentDb && isFirebaseConfigured) {
    try {
      const q = query(collection(currentDb, 'users', userId, 'saved_drugs'), orderBy('lastUpdated', 'desc'));
      const snap = await getDocs(q);
      const items: SavedResearchItem[] = [];
      for (const docSnap of snap.docs) {
        const data = docSnap.data() as SavedResearchItem;
        const savedTime = new Date(data.savedAt).getTime();
        // If older than 30 days, purge from database
        if (!isNaN(savedTime) && now - savedTime > maxAgeMs) {
          try {
            await deleteDoc(docSnap.ref);
          } catch {
            // ignore cleanup errors
          }
        } else {
          items.push(data);
        }
      }
      return items;
    } catch (err) {
      console.warn('Firestore read error, falling back to local:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_SAVED_KEY);
      if (!stored) return [];
      const parsed: SavedResearchItem[] = JSON.parse(stored);
      const active = parsed.filter(item => {
        const itemTime = new Date(item.savedAt).getTime();
        return isNaN(itemTime) || now - itemTime <= maxAgeMs;
      });
      if (active.length !== parsed.length) {
        localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(active));
      }
      return active;
    } catch {
      return [];
    }
  }
  return [];
}

export async function deleteSavedDrug(userId: string, itemId: string): Promise<boolean> {
  const currentDb = getFirebaseDb();
  if (currentDb && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(currentDb, 'users', userId, 'saved_drugs', itemId));
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

  const currentDb = getFirebaseDb();
  if (currentDb && isFirebaseConfigured) {
    try {
      const ref = doc(currentDb, 'users', userId, 'searches', item.id);
      await setDoc(ref, item);
      return;
    } catch {
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
  const currentDb = getFirebaseDb();
  if (currentDb && isFirebaseConfigured) {
    try {
      const q = query(collection(currentDb, 'users', userId, 'searches'), orderBy('timestamp', 'desc'), limit(8));
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
