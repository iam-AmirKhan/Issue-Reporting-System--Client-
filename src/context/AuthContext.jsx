import React, { createContext, useEffect, useState } from "react";
import { auth, googleProvider, storage } from "../../firebase.config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // register with optional photo file
  const registerWithPhoto = async (name, email, password, photoFile) => {
    // 1) create auth user
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // 2) if photoFile exists upload to storage and get URL
    let photoURL = "";
    if (photoFile) {
      const storageRef = ref(storage, `users/${result.user.uid}/${photoFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, photoFile);
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          () => {},
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            photoURL = url;
            resolve();
          }
        );
      });
    }

    // 3) update firebase profile
    await updateProfile(result.user, { displayName: name, photoURL: photoURL || null });

    // 4) send to backend to save user record (no email verification)
    try {
      await axios.post("/api/users", {
        uid: result.user.uid,
        name,
        email: result.user.email,
        photoURL: photoURL || result.user.photoURL || "",
        role: "citizen",
      });
    } catch (err) {
      // backend failure shouldn't block auth; just log
      console.error("Failed to save user to backend:", err);
    }

    return result.user;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);

    // after google sign-in, ensure backend has user record
    const u = res.user;
    try {
      await axios.post("/api/users", {
        uid: u.uid,
        name: u.displayName || "",
        email: u.email,
        photoURL: u.photoURL || "",
        role: "citizen",
      });
    } catch (err) {
      console.error("Failed to save Google user to backend:", err);
    }

    return res;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        registerWithPhoto,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
