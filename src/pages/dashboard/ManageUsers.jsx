import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function ManageUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/api/users");
      const list = Array.isArray(res.data) ? res.data : (res.data.users || res.data.data || []);
      return list.filter(u => u.role === "citizen");
    }
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ id, block }) => await api.put(`/api/users/${id}/block`, { blocked: block }),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      Swal.fire({
        title: "Success",
        text: `Citizen has been ${variables.block ? 'blocked' : 'unblocked'}.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Failed to update user", "error")
  });

  const handleToggleBlock = (id, currentStatus) => {
    const action = currentStatus ? "unblock" : "block";
    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Citizen?`,
      text: `Are you sure you want to ${action} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#10b981" : "#ef4444",
      confirmButtonText: `Yes, ${action}`
    }).then(res => {
      if(res.isConfirmed) toggleBlockMutation.mutate({ id, block: !currentStatus });
    });
  };

  const filtered = users.filter(u => 
    (u.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="animate-pulse space-y-4 pt-10 px-4">
    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
    <div className="h-64 bg-slate-100 rounded-2xl w-full"></div>
  </div>;

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Citizen Directory</h1>
          <p className="text-slate-500 mt-1">Manage public users, review subscriptions, and handle account access.</p>
        </div>
        
        <div className="relative w-full md:w-64">
           <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           <input 
             type="text" 
             placeholder="Search name or email..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full transition-all"
           />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Citizen</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subscription Tier</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Account Access</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user._id || user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0 overflow-hidden border border-slate-200">
                         {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold uppercase">{user.name?.[0] || "U"}</div>
                         )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     {user.isPremium ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 shadow-sm inline-flex items-center gap-1">
                           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                           Premium
                        </span>
                     ) : (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 shadow-sm">Free Tier</span>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     {user.blocked ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                           Blocked
                        </span>
                     ) : (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                           Active
                        </span>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button 
                        onClick={() => handleToggleBlock(user._id || user.id, user.blocked)}
                        disabled={toggleBlockMutation.isPending}
                        className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors ${
                           user.blocked 
                           ? "bg-slate-800 hover:bg-slate-700 text-white" 
                           : "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                        }`}
                     >
                       {user.blocked ? "Unblock User" : "Restrict Access"}
                     </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm">No citizens found based on the provided search query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
