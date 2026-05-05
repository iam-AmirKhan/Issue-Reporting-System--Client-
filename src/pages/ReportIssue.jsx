import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import Swal from "sweetalert2";

export default function ReportIssue() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [locationName, setLocationName] = useState("");
  const [canCreate, setCanCreate] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // check user's issue count
    api
      .get("/api/issues?mine=true")
      .then((r) => {
        const count = r.data.issues?.length || 0;
        // Assuming free users are limited to 3 issues
        // The server will also check this.
        setCanCreate(count < 3); 
      })
      .catch(err => {
        console.error("Failed to fetch issue count", err);
      });
  }, []);

  async function submit() {
    if (!title || !desc || !locationName) {
      Swal.fire("Error", "Please fill all fields", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/issues", { 
        title, 
        description: desc, 
        category: "general",
        location: locationName 
      });
      
      Swal.fire({
        title: "Success",
        text: "Issue reported successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      
      navigate("/dashboard/my-issues");
    } catch (err) {
      Swal.fire({
        title: "Failed",
        text: err?.response?.data?.message || "Failed to create issue",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h3 className="text-2xl font-bold mb-6 text-slate-800">Report New Issue</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the issue?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Where is this happening?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            className="w-full p-3 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Provide more details..."
          />
        </div>

        <button
          disabled={!canCreate || loading}
          onClick={submit}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
            canCreate 
              ? "bg-blue-600 hover:bg-blue-700 shadow-md" 
              : "bg-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Submitting..." : canCreate ? "Submit Issue" : "Limit Reached (Upgrade Required)"}
        </button>
        
        {!canCreate && (
          <p className="text-sm text-red-500 mt-2 text-center">
            You have reached the limit of 3 issues for free accounts.
          </p>
        )}
      </div>
    </div>
  );
}
