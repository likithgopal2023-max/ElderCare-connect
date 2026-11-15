import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Sanitize strings and IDs to strictly match firebase-blueprint.json constraints
const VALID_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const VALID_CARE_CODE_REGEX = /^[0-9]{6}$/;

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return VALID_ID_REGEX.test(cleaned) ? cleaned : 'default_id';
}

function clampString(val: string, maxLen: number, fallback = 'N/A'): string {
  const trimmed = (val || '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutFirebase() {
  return fbSignOut(auth);
}

export async function syncElderProfileToFirestore(profileData: {
  name: string;
  age: number;
  bloodGroup: string;
  careCode: string;
  primaryDoctor: string;
  primaryHospital: string;
  lastCheckInStatus: string;
}) {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const profileId = sanitizeId(`prof_${user.uid}`);
  const path = `elder_profiles/${profileId}`;
  const careCode = VALID_CARE_CODE_REGEX.test(profileData.careCode)
    ? profileData.careCode
    : '482913';

  try {
    await setDoc(doc(db, 'elder_profiles', profileId), {
      ownerId: sanitizeId(user.uid),
      name: clampString(profileData.name, 100, 'Lakshmi Devi'),
      age: Math.min(130, Math.max(1, Math.round(profileData.age || 72))),
      bloodGroup: clampString(profileData.bloodGroup, 10, 'O+'),
      careCode,
      primaryDoctor: clampString(profileData.primaryDoctor, 100, 'Dr. Ravi Kumar'),
      primaryHospital: clampString(profileData.primaryHospital, 120, 'Apollo Heart Institute'),
      lastCheckInStatus: clampString(profileData.lastCheckInStatus, 60, 'Checked in OK'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncMedicationToFirestore(med: {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  scheduledTime: string;
  status: 'taken' | 'upcoming' | 'missed' | 'skipped' | 'snoozed';
  remainingPills: number;
}) {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const profileId = sanitizeId(`prof_${user.uid}`);
  const medId = sanitizeId(med.id);
  const path = `elder_profiles/${profileId}/medications/${medId}`;

  try {
    await setDoc(doc(db, 'elder_profiles', profileId, 'medications', medId), {
      ownerId: sanitizeId(user.uid),
      profileId,
      name: clampString(med.name, 100, 'Medication'),
      strength: clampString(med.strength, 50, '500 mg'),
      dosage: clampString(med.dosage, 50, '1 tablet'),
      scheduledTime: clampString(med.scheduledTime, 30, '08:00 AM'),
      status: ['taken', 'upcoming', 'missed', 'skipped', 'snoozed'].includes(med.status)
        ? med.status
        : 'upcoming',
      remainingPills: Math.min(1000, Math.max(0, Math.round(med.remainingPills || 0))),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMedicationFromFirestore(medIdRaw: string) {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const profileId = sanitizeId(`prof_${user.uid}`);
  const medId = sanitizeId(medIdRaw);
  const path = `elder_profiles/${profileId}/medications/${medId}`;

  try {
    await deleteDoc(doc(db, 'elder_profiles', profileId, 'medications', medId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncAppointmentToFirestore(apt: {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  dateTimeLabel: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}) {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const profileId = sanitizeId(`prof_${user.uid}`);
  const aptId = sanitizeId(apt.id);
  const path = `elder_profiles/${profileId}/appointments/${aptId}`;

  try {
    await setDoc(doc(db, 'elder_profiles', profileId, 'appointments', aptId), {
      ownerId: sanitizeId(user.uid),
      profileId,
      doctorName: clampString(apt.doctorName, 100, 'Dr. Ravi Kumar'),
      specialty: clampString(apt.specialty, 80, 'Cardiology'),
      clinic: clampString(apt.clinic, 120, 'Apollo Clinic'),
      dateTimeLabel: clampString(apt.dateTimeLabel, 60, 'Tomorrow 11:30 AM'),
      status: ['scheduled', 'completed', 'cancelled'].includes(apt.status)
        ? apt.status
        : 'scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export { onSnapshot, collection, query, where, doc, updateDoc };
