import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function MyIssues() {
  const qc = useQueryClient();
  const [editingIssue, setEditingIssue] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", location: "" });

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["my-issues"],
    queryFn: async () => {
      const res = await api.get("/api/issues?mine=true");
      return Array.isArray(res.data) ? res.data : (res.data.issues || res.data.data || []);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/api/issues/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-issues"] });
      Swal.fire("Deleted!", "Your issue has been deleted.", "success");
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Delete failed", "error")
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => await api.put(`/api/issues/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-issues"] });
      setEditingIssue(null);
      Swal.fire({ title: "Updated!", icon: "success", timer: 1500, showConfirmButton: false });
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Update failed", "error")
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete this issue?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const handleEditClick = (issue) => {
    setEditingIssue(issue);
    setEditForm({ title: issue.title || "", description: issue.description || "", location: issue.location || "" });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.description || !editForm.location) {
      return Swal.fire("Incomplete", "Please fill all fields.", "warning");
    }
    updateMutation.mutate({ id: editingIssue._id || editingIssue.id, payload: editForm });
  };

  if (isLoading) return <div className="animate-pulse space-y-4 pt-10 px-4">
    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
    <div className="h-64 bg-slate-100 rounded-2xl w-full"></div>
  </div>;

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">My Recorded Issues</h1>
          <p className="text-slate-500 mt-1">Manage and track the infrastructure reports you submitted.</p>
        </div>
        <Link to="/dashboard/report-issue" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm">
          + New Report
        </Link>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-3xl">
           <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
           <h3 className="text-md font-semibold text-slate-700">No issues found</h3>
           <p className="text-slate-500 mt-1 mb-4 text-sm">You haven't reported any infrastructure problems yet.</p>
           <Link to="/dashboard/report-issue" className="text-emerald-500 font-medium hover:text-emerald-600">Report your first issue →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {issues.map((issue) => (
                  <tr key={issue._id || issue.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 h-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                          <img src={issue.image || (issue.photos && issue.photos[0]?.url) || "/placeholder.png"} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="max-w-xs xl:max-w-md">
                          <div className="text-sm font-bold text-slate-800 line-clamp-1 truncate block">{issue.title}</div>
                          <div className="text-xs text-slate-500 uppercase font-semibold mt-1">{issue.category || "General"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        issue.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                        issue.status === "in_progress" || issue.status === "working" ? "bg-blue-100 text-blue-700" :
                        issue.status === "closed" ? "bg-slate-200 text-slate-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {(issue.status || "Pending").replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {issue.createdAt || issue.date ? new Date(issue.createdAt || issue.date).toLocaleDateString() : "No date"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {issue.status === "pending" && (
                          <button onClick={() => handleEditClick(issue)} className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                            Edit
                          </button>
                        )}
                        <button onClick={() => handleDelete(issue._id || issue.id)} className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">
                          Delete
                        </button>
                        <Link to={`/issue/${issue._id || issue.id}`} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors ml-2">
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal (Inline Overlay) */}
      {editingIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Edit Issue</h3>
              <button onClick={() => setEditingIssue(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title</label>
                <input name="title" value={editForm.title} onChange={(e) => setEditForm(f => ({...f, title: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-slate-700 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Location</label>
                <input name="location" value={editForm.location} onChange={(e) => setEditForm(f => ({...f, location: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-slate-700 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                <textarea rows="3" name="description" value={editForm.description} onChange={(e) => setEditForm(f => ({...f, description: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-slate-700 outline-none transition-all resize-none"></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditingIssue(null)} className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={updateMutation.isPending} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all">
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
