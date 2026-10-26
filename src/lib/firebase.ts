import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Initial Boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or configuration unreachable.');
      return false;
    }
    // Permission denied on test/connection is normal because rules deny it; means network reached Firestore!
    return true;
  }
}

// Auth Helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Sync user profile to Firestore
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(
        userRef,
        {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous Explorer',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      // Non-fatal profile sync
      console.warn('Could not sync user profile document:', e);
    }
    return user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

// Database Helpers for Saved Formulas
export interface StoredFormula {
  id: string;
  userId: string;
  title: string;
  normalizedHappiness: number;
  allostaticLoad: number;
  archetypeTitle?: string;
  variablesSnapshot: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function saveUserFormula(
  userId: string,
  title: string,
  normalizedHappiness: number,
  allostaticLoad: number,
  archetypeTitle: string,
  variablesSnapshot: string
): Promise<string> {
  const formulaId = `formula_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `savedFormulas/${formulaId}`;
  try {
    const docRef = doc(db, 'savedFormulas', formulaId);
    await setDoc(docRef, {
      id: formulaId,
      userId,
      title,
      normalizedHappiness,
      allostaticLoad,
      archetypeTitle,
      variablesSnapshot,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return formulaId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function loadUserSavedFormulas(userId: string): Promise<StoredFormula[]> {
  const path = 'savedFormulas';
  try {
    const q = query(collection(db, 'savedFormulas'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list: StoredFormula[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as StoredFormula);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteUserSavedFormula(formulaId: string): Promise<void> {
  const path = `savedFormulas/${formulaId}`;
  try {
    await deleteDoc(doc(db, 'savedFormulas', formulaId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
