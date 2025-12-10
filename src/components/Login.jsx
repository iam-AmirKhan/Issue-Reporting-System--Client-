// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const [info, setInfo] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setInfo({ ...info, [e.target.name]: e.target.value });

  // helper to persist minimal normalized user shape if auth returns raw
  const persistUser = (rawUser) => {
    if (!rawUser) return;
    const normalized = {
      id: rawUser.id || rawUser.uid || rawUser._id || rawUser.userId || rawUser.email,
      name: rawUser.name || rawUser.displayName || rawUser.fullName || "",
      email: rawUser.email || "",
      role: rawUser.role || "citizen",
      contact: rawUser.contact || "",
      token: rawUser.token || rawUser.accessToken || null,
    };
    try { localStorage.setItem("user", JSON.stringify(normalized)); } catch {}
    return normalized;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!info.email || !info.password) return Swal.fire("Error", "Please enter email and password", "error");
    setLoading(true);
    try {
      const authResult = await login(info.email, info.password);

      const returnedUser =
        authResult && (authResult.user || authResult) ? (authResult.user || authResult) : null;

      if (returnedUser) {
        persistUser(returnedUser);
      } else {
        persistUser({ email: info.email, id: info.email });
      }

      Swal.fire("Success", "Login successful", "success");
      navigate("/profile");
    } catch (err) {
      const code = err?.code || "";
      let message = "Login failed";
      if (code.includes("user-not-found")) message = "User not found. Please register first.";
      else if (code.includes("wrong-password")) message = "Incorrect password. Try again.";
      else if (code.includes("too-many-requests")) message = "Too many failed attempts. Try later.";
      else message = err?.message || message;
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const authResult = await loginWithGoogle();
      const returnedUser = authResult && (authResult.user || authResult) ? (authResult.user || authResult) : null;
      if (returnedUser) persistUser(returnedUser);
      Swal.fire("Success", "Google sign-in successful", "success");
      navigate("/profile");
    } catch (err) {
      Swal.fire("Error", err?.message || "Google sign-in failed", "error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>

      <form onSubmit={handleEmailLogin}>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input
            name="email"
            type="email"
            value={info.email}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="you@example.com"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input
            name="password"
            type="password"
            value={info.password}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Your password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded mb-3"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={handleGoogle}
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
