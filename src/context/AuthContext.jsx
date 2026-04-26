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
import api from "../api/axiosConfig";
export const AuthContext = createContext();

function normalizeFirebaseUser(fbUser) {
  if (!fbUser) return null;
  return {
    id: fbUser.uid || fbUser.id || fbUser.userId,
    uid: fbUser.uid || fbUser.id || fbUser.userId,
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
    uid: firebaseUser.uid || firebaseUser.id,
    photoURL: appUser.photoURL || firebaseUser.photoURL || "",
    role: appUser.role || firebaseUser.role || "citizen",
    isBlocked: !!(appUser.isBlocked || appUser.blocked),
    blocked: !!(appUser.isBlocked || appUser.blocked),
  };
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // normalized user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        try { localStorage.removeItem("user"); } catch { /* storage cleanup is best effort */ }
        setLoading(false);
        return;
      }
      const normalized = normalizeFirebaseUser(fbUser);
      let appUser = normalized;
      try {
        const { data } = await api.get("/api/users/me");
        appUser = mergeAppUser(normalized, data);
      } catch (err) {
        console.warn("[Auth] backend profile fetch failed", err);
      }
      setUser(appUser);
      try { localStorage.setItem("user", JSON.stringify(appUser)); } catch (err) { console.warn(err); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Robust register with photo (safe logs + fallback)
  const registerWithPhoto = async (name, email, password, photoFile) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user?.uid;
      console.log("[Auth] created user uid=", uid);

      // debug: show what SDK thinks the bucket is
      try { console.log("[Storage] SDK storageBucket:", storage?.app?.options?.storageBucket); } catch { /* debug log is best effort */ }

      let photoURL = "";

      if (photoFile && uid) {
        try {
          const safeName = `${Date.now()}-${photoFile.name.replace(/\s+/g, "_")}`;
          const storageRef = ref(storage, `users/${uid}/${safeName}`);
          const uploadTask = uploadBytesResumable(storageRef, photoFile);

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                console.log(`[Upload] ${pct}%`);
              },
              (error) => {
                console.error("[Upload] failed", error);
                reject(error);
              },
              async () => {
                try {
                  const dl = await getDownloadURL(uploadTask.snapshot.ref);
                  console.log("[Upload] completed:", dl);
                  photoURL = dl;
                  resolve(dl);
                } catch (err) {
                  console.error("[Upload] getDownloadURL failed", err);
                  reject(err);
                }
              }
            );
          });
        } catch (uploadErr) {
          console.error("[registerWithPhoto] upload error (falling back):", uploadErr);
          photoURL = "";
        }
      }

      // update profile (best-effort)
      try {
        await updateProfile(result.user, { displayName: name, photoURL: photoURL || null });
      } catch (e) {
        console.warn("[Auth] updateProfile failed", e);
      }

      // send to backend (best-effort)
      try {
        const { data } = await api.post("/api/users", {
          uid,
          name,
          email: result.user.email,
          photoURL: photoURL || result.user.photoURL || "",
          role: "citizen",
        });
        const savedUser = data?.user || data?.data;
        if (savedUser) {
          const merged = mergeAppUser(normalizeFirebaseUser(result.user), savedUser);
          setUser(merged);
          try { localStorage.setItem("user", JSON.stringify(merged)); } catch (err) { console.warn(err); }
          return merged;
        }
      } catch (err) {
        console.warn("[Backend] save user failed", err);
      }

      const normalized = {
        id: uid,
        name,
        email: result.user.email,
        photoURL: photoURL || result.user.photoURL || "",
        role: "citizen",
      };
      setUser(normalized);
      try { localStorage.setItem("user", JSON.stringify(normalized)); } catch (err) { console.warn(err); }
      return normalized;
    } catch (err) {
      console.error("[registerWithPhoto] unexpected error:", err);
      throw err;
    }
  };

  // login and persist normalized user
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    let normalized = normalizeFirebaseUser(cred.user);
    try {
      const { data } = await api.get("/api/users/me");
      normalized = mergeAppUser(normalized, data);
    } catch (err) {
      console.warn("[Auth] backend profile fetch failed", err);
    }
    setUser(normalized);
    try { localStorage.setItem("user", JSON.stringify(normalized)); } catch { /* local cache is best effort */ }
    return cred;
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const fbUser = res.user;
    const normalized = normalizeFirebaseUser(fbUser);

    try {
      const { data } = await api.post("/api/users", {
        uid: fbUser.uid,
        name: fbUser.displayName || "",
        email: fbUser.email,
        photoURL: fbUser.photoURL || "",
        role: "citizen",
      });
      const savedUser = data?.user || data?.data;
      if (savedUser) {
        const merged = mergeAppUser(normalized, savedUser);
        setUser(merged);
        try { localStorage.setItem("user", JSON.stringify(merged)); } catch { /* local cache is best effort */ }
        return res;
      }
    } catch (err) {
      console.warn("Failed to save Google user to backend:", err);
    }

    setUser(normalized);
    try { localStorage.setItem("user", JSON.stringify(normalized)); } catch { /* local cache is best effort */ }
    return res;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      try { localStorage.removeItem("user"); } catch { /* storage cleanup is best effort */ }
    }
  };

  // export both names to avoid breakage if other parts call logOut
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        registerWithPhoto,
        login,
        loginWithGoogle,
        logout,
        logOut: logout, // alias for older code
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
