import React from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchAssigned() {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/staff/assigned`);
  return res.data;
}

export default function StaffAssigned() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["staff","assigned"], queryFn: fetchAssigned });
  const changeMutation = useMutation({ mutationFn: ({ id, status }) => axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/staff/issues/${id}/status`, { status }), onSuccess: ()=> qc.invalidateQueries({ queryKey: ["staff","assigned"] }) });

  if (isLoading) return <div>Loading...</div>;
  const issues = data?.issues || [];
a
  return (
    <div>
      <h3 className="font-semibold mb-4">Assigned Issues</h3>
      <div className="space-y-2">
        {issues.map(it => (
          <div key={it._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{it.title} <span className="text-sm text-gray-500">({it.status})</span></div>
              <div className="text-sm text-gray-600">{it.category}</div>
            </div>
            <div className="flex items-center gap-2">
              <select defaultValue={it.status} onChange={(e)=> { const s = e.target.value; changeMutation.mutate({ id: it._id, status: s }); }} className="p-2 border rounded">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="working">Working</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
