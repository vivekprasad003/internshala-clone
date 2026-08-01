// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration (from environment variables)
const firebaseConfig = {
  apiKey: "AIzaSyBc0DRTJX4TbwejzVmt4_0qJKEANk4lL3Y",
  authDomain: "internshala-e342a.firebaseapp.com",
  projectId: "internshala-e342a",
  storageBucket: "internshala-e342a.firebasestorage.app",
  messagingSenderId: "401301713208",
  appId: "1:401301713208:web:8054e5d9fa3895a5ea11cd",
  measurementId: "G-SS01DT1YY4"
};

// Initialize Firebase (prevent duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Google Auth Provider
provider.setCustomParameters({
  prompt: "select_account",
});

export { auth, provider, db, storage };
export default app;