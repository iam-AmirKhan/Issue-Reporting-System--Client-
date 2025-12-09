import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [msg, setMsg] = useState("");

  async function save() {
    try {
      const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const res = await axios.patch(`${base}/api/users/me`, { name });
      setMsg("Profile updated");
    } catch (err) {
      setMsg("Update failed");
    }
  }

  return (
    <div>
      <h3 className="font-semibold mb-4 text-black">Profile</h3>
      <div className="max-w-md">
        <label className="block text-sm text-black">Name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full text-black p-2 border rounded mb-2" />
        <div className="flex gap-2">
          <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </div>
    </div>
  );
}
