import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoo1mt4JqON1_EBT8fGnVxWkCLo1OdUVM",
  authDomain: "alertix-d145b.firebaseapp.com",
  projectId: "alertix-d145b",
  storageBucket: "alertix-d145b.appspot.com", // ✅ แก้ให้ถูก
  messagingSenderId: "1041231552375",
  appId: "1:1041231552375:web:bbaa4b9bea56c13bd2cb72",
  measurementId: "G-R261BHQ2JP"
};

// ✅ สร้างหรือใช้งาน Firebase app เดิม
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ สร้าง service ที่ต้องใช้
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db,  app , provider};
