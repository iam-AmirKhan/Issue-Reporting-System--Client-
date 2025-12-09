import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function fetchIssues() {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const res = await axios.get(`${base}/api/admin/issues`);
  return res.data;
}
async function fetchStaff() {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const res = await axios.get(`${base}/api/admin/users`); // reuse users route; alternatively fetch staff list separately
  return res.data;
}

export default function AdminAllIssues() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin","issues"], queryFn: fetchIssues });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showAssign, setShowAssign] = useState(false);

  const assignMutation = useMutation({
    mutationFn: ({ issueId, staffId }) => axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/admin/issues/${issueId}/assign`, { staffId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin","issues"] })
  });

  if (isLoading) return <div>Loading...</div>;
  const issues = data?.issues || [];

  return (
    <div>
      <h3 className="font-semibold mb-4">All Issues</h3>
      <div className="space-y-3">
        {issues.map(it => (
          <div key={it._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{it.title} {it.boosted && <span className="ml-2 text-xs bg-yellow-200 px-2 rounded">Boosted</span>}</div>
              <div className="text-sm text-gray-600">{it.category} • {it.status}</div>
            </div>
            <div className="flex gap-2">
              {!it.assignedTo && (
                <button onClick={() => { setSelectedIssue(it); setShowAssign(true); }} className="px-3 py-1 bg-blue-600 text-white rounded">Assign</button>
              )}
              {it.status === "pending" && (
                <button onClick={async ()=> {
                  if (!confirm("Reject this issue?")) return;
                  await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/admin/issues/${it._id}/reject`);
                  await qc.invalidateQueries({ queryKey: ["admin","issues"] });
                }} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAssign && selectedIssue && (
        <AssignModal issue={selectedIssue} onClose={()=>{setShowAssign(false); setSelectedIssue(null);}} onAssign={(staffId)=> assignMutation.mutate({ issueId: selectedIssue._id, staffId })} />
      )}
    </div>
  );
}

function AssignModal({ issue, onClose, onAssign }) {
  const { data } = useQuery({ queryKey: ["admin","staffList"], queryFn: fetchStaff });
  const staff = (data?.users || []).filter(u => u.role === "staff");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <div className="bg-white p-6 rounded w-96">
        <h4 className="font-semibold mb-3">Assign staff for: {issue.title}</h4>
        <select id="selStaff" className="w-full p-2 border rounded mb-3">
          <option value="">Select staff</option>
          {staff.map(s => <option key={s._id} value={s._id}>{s.name || s.email}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1">Cancel</button>
          <button onClick={() => {
            const sel = document.getElementById("selStaff").value;
            if (!sel) return alert("Select staff");
            onAssign(sel);
            onClose();
          }} className="px-3 py-1 bg-blue-600 text-white rounded">Assign</button>
        </div>
      </div>
    </div>
  );
}
