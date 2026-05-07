import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function EditIssueModal({ issue, onClose }) {
  const [form, setForm] = useState({
    title: issue.title || "",
    description: issue.description || "",
    category: issue.category || "",
    location: issue.location || "",
  });

  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => await api.put(`/api/issues/${issue._id || issue.id}`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-issues"] });
      qc.invalidateQueries({ queryKey: ["issue", issue._id || issue.id] });
      Swal.fire({ title: "Updated!", icon: "success", timer: 1500, showConfirmButton: false });
      onClose();
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Update failed", "error"),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      return Swal.fire("Incomplete", "Please fill all required fields.", "warning");
    }
    updateMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-fade-up">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Edit Issue</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2.5 text-slate-700 outline-none transition-all"
              placeholder="Issue title"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2.5 text-slate-700 outline-none transition-all cursor-pointer"
            >
              <option value="">Select category...</option>
              <option value="Roads & Sidewalks">Roads & Sidewalks</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Electricity & Lighting">Electricity & Lighting</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Public Transport">Public Transport</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2.5 text-slate-700 outline-none transition-all"
              placeholder="Where is this issue?"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2.5 text-slate-700 outline-none transition-all resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {updateMutation.isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
