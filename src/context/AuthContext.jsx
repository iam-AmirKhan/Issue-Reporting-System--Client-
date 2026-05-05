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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleRedirectLoading, setGoogleRedirectLoading] = useState(false);

  useEffect(() => {
    // Check if we're returning from a Google redirect
    setGoogleRedirectLoading(true);
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const fbUser = result.user;
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
              try { localStorage.setItem("user", JSON.stringify(merged)); } catch { /* best effort */ }
            } else {
              setUser(normalized);
              try { localStorage.setItem("user", JSON.stringify(normalized)); } catch { /* best effort */ }
            }
          } catch (err) {
            console.warn("Failed to save Google redirect user to backend:", err);
            setUser(normalized);
            try { localStorage.setItem("user", JSON.stringify(normalized)); } catch { /* best effort */ }
          }
        }
      })
      .catch((err) => {
        console.warn("[Auth] getRedirectResult error:", err);
      })
      .finally(() => {
        setGoogleRedirectLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        try { localStorage.removeItem("user"); } catch { /* best effort */ }
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
            uploadTask.on(
              "state_changed",
              null,
              (error) => { console.error("[Upload] failed", error); reject(error); },
              async () => {
                try {
                  const dl = await getDownloadURL(uploadTask.snapshot.ref);
                  photoURL = dl;
                  resolve(dl);
                } catch (err) { reject(err); }
              }
            );
          });
        } catch (uploadErr) {
          console.error("[registerWithPhoto] upload error (falling back):", uploadErr);
          photoURL = "";
        }
      }

      try {
        await updateProfile(result.user, { displayName: name, photoURL: photoURL || null });
      } catch (e) {
        console.warn("[Auth] updateProfile failed", e);
      }

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
    try { localStorage.setItem("user", JSON.stringify(normalized)); } catch { /* best effort */ }
    return cred;
  };

  // Uses redirect — no popup, works on all browsers and deployed sites
  const loginWithGoogle = async () => {
    googleProvider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(auth, googleProvider);
    // Page will redirect to Google, then come back
    // getRedirectResult() in useEffect handles the result on return
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      try { localStorage.removeItem("user"); } catch { /* best effort */ }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || googleRedirectLoading,
        registerWithPhoto,
        login,
        loginWithGoogle,
        logout,
        logOut: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
