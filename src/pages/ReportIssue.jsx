import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ReportIssue() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [canCreate, setCanCreate] = useState(true);

  useEffect(()=> {
    // check user's issue count
    axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/issues/my`).then(r=>{
      const count = r.data.issues?.length || 0;
      setCanCreate(count < 3); // client simple check; server authoritative
    });
  },[]);

  async function submit() {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/issues`, { title, description: desc, category: "general" });
      location.href = "/dashboard/my-issues";
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h3 className="font-semibold mb-4">Report Issue</h3>
      <input className="w-full p-2 border rounded mb-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
      <textarea className="w-full p-2 border rounded mb-2" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" />
      <button disabled={!canCreate} onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">{canCreate ? "Submit" : "Subscribe to submit more"}</button>
    </div>
  );
}
