import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration via environment variables
// For Vite, env vars must be prefixed with VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser
  try {
    const result = await signInAnonymously(auth)
    return result.user
  } catch (err) {
    console.error("Anonymous sign-in failed:", err)
    throw err
  }
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const placeHolderData = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];

/**
 * Fetch monthly expenses from Firestore and map to the chart shape:
 * [{ month: "January", finance: 186 }, ...]
 */
export async function fetchMonthlyExpenses() {
  try {
    await ensureSignedIn()
    const col = collection(db, "monthlyExpense_2025");
    const snapshot = await getDocs(col);

    // Start with 12 slots in Jan..Dec order
    const ordered = months.map((m) => ({ month: m }));

    snapshot.docs.forEach((d) => {
      const data = d.data();
      const monthName = data.month || d.id;
      const idx = months.indexOf(monthName);
      if (idx !== -1) {
        ordered[idx] = { month: monthName, ...data };
      }
    });

    return ordered;
  } catch (err) {
    console.error("fetchMonthlyExpenses error:", err);
    return [];
  }
}

export async function uploadMonthlyExpenses(
  monthMap,
  collectionName = "monthlyExpense_2025"
) {
  try {
    await ensureSignedIn()
    const batch = writeBatch(db);
    // Override: delete all existing docs in the target collection first
    const existingSnapshot = await getDocs(collection(db, collectionName));
    existingSnapshot.forEach((d) => {
      const ref = doc(db, collectionName, d.id);
      batch.delete(ref);
    });
    Object.entries(monthMap).forEach(([rawMonthName, categories]) => {
      // Normalize case/whitespace to match our months list
      const monthName = String(rawMonthName || "").trim();
      const data = {
        month: monthName,
        ...categories, // category keys -> numeric values
      };
      const docRef = doc(db, collectionName, monthName);
      batch.set(docRef, data);
    });
    await batch.commit();
    return { success: true };
  } catch (err) {
    console.error("uploadMonthlyExpenses error:", err);
    return { success: false, error: err };
  }
}
