import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function AssignedIssues() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["assigned-issues"],
    queryFn: async () => {
      const res = await api.get("/api/issues/assigned");
      const list = Array.isArray(res.data) ? res.data : (res.data.issues || res.data.data || []);
      // Sort: boosted issues first, then by date desc
      return list.sort((a, b) => {
         if (a.boosted && !b.boosted) return -1;
         if (!a.boosted && b.boosted) return 1;
         return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
      });
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => await api.put(`/api/issues/${id}`, { status }),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["assigned-issues"] });
      Swal.fire({
        title: "Status Updated",
        text: `Issue marked as ${variables.status.replace("_", " ")}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      // Try to push a timeline event automatically on the backend, or we could do it here
      api.post(`/api/issues/${variables.id}/timeline`, {
         status: variables.status,
         message: `Status officially updated to ${variables.status.replace("_", " ")} by Assignee.`,
         role: "Staff"
      }).catch(err => console.error("Timeline log failed", err));
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Failed to update status", "error")
  });

  const handleStatusChange = (id, newStatus) => {
    Swal.fire({
      title: "Confirm Status Change",
      text: `Are you sure you want to change this issue to ${newStatus.replace("_", " ")}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Yes, Update it"
    }).then(result => {
      if(result.isConfirmed) {
         statusMutation.mutate({ id, status: newStatus });
      }
    });
  };

  const filteredIssues = issues.filter(issue => filterStatus === "all" || issue.status === filterStatus);

  if (isLoading) return <div className="animate-pulse space-y-4 pt-10 px-4">
    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
    <div className="h-64 bg-slate-100 rounded-2xl w-full"></div>
  </div>;

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Assigned Tasks</h1>
          <p className="text-slate-500 mt-1">Manage and resolve the infrastructure reports assigned to you.</p>
        </div>
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 block p-2.5 outline-none shadow-sm cursor-pointer"
        >
          <option value="all">Every Assigned Issue</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="working">Working</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-3xl">
           <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           <h3 className="text-md font-semibold text-slate-700">No tasks found</h3>
           <p className="text-slate-500 mt-1 mb-4 text-sm">You're all caught up! No issues match the current filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Update Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredIssues.map((issue) => (
                  <tr key={issue._id || issue.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 h-full">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0 overflow-hidden relative">
                          <img src={issue.image || (issue.photos && issue.photos[0]?.url) || "/placeholder.png"} className="w-full h-full object-cover" alt="" />
                          {issue.boosted && <div className="absolute inset-0 border-2 border-amber-400 rounded-lg"></div>}
                        </div>
                        <div className="max-w-xs xl:max-w-md">
                          <Link to={`/issue/${issue._id || issue.id}`} className="text-sm font-bold text-slate-800 line-clamp-1 truncate block hover:text-emerald-600 transition-colors">
                            {issue.title}
                          </Link>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1 truncate">
                             <span>Reported {new Date(issue.createdAt || issue.date || 0).toLocaleDateString()}</span>
                             <span>•</span>
                             <span className="truncate">{issue.location || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col gap-1.5 items-start">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                             {issue.category || "General"}
                          </span>
                          {issue.priority === "high" && (
                             <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-100 text-rose-700 animate-pulse">Urgent</span>
                          )}
                          {issue.boosted && (
                             <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-100 text-amber-700">Boosted</span>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                        issue.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                        issue.status === "working" ? "bg-indigo-100 text-indigo-700" :
                        issue.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        issue.status === "closed" ? "bg-slate-200 text-slate-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {(issue.status || "Pending").replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      
                      {/* Status Next Action Dropdown */}
                      <div className="flex items-center justify-end gap-2">
                        <select 
                           className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg focus:ring-emerald-500 block p-2 outline-none shadow-sm cursor-pointer max-w-[140px]"
                           onChange={(e) => {
                             if(e.target.value) {
                                handleStatusChange(issue._id || issue.id, e.target.value);
                                e.target.value = ""; // reset after action
                             }
                           }}
                        >
                           <option value="">Actions...</option>
                           {issue.status === "pending" && <option value="in_progress">Start Progress</option>}
                           {issue.status === "in_progress" && <option value="working">Log Working</option>}
                           {(issue.status === "in_progress" || issue.status === "working") && <option value="resolved">Mark Resolved</option>}
                           {issue.status === "resolved" && <option value="closed">Close Ticket</option>}
                        </select>
                        <Link to={`/issue/${issue._id || issue.id}`} className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200 hover:border-emerald-200">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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
    </div>
  );
}
