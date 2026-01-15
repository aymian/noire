// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdrjAKnCxAQa0w8iE-qm1TWg36Qr2PifM",
  authDomain: "noire-cb8fa.firebaseapp.com",
  projectId: "noire-cb8fa",
  storageBucket: "noire-cb8fa.firebasestorage.app",
  messagingSenderId: "993213025108",
  appId: "1:993213025108:web:ac050ad7bd40cc3e2c56c1",
  measurementId: "G-EKPCBK5KPY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
