import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
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
    const snapshot = await getDocs(col);
    const results = snapshot.docs.map((doc) => {
      const data = doc.data();
      const dataId = doc.id; // e.g., "January"
      const monthIndex = months.indexOf(dataId);
      if (monthIndex !== -1) {
        // Place data in the correct month position
        placeHolderData[monthIndex] = { month: dataId, ...data };
      }
      //   console.log("Document data:", data);
      return {
        // food: data.Food || 0,
        // charging: data.Charging || 0, // or data.finance based on your Firestore field
        ...placeHolderData[monthIndex],
      };
    });
    // console.log("Fetched monthly expenses:", results);
    return results;
    // optional: keep original month order if your collection is unsorted
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
    Object.entries(monthMap).forEach(([monthName, categories]) => {
      const monthIndex = months.indexOf(monthName); // -1 if not found
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
