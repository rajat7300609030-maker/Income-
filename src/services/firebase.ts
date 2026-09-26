import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInAnonymously,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  getDocFromServer,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Person, IncomeRecord, ExpenseRecord, PaymentRecord, RecycleBinItem, UserProfile } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with auto-detect long-polling enabled
// This provides reliable connectivity in iframes, sandboxes, and restricted networks
// while preserving full custom database ID targeting.
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Auth instance
export const auth = getAuth(app);

// Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types as defined in Firebase Skill
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Test Connection with graceful offline & unavailable handling
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const isExpectedOffline =
        error.message.includes('client is offline') ||
        error.message.includes('the client is offline') ||
        error.message.includes('unavailable') ||
        (error as { code?: string }).code === 'unavailable';
      if (isExpectedOffline) {
        console.info('Cloud Firestore: Operating in offline / local-cached mode until cloud connection is established.');
      } else {
        console.warn('Firebase connection check:', error.message);
      }
    }
    return false;
  }
}

// Trigger connection check asynchronously after a short tick
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 1000);
}

// Cloud Auth Helpers
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signInAsGuest(): Promise<FirebaseUser | null> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous Sign-In Error:', error);
    throw error;
  }
}

export async function logOutFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

// Firestore Database Sync Methods
export const FirestoreSync = {
  // Sync Person
  async savePerson(person: Person): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `persons/${person.id}`;
    try {
      await setDoc(doc(db, 'persons', person.id), {
        ...person,
        userId: currentUid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },

  async deletePerson(personId: string): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `persons/${personId}`;
    try {
      await deleteDoc(doc(db, 'persons', personId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  },

  // Sync Income
  async saveIncome(income: IncomeRecord): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `income/${income.id}`;
    try {
      await setDoc(doc(db, 'income', income.id), {
        ...income,
        userId: currentUid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },

  async deleteIncome(incomeId: string): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `income/${incomeId}`;
    try {
      await deleteDoc(doc(db, 'income', incomeId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  },

  // Sync Expense
  async saveExpense(expense: ExpenseRecord): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `expenses/${expense.id}`;
    try {
      await setDoc(doc(db, 'expenses', expense.id), {
        ...expense,
        userId: currentUid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },

  async deleteExpense(expenseId: string): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `expenses/${expenseId}`;
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  },

  // Sync Payment
  async savePayment(payment: PaymentRecord): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `payments/${payment.id}`;
    try {
      await setDoc(doc(db, 'payments', payment.id), {
        ...payment,
        userId: currentUid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },

  async deletePayment(paymentId: string): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `payments/${paymentId}`;
    try {
      await deleteDoc(doc(db, 'payments', paymentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  },

  // Sync Recycle Bin
  async saveRecycleBinItem(item: RecycleBinItem): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `recycle_bin/${item.id}`;
    try {
      await setDoc(doc(db, 'recycle_bin', item.id), {
        ...item,
        userId: currentUid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },

  async deleteRecycleBinItem(itemId: string): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;
    const docPath = `recycle_bin/${itemId}`;
    try {
      await deleteDoc(doc(db, 'recycle_bin', itemId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  },

  // Sync User Profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      // Local-only mode when unauthenticated, avoid unauthenticated permission denied noise
      return;
    }
    const docPath = `users/${currentUid}`;
    try {
      await setDoc(doc(db, 'users', currentUid), {
        ...profile,
        uid: currentUid,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  },

  async fetchUserProfile(userId?: string): Promise<UserProfile | null> {
    const targetUid = userId || auth.currentUser?.uid;
    if (!targetUid) return null;
    const docPath = `users/${targetUid}`;
    try {
      const snap = await getDoc(doc(db, 'users', targetUid));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      return null;
    }
  },

  // Sync All Data to Firestore (Cloud Backup)
  async uploadAllToCloud(data: {
    persons: Person[];
    income: IncomeRecord[];
    expenses: ExpenseRecord[];
    payments: PaymentRecord[];
    recycleBin: RecycleBinItem[];
  }): Promise<{ success: boolean; count: number }> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return { success: false, count: 0 };

    try {
      const batch = writeBatch(db);
      let count = 0;

      for (const p of data.persons) {
        batch.set(doc(db, 'persons', p.id), { ...p, userId: currentUid });
        count++;
      }
      for (const inc of data.income) {
        batch.set(doc(db, 'income', inc.id), { ...inc, userId: currentUid });
        count++;
      }
      for (const exp of data.expenses) {
        batch.set(doc(db, 'expenses', exp.id), { ...exp, userId: currentUid });
        count++;
      }
      for (const pay of data.payments) {
        batch.set(doc(db, 'payments', pay.id), { ...pay, userId: currentUid });
        count++;
      }
      for (const bin of data.recycleBin) {
        batch.set(doc(db, 'recycle_bin', bin.id), { ...bin, userId: currentUid });
        count++;
      }

      await batch.commit();
      return { success: true, count };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch_sync');
      return { success: false, count: 0 };
    }
  },

  // Download All Data from Firestore
  async fetchAllFromCloud(): Promise<{
    persons: Person[];
    income: IncomeRecord[];
    expenses: ExpenseRecord[];
    payments: PaymentRecord[];
    recycleBin: RecycleBinItem[];
  } | null> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return null;

    try {
      const personsSnap = await getDocs(query(collection(db, 'persons'), where('userId', '==', currentUid)));
      const incomeSnap = await getDocs(query(collection(db, 'income'), where('userId', '==', currentUid)));
      const expenseSnap = await getDocs(query(collection(db, 'expenses'), where('userId', '==', currentUid)));
      const paymentSnap = await getDocs(query(collection(db, 'payments'), where('userId', '==', currentUid)));
      const binSnap = await getDocs(query(collection(db, 'recycle_bin'), where('userId', '==', currentUid)));

      const persons: Person[] = [];
      personsSnap.forEach(d => persons.push(d.data() as Person));

      const income: IncomeRecord[] = [];
      incomeSnap.forEach(d => income.push(d.data() as IncomeRecord));

      const expenses: ExpenseRecord[] = [];
      expenseSnap.forEach(d => expenses.push(d.data() as ExpenseRecord));

      const payments: PaymentRecord[] = [];
      paymentSnap.forEach(d => payments.push(d.data() as PaymentRecord));

      const recycleBin: RecycleBinItem[] = [];
      binSnap.forEach(d => recycleBin.push(d.data() as RecycleBinItem));

      return { persons, income, expenses, payments, recycleBin };
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'fetchAll');
      return null;
    }
  },

  // Delete All Data from Firestore Cloud permanently
  async deleteAllFromCloud(): Promise<boolean> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return true;

    try {
      const collections = ['persons', 'income', 'expenses', 'payments', 'recycle_bin', 'transactions'];
      for (const colName of collections) {
        const snap = await getDocs(query(collection(db, colName), where('userId', '==', currentUid)));
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      }
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'deleteAllFromCloud');
      return false;
    }
  },
};
