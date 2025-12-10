// src/firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA7rujF1nPWNunelvWoQbR7K4qhd_yAOq0",
  authDomain: "public-issue-system.firebaseapp.com",
  projectId: "public-issue-system",
  // <<-- IMPORTANT: use the exact bucket shown in Firebase Console (usually ends with .appspot.com)
  storageBucket: "public-issue-system.appspot.com",
  messagingSenderId: "1076778048580",
  appId: "1:1076778048580:web:19d6f57be02034a449b011"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export default app;
