import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase config from your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyBY4qnQWvubPhwzNJ2LNTHS3KAuf3zFTe0",
  authDomain: "bill-manager-c8611.firebaseapp.com",
  projectId: "bill-manager-c8611",
  storageBucket: "bill-manager-c8611.firebasestorage.app",
  messagingSenderId: "1066214848969",
  appId: "1:1066214848969:web:6ad2e34acb5c64ecf75018",
  measurementId: "G-HHE2G0CMW9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };