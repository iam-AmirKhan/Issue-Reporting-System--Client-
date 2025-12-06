// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7rujF1nPWNunelvWoQbR7K4qhd_yAOq0",
  authDomain: "public-issue-system.firebaseapp.com",
  projectId: "public-issue-system",
  storageBucket: "public-issue-system.firebasestorage.app",
  messagingSenderId: "1076778048580",
  appId: "1:1076778048580:web:19d6f57be02034a449b011"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);