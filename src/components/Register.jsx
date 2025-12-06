import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { registerWithPhoto } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!form.name.trim()) return Swal.fire("Error", "Please provide your name", "error");
    if (!form.email.trim()) return Swal.fire("Error", "Please provide your email", "error");
    if (!form.password || form.password.length < 6)
      return Swal.fire("Error", "Password must be at least 6 characters", "error");

    setSubmitting(true);

    try {
      await registerWithPhoto(form.name.trim(), form.email.trim(), form.password, photoFile);
      Swal.fire("Success", "Registration successful", "success");
      navigate("/profile");
    } catch (err) {
      // show friendly error
      const message = err?.message || "Registration failed";
      Swal.fire("Error", message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          <span className="text-sm">Name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Full name"
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="you@example.com"
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="At least 6 characters"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Photo (optional)</span>
          <input type="file" accept="image/*" onChange={handleFile} className="w-full mt-1" />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
