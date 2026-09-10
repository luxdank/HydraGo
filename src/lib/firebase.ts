import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocFromServer,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';
import { ASSETS } from '../data/mockData';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID from config
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Connection test as mandated by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Firestore connected successfully to database:', firebaseConfig.firestoreDatabaseId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client appears offline, will sync when reconnected.');
    } else {
      console.log('[Firebase] Test doc ping returned:', error);
    }
    return false;
  }
}

// Ensure anonymous authentication so user is authenticated
export async function ensureAuthUser(): Promise<FirebaseUser | null> {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          console.warn('[Firebase] Anonymous auth failed:', err);
          resolve(null);
        }
      }
    });
  });
}

// Sync user profile to Firestore
export async function syncUserProfileToFirebase(user: UserProfile): Promise<void> {
  try {
    const currentUid = auth.currentUser?.uid || 'guest_user';
    const userRef = doc(db, 'users', currentUid);
    await setDoc(
      userRef,
      {
        ...user,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[Firebase] Failed to sync user profile:', err);
  }
}

// Load user profile from Firestore if exists
export async function loadUserProfileFromFirebase(): Promise<Partial<UserProfile> | null> {
  try {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return null;
    const userRef = doc(db, 'users', currentUid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
  } catch (err) {
    console.warn('[Firebase] Failed to load user profile:', err);
  }
  return null;
}

export interface StoredIntakeRecord {
  id?: string;
  userId: string;
  amountMl: number;
  liquidType: string;
  bottleCapacityMl?: number;
  liquidLevel?: string;
  aiConfidence?: number;
  aiNotes?: string;
  photo1Url?: string;
  photo2Url?: string;
  photoNumberToday: number;
  createdAt: string;
}

// Save intake record to Firestore subcollection
export async function saveIntakeRecordToFirebase(
  record: Omit<StoredIntakeRecord, 'userId' | 'createdAt'>
): Promise<string | null> {
  try {
    const currentUid = auth.currentUser?.uid || 'guest_user';
    const intakesCol = collection(db, 'users', currentUid, 'intakes');
    const docRef = await addDoc(intakesCol, {
      ...record,
      userId: currentUid,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('[Firebase] Failed to save intake record:', err);
    return null;
  }
}

// Convert Firebase Auth error codes to user-friendly messages in Portuguese
export function getFriendlyAuthErrorMessage(errorCodeOrMsg: string): string {
  if (!errorCodeOrMsg) return 'Ocorreu um erro inesperado. Tente novamente.';
  
  if (errorCodeOrMsg.includes('auth/email-already-in-use')) {
    return 'Este e-mail já está cadastrado. Você pode fazer login na sua conta existente.';
  }
  if (errorCodeOrMsg.includes('auth/invalid-email')) {
    return 'O formato do e-mail é inválido. Verifique se digitou corretamente.';
  }
  if (errorCodeOrMsg.includes('auth/weak-password')) {
    return 'A senha é muito fraca. Digite pelo menos 6 caracteres.';
  }
  if (errorCodeOrMsg.includes('auth/wrong-password') || errorCodeOrMsg.includes('auth/user-not-found') || errorCodeOrMsg.includes('auth/invalid-credential')) {
    return 'E-mail ou senha incorretos. Por favor, verifique suas credenciais.';
  }
  if (errorCodeOrMsg.includes('auth/too-many-requests')) {
    return 'Muitas tentativas consecutivas. Aguarde alguns instantes antes de tentar novamente.';
  }
  if (errorCodeOrMsg.includes('auth/network-request-failed')) {
    return 'Falha na conexão com a internet. Verifique sua rede.';
  }
  if (errorCodeOrMsg.includes('auth/popup-closed-by-user')) {
    return 'A janela do Google foi fechada antes de concluir o login.';
  }
  if (errorCodeOrMsg.includes('auth/popup-blocked')) {
    return 'O pop-up de login do Google foi bloqueado pelo navegador. Por favor, permita pop-ups para este site.';
  }
  if (errorCodeOrMsg.includes('auth/cancelled-popup-request')) {
    return 'Solicitação de login cancelada. Tente novamente.';
  }
  if (errorCodeOrMsg.includes('auth/operation-not-allowed')) {
    return 'O login com o Google ainda não foi ativado no console do Firebase.';
  }

  return 'Não foi possível concluir a operação. Verifique seus dados e tente novamente.';
}

export interface RegisterUserParams {
  email: string;
  password: string;
  name: string;
  age?: number;
}

// Register user in Firebase Auth with Email and Password & persist profile to Firestore
export async function registerWithEmailPassword({
  email,
  password,
  name,
  age = 25,
}: RegisterUserParams): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = userCredential.user;

  // Update Auth Profile Display Name
  try {
    await updateProfile(fbUser, { displayName: name.trim() });
  } catch (err) {
    console.warn('[Firebase] Failed to update displayName in auth:', err);
  }

  // Create clean initial profile
  const profile: UserProfile = {
    name: name.trim() || 'Usuário HidraGo',
    age: Number(age) || 25,
    email: email.trim(),
    level: 1,
    levelTitle: 'Iniciante Hidratado',
    currentXp: 50,
    maxXp: 300,
    points: 50,
    streakDays: 1,
    completedChallenges: 0,
    savedCoupons: 0,
    dailyGoalMl: 3000,
    currentIntakeMl: 0,
    defaultBottleMl: 500,
    defaultBottleName: 'Garrafa Padrão',
    avatarUrl: ASSETS.mascotAvatar,
  };

  // Sync to Firestore under users/{uid}
  try {
    const userRef = doc(db, 'users', fbUser.uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Firebase] Could not save initial profile document in firestore:', err);
  }

  return { user: fbUser, profile };
}

export interface LoginUserParams {
  email: string;
  password: string;
}

// Sign in existing user with Email and Password from Firebase Auth
export async function loginWithEmailPassword({
  email,
  password,
}: LoginUserParams): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = userCredential.user;

  // Attempt to load profile from Firestore
  let profile = await loadUserProfileFromFirebase();

  if (!profile || !profile.name) {
    // If not found in Firestore yet, synthesize baseline profile
    const synthesizedProfile: UserProfile = {
      name: fbUser.displayName || email.split('@')[0] || 'Usuário HidraGo',
      email: email.trim(),
      level: 1,
      levelTitle: 'Iniciante Hidratado',
      currentXp: 50,
      maxXp: 300,
      points: 50,
      streakDays: 1,
      completedChallenges: 0,
      savedCoupons: 0,
      dailyGoalMl: 3000,
      currentIntakeMl: 0,
      defaultBottleMl: 500,
      defaultBottleName: 'Garrafa Padrão',
      avatarUrl: ASSETS.mascotAvatar,
    };
    await syncUserProfileToFirebase(synthesizedProfile);
    profile = synthesizedProfile;
  }

  return { user: fbUser, profile: profile as UserProfile };
}

// Sign in with Google Auth via Firebase
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const fbUser = result.user;

  // Attempt to load existing profile from Firestore
  let profile = await loadUserProfileFromFirebase();

  if (!profile || !profile.name) {
    const synthesizedProfile: UserProfile = {
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuário Google',
      email: fbUser.email || '',
      age: 25,
      level: 1,
      levelTitle: 'Iniciante Hidratado',
      currentXp: 50,
      maxXp: 300,
      points: 50,
      streakDays: 1,
      completedChallenges: 0,
      savedCoupons: 0,
      dailyGoalMl: 3000,
      currentIntakeMl: 0,
      defaultBottleMl: 500,
      defaultBottleName: 'Garrafa Padrão',
      avatarUrl: fbUser.photoURL || ASSETS.mascotAvatar,
    };
    await syncUserProfileToFirebase(synthesizedProfile);
    profile = synthesizedProfile;
  } else if (fbUser.photoURL && profile.avatarUrl === ASSETS.mascotAvatar) {
    // If user has a real Google photo, use it
    profile.avatarUrl = fbUser.photoURL;
    await syncUserProfileToFirebase(profile as UserProfile);
  }

  return { user: fbUser, profile: profile as UserProfile };
}

// Sign out user
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('[Firebase] Error signing out:', err);
  }
}


