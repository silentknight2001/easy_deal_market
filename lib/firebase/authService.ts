// lib/firebase/authService.ts — client-side auth
'use client';

import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider,
  signInWithPhoneNumber, RecaptchaVerifier,
  sendEmailVerification, sendPasswordResetEmail,
  signOut, updateProfile, onAuthStateChanged,
  type User as FBUser, type ConfirmationResult, type ApplicationVerifier,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './client';
import type { User, UserRole } from '@/types';
import { getFirebaseErrorMessage } from '@/lib/utils';
import axios from 'axios';

// ── Session cookie management (HTTP-only — OWASP A02) ─────────────────────────
async function createSession(idToken: string) {
  await axios.post('/api/auth/session', { idToken }, { withCredentials: true });
}
async function destroySession() {
  await axios.post('/api/auth/logout', {}, { withCredentials: true });
}

// ── User document ─────────────────────────────────────────────────────────────
export async function getUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as User) : null;
}

async function upsertUserDoc(fbUser: FBUser, role: UserRole = 'buyer', extra?: Partial<User>) {
  const ref  = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as User;
  const data = {
    uid:             fbUser.uid,
    email:           fbUser.email,
    displayName:     fbUser.displayName,
    photoURL:        fbUser.photoURL,
    phoneNumber:     fbUser.phoneNumber,
    role,
    status:          'active',
    isEmailVerified: fbUser.emailVerified,
    isPhoneVerified: !!fbUser.phoneNumber,
    isVerifiedSeller: false,
    totalListings:   0, totalSales: 0, totalPurchases: 0,
    rating: 0, ratingCount: 0,
    loginCount: 1, failedLoginAttempts: 0, lockedUntil: null,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastLoginAt: serverTimestamp(),
    ...extra,
  };
  await setDoc(ref, data);
  return data as unknown as User;
}

// ── Email/password ─────────────────────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();
    await createSession(token);
    const user = await getUserDoc(cred.user.uid);
    if (user?.status === 'banned'     ) { await signOut(auth); await destroySession(); return { user: null, error: 'Account banned. Contact support.' }; }
    if (user?.status === 'suspended'  ) { await signOut(auth); await destroySession(); return { user: null, error: 'Account temporarily suspended.' }; }
    await updateDoc(doc(db, 'users', cred.user.uid), { lastLoginAt: serverTimestamp(), loginCount: (user?.loginCount ?? 0) + 1, failedLoginAttempts: 0 });
    return { user, error: null };
  } catch (e: unknown) {
    return { user: null, error: getFirebaseErrorMessage((e as { code?: string }).code ?? '') };
  }
}

export async function signUpWithEmail(email: string, password: string, displayName: string, role: UserRole = 'buyer') {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await sendEmailVerification(cred.user);
    const user  = await upsertUserDoc(cred.user, role, { displayName });
    const token = await cred.user.getIdToken();
    await createSession(token);
    return { user, error: null };
  } catch (e: unknown) {
    return { user: null, error: getFirebaseErrorMessage((e as { code?: string }).code ?? '') };
  }
}

// ── Google ─────────────────────────────────────────────────────────────────────
const gProvider = new GoogleAuthProvider();
gProvider.addScope('profile'); gProvider.addScope('email');

export async function signInWithGoogle() {
  try {
    const cred  = await signInWithPopup(auth, gProvider);
    const token = await cred.user.getIdToken();
    await createSession(token);
    const user  = await upsertUserDoc(cred.user);
    return { user, error: null };
  } catch (e: unknown) {
    return { user: null, error: getFirebaseErrorMessage((e as { code?: string }).code ?? '') };
  }
}

// ── Phone OTP ─────────────────────────────────────────────────────────────────
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, containerId, { size: 'invisible', callback: () => {} });
}

export async function sendPhoneOtp(phone: string, verifier: ApplicationVerifier) {
  try {
    const result = await signInWithPhoneNumber(auth, phone, verifier);
    return { confirmationResult: result, error: null };
  } catch (e: unknown) {
    return { confirmationResult: null, error: getFirebaseErrorMessage((e as { code?: string }).code ?? '') };
  }
}

export async function verifyOtp(cr: ConfirmationResult, otp: string) {
  try {
    const cred  = await cr.confirm(otp);
    const token = await cred.user.getIdToken();
    await createSession(token);
    const user  = await upsertUserDoc(cred.user);
    return { user, error: null };
  } catch {
    return { user: null, error: 'Invalid OTP. Please try again.' };
  }
}

// ── Logout ─────────────────────────────────────────────────────────────────────
export async function logOut() {
  await signOut(auth);
  await destroySession();
}

// ── Password reset (OWASP A07 — no user enumeration) ─────────────────────────
export async function resetPassword(email: string) {
  try { await sendPasswordResetEmail(auth, email); return { error: null }; }
  catch (e: unknown) { return { error: getFirebaseErrorMessage((e as { code?: string }).code ?? '') }; }
}

// ── Auth state listener ────────────────────────────────────────────────────────
export function onAuthChange(cb: (user: FBUser | null) => void) {
  return onAuthStateChanged(auth, cb);
}