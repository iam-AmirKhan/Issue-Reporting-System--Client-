import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function ManageStaff() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const emptyForm = { name: "", email: "", phone: "", photoURL: "", password: "", role: "staff" };
  const [form, setForm] = useState(emptyForm);

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      const res = await api.get("/api/staff");
      return Array.isArray(res.data) ? res.data : (res.data.staff || res.data.data || []);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
       if (editId) return await api.put(`/api/staff/${editId}`, payload);
       return await api.post("/api/staff", payload);
    },
    onSuccess: () => {
       qc.invalidateQueries({ queryKey: ["admin-staff"] });
       qc.invalidateQueries({ queryKey: ["staff"] });
       setModalOpen(false);
       setEditId(null);
       setForm(emptyForm);
       Swal.fire("Success", `Staff ${editId ? "updated" : "added"} successfully.`, "success");
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Operation failed", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/api/staff/${id}`),
    onSuccess: () => {
       qc.invalidateQueries({ queryKey: ["admin-staff"] });
       qc.invalidateQueries({ queryKey: ["staff"] });
       Swal.fire("Deleted", "Staff member removed.", "success");
    },
    onError: (err) => Swal.fire("Error", err.response?.data?.message || "Delete failed", "error")
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove Staff?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Remove"
    }).then(res => {
       if (res.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const openEdit = (s) => {
    setEditId(s._id || s.id);
    setForm({ name: s.name || "", email: s.email || "", phone: s.phone || s.contact || "", photoURL: s.photoURL || "", password: "", role: "staff" });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
     e.preventDefault();
     if(!form.name || !form.email) return Swal.fire("Required", "Name and email are required", "warning");
     if(!editId && !form.password) return Swal.fire("Required", "Password is required for new staff accounts", "warning");
     const payload = { ...form };
     if (editId && !payload.password) delete payload.password;
     saveMutation.mutate(payload);
  };

  if (isLoading) return <div className="animate-pulse space-y-4 pt-10 px-4">
    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
    <div className="h-64 bg-slate-100 rounded-2xl w-full"></div>
  </div>;

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Staff Management</h1>
          <p className="text-slate-500 mt-1">Add, update, and manage municipal worker accounts.</p>
        </div>
        
        <button 
           onClick={() => { setEditId(null); setForm(emptyForm); setModalOpen(true); }}
           className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {staffList.map((s) => (
                <tr key={s._id || s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg rounded-xl shrink-0 border border-indigo-200">
                         {s.name?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{s.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="text-sm font-medium text-slate-700">{s.phone || s.contact || "-"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-700">Active</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(s._id || s.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                   <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm">No staff members found. Add some to start assigning issues.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-up">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-lg">{editId ? "Update Staff" : "Add New Staff"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white hover:bg-rose-50 p-1 rounded-full border border-slate-200 hover:border-rose-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Staff Name</label>
                <input required name="name" value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-700 outline-none transition-all" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input required type="email" name="email" value={form.email} onChange={(e) => setForm(f => ({...f, email: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-700 outline-none transition-all" placeholder="john@infracare.gov" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                 <input name="phone" value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-700 outline-none transition-all" placeholder="+1234567890" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Photo URL</label>
                 <input name="photoURL" value={form.photoURL} onChange={(e) => setForm(f => ({...f, photoURL: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-700 outline-none transition-all" placeholder="https://example.com/photo.jpg" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{editId ? "New Password (Optional)" : "Password"}</label>
                 <input type="password" name="password" value={form.password} onChange={(e) => setForm(f => ({...f, password: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-700 outline-none transition-all" placeholder={editId ? "Leave blank to keep current password" : "Create staff login password"} />
              </div>
              
              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                  {saveMutation.isPending && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  {editId ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
