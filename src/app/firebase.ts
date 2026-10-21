// src/app/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAHV_Pl3CCSCP_G5BdZwVJKH1UPx1J514",
  authDomain: "sewsera.firebaseapp.com",
  projectId: "sewsera",
  storageBucket: "sewsera.firebasestorage.app",
  messagingSenderId: "248439623928",
  appId: "1:248439623928:web:38de1aae95f97d56482b0d",
  measurementId: "G-5PQ59M7G8V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // ✅ exported