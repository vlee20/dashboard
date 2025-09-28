import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0SUQek71pYE8rSxGTV7n1V14GcW_66qw",
  authDomain: "dashboard-b8464.firebaseapp.com",
  projectId: "dashboard-b8464",
  storageBucket: "dashboard-b8464.firebasestorage.app",
  messagingSenderId: "28721931250",
  appId: "1:28721931250:web:0f925b023d4efd28bd416b",
  measurementId: "G-P4LP1KC1RX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    const col = collection(db, "monthlyExpense_2025");
    const q = query(col, orderBy("monthIndex"));
    const snapshot = await getDocs(q);

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
    const batch = writeBatch(db);
    Object.entries(monthMap).forEach(([rawMonthName, categories]) => {
      // Normalize case/whitespace to match our months list
      const monthName = String(rawMonthName || "").trim();
      const monthIndex = months.findIndex(
        (m) => m.toLowerCase() === monthName.toLowerCase()
      ); // -1 if not found
      const data = {
        month: monthName,
        monthIndex: monthIndex === -1 ? null : monthIndex + 1,
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
