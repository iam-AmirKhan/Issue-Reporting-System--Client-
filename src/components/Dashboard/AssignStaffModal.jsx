import React, { useState } from 'react';

export default function AssignStaffModal({ isOpen, onClose, staffList, onAssign, isPending }) {
  const [selectedStaffId, setSelectedStaffId] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedStaffId(""); // reset on close
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    onAssign(selectedStaffId);
  };

  // Also reset after successful assignment (isPending goes false after success)
  // Parent closes modal on success, so reset on close is sufficient

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-up">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-extrabold text-slate-800 text-lg">Assign Staff Member</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-rose-500 transition-colors bg-white hover:bg-rose-50 p-1 rounded-full border border-slate-200 hover:border-rose-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-sm text-slate-500 font-medium">
            Select a staff member from the municipal department to handle this issue.
          </p>
          
          {staffList.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-4 py-3 rounded-xl">
              No staff members found. Please add staff first from Manage Staff.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Municipal Staff</label>
              <select 
                value={selectedStaffId} 
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="">Select a staff member...</option>
                {staffList.map((staff) => (
                  <option key={staff._id || staff.id} value={staff._id || staff.id}>
                    {staff.name} — {staff.email || staff.role || "Staff"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending || !selectedStaffId} 
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
            >
              {isPending && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isPending ? "Assigning..." : "Assign Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
