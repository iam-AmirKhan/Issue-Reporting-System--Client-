import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function useAuth() {
  const ctx = useContext(AuthContext);
  // fallback to localStorage user if context not ready
  let user = ctx?.user;
  if (!user) {
    try {
      const raw = localStorage.getItem("user");
      if (raw) user = JSON.parse(raw);
    } catch {
      user = null;
    }
  }
  return { user, loading: ctx?.loading };
}
