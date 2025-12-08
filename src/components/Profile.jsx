import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 border rounded">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.displayName || "—"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.photoURL && <img src={user.photoURL} alt="avatar" className="w-24 h-24 rounded-full mt-3" />}
        </div>
      ) : (
        <p>No user data</p>
      )}
    </div>
  );
}