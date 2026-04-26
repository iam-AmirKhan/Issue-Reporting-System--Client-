import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";
import AssignStaffModal from "../../components/Dashboard/AssignStaffModal";

export default function ManageIssues() {
  const qc = useQueryClient();
  const [filterStr, setFilterStr] = useState("all");
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ["admin-manage-issues"],
    queryFn: async () => {
      const res = await api.get("/api/issues?limit=0");
      let list = Array.isArray(res.data) ? res.data : (res.data.issues || res.data.data || []);
      // sort boosted then desc
      list.sort((a,b) => {
         if(a.boosted && !b.boosted) return -1;
         if(!a.boosted && b.boosted) return 1;
         return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
      });
      return list;
    }
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await api.get("/api/staff");
      return Array.isArray(res.data) ? res.data : (res.data.staff || res.data.data || []);
    }
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, staffId }) => await api.post(`/api/issues/${id}/assign`, { staffId }),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-manage-issues"] });
      Swal.fire("Assigned", "Staff has been successfully assigned to the issue.", "success");
      setIsModalOpen(false);
      setSelectedIssueId(null);
      
      const s = staffList.find(x => x.id === variables.staffId || x._id === variables.staffId);
      // We'll trust backend timeline, but keep the success flow clean
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Failed to assign", "error")
  });

  const rejectMutation = useMutation({
    mutationFn: async (id) => await api.post(`/api/issues/${id}/reject`),
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: ["admin-manage-issues"] });
      Swal.fire("Rejected", "Issue rejected.", "success");
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Failed to reject", "error")
  });

  const openAssignModal = (id) => {
    setSelectedIssueId(id);
    setIsModalOpen(true);
  };

  const handleAssign = (staffId) => {
    if(!selectedIssueId || !staffId) return;
    assignMutation.mutate({ id: selectedIssueId, staffId });
  };

  const filteredIssues = issues.filter(x => filterStr === "all" || x.status === filterStr);

  if (issuesLoading) return <div className="animate-pulse space-y-4 pt-10 px-4">
    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
    <div className="h-64 bg-slate-100 rounded-2xl w-full"></div>
  </div>;

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Dispatch Hub</h1>
          <p className="text-slate-500 mt-1">Assign staff and manage all reported infrastructure issues.</p>
        </div>
        
        <select 
          value={filterStr} 
          onChange={(e) => setFilterStr(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 block p-2.5 outline-none shadow-sm cursor-pointer"
        >
          <option value="all">Every Issue</option>
          <option value="pending">Pending Assignment</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status & Priority</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Assignment</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredIssues.map((issue) => (
                <tr key={issue._id || issue.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 h-full">
                    <div className="flex items-center gap-3">
                      <div className="max-w-[200px] xl:max-w-[300px]">
                        <Link to={`/issue/${issue._id || issue.id}`} className="text-sm font-bold text-slate-800 line-clamp-1 block hover:text-emerald-600 transition-colors truncate">
                          {issue.title}
                        </Link>
                        <div className="text-xs text-slate-500 font-medium truncate mt-1">
                          {issue.category} • {new Date(issue.createdAt || issue.date || 0).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                       <span className={`px-2 py-0.5 text-xs font-semibold rounded shadow-sm ${
                         issue.status === "pending" ? "bg-amber-100 text-amber-700" :
                         issue.status === "in_progress" || issue.status === "working" ? "bg-blue-100 text-blue-700" :
                         issue.status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                       }`}>
                         {(issue.status || "Pending").replace("_", " ").toUpperCase()}
                       </span>
                       <div className="flex gap-1">
                         {issue.priority === "high" && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-700">Urgent</span>}
                         {issue.boosted && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-400 text-amber-950">Boosted</span>}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {issue.assignedStaff ? (
                      <div className="flex items-center gap-2">
                        <img src={issue.assignedStaff.avatar || "https://ui-avatars.com/api/?name=" + issue.assignedStaff.name} className="w-6 h-6 rounded-full" alt="" />
                        <span className="text-sm font-medium text-slate-700">{issue.assignedStaff.name}</span>
                      </div>
                    ) : (
                      <button 
                         onClick={() => openAssignModal(issue._id || issue.id)}
                         className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-colors border border-indigo-100"
                      >
                         Assign Staff
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {issue.status === "pending" && (
                         <button 
                            onClick={() => {
                               Swal.fire({
                                  title: "Reject Issue?",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#ef4444",
                                  confirmButtonText: "Reject"
                               }).then(res => {
                                  if(res.isConfirmed) rejectMutation.mutate(issue._id || issue.id);
                               });
                            }} 
                            disabled={rejectMutation.isPending}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                         >
                           Reject
                         </button>
                      )}
                      <Link to={`/issue/${issue._id || issue.id}`} className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-200">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredIssues.length === 0 && (
                <tr>
                   <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm">No issues found matching the current filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssignStaffModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffList={staffList}
        onAssign={handleAssign}
        isPending={assignMutation.isPending}
      />
    </div>
  );
}
