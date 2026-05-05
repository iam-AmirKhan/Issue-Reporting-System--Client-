import React, { createContext, useEffect, useState } from "react";
import { auth, googleProvider, storage } from "../../firebase.config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import api from "../api/axiosConfig";

export const AuthContext = createContext();

function normalizeFirebaseUser(fbUser) {
  if (!fbUser) return null;
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    _id: fbUser._id,
    name: fbUser.displayName || fbUser.name || "",
    email: fbUser.email || "",
    photoURL: fbUser.photoURL || "",
    role: fbUser.role || "citizen",
    isPremium: !!fbUser.isPremium,
    isBlocked: !!(fbUser.isBlocked || fbUser.blocked),
    blocked: !!(fbUser.isBlocked || fbUser.blocked),
  };
}

function mergeAppUser(firebaseUser, appUser) {
  if (!appUser) return firebaseUser;
  return {
    ...firebaseUser,
    ...appUser,
    id: appUser.id || appUser._id || firebaseUser.id,
    uid: firebaseUser.uid,
    photoURL: appUser.photoURL || firebaseUser.photoURL || "",
    role: appUser.role || firebaseUser.role || "citizen",
    isBlocked: !!(appUser.isBlocked || appUser.blocked),
    blocked: !!(appUser.isBlocked || appUser.blocked),
  };
}

async function syncUserWithBackend(fbUser) {
  const normalized = normalizeFirebaseUser(fbUser);
  console.log("[Auth] syncUserWithBackend for:", fbUser.email);
  try {
    const { data } = await api.post("/api/users", {
      uid: fbUser.uid,
      name: fbUser.displayName || "",
      email: fbUser.email,
      photoURL: fbUser.photoURL || "",
      role: "citizen",
    });
    const savedUser = data?.user || data?.data;
    console.log("[Auth] backend POST /api/users response:", savedUser);
    if (savedUser?.role) return mergeAppUser(normalized, savedUser);
  } catch (err) {
    console.warn("[Auth] POST /api/users failed:", err.message);
  }
  try {
    const { data } = await api.get("/api/users/me");
    console.log("[Auth] GET /api/users/me response:", data);
    return mergeAppUser(normalized, data);
  } catch (err) {
    console.warn("[Auth] GET /api/users/me failed:", err.message);
    return normalized;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const init = async () => {
      // First check if we're returning from a Google redirect
      try {
        console.log("[Auth] Checking getRedirectResult...");
        const result = await getRedirectResult(auth);
        console.log("[Auth] getRedirectResult:", result);
        if (result?.user) {
          console.log("[Auth] Google redirect user found:", result.user.email);
          const appUser = await syncUserWithBackend(result.user);
          console.log("[Auth] synced user:", appUser);
          setUser(appUser);
          try { localStorage.setItem("user", JSON.stringify(appUser)); } catch { /* best effort */ }
          setLoading(false);
        }
      } catch (err) {
        console.error("[Auth] getRedirectResult error:", err.code, err.message);
      }

      // Always listen for auth state changes
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        console.log("[Auth] onAuthStateChanged fired, fbUser:", fbUser?.email || null);
        if (!fbUser) {
          setUser(null);
          try { localStorage.removeItem("user"); } catch { /* best effort */ }
          setLoading(false);
          return;
        }
        const appUser = await syncUserWithBackend(fbUser);
        console.log("[Auth] final appUser:", appUser);
        setUser(appUser);
        try { localStorage.setItem("user", JSON.stringify(appUser)); } catch { /* best effort */ }
        setLoading(false);
      });
    };

    init();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const registerWithPhoto = async (name, email, password, photoFile) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user?.uid;
      let photoURL = "";

      if (photoFile && uid) {
        try {
          const safeName = `${Date.now()}-${photoFile.name.replace(/\s+/g, "_")}`;
          const storageRef = ref(storage, `users/${uid}/${safeName}`);
          const uploadTask = uploadBytesResumable(storageRef, photoFile);
          await new Promise((resolve, reject) => {
            uploadTask.on("state_changed", null,
              (error) => reject(error),
              async () => {
                try { photoURL = await getDownloadURL(uploadTask.snapshot.ref); resolve(); }
                catch (err) { reject(err); }
              }
            );
          });
        } catch (uploadErr) {
          console.error("[registerWithPhoto] upload error:", uploadErr);
          photoURL = "";
        }
      }

      try {
        await updateProfile(result.user, { displayName: name, photoURL: photoURL || null });
      } catch (e) {
        console.warn("[Auth] updateProfile failed", e);
      }

      const appUser = await syncUserWithBackend({ ...result.user, displayName: name, photoURL });
      setUser(appUser);
      try { localStorage.setItem("user", JSON.stringify(appUser)); } catch { /* best effort */ }
      return appUser;
    } catch (err) {
      console.error("[registerWithPhoto] unexpected error:", err);
      throw err;
    }
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const appUser = await syncUserWithBackend(cred.user);
    setUser(appUser);
    try { localStorage.setItem("user", JSON.stringify(appUser)); } catch { /* best effort */ }
    return cred;
  };

  const loginWithGoogle = async () => {
    googleProvider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(auth, googleProvider);
    // Page redirects to Google — onAuthStateChanged + getRedirectResult handle the return
  };

  const logout = async () => {
    try { await signOut(auth); }
    finally {
      setUser(null);
      try { localStorage.removeItem("user"); } catch { /* best effort */ }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, registerWithPhoto, login, loginWithGoogle, logout, logOut: logout }}>
      {children}
    </AuthContext.Provider>
  );
}
