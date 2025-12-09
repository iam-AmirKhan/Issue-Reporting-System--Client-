import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchMyIssues() {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/issues/my`);
  return res.data;
}

export default function MyIssues() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["myIssues"], queryFn: fetchMyIssues });
  const [editing, setEditing] = useState(null);
  const editMut = useMutation({ mutationFn: ({ id, payload }) => axios.patch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/issues/${id}`, payload), onSuccess: ()=> qc.invalidateQueries({ queryKey: ["myIssues"] }) });
  const delMut = useMutation({ mutationFn: (id)=> axios.delete(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/issues/${id}`), onSuccess: ()=> qc.invalidateQueries({ queryKey: ["myIssues"] }) });

  if (isLoading) return <div>Loading issues...</div>;
  const issues = data?.issues || [];

  return (
    <div>
      <h3 className="font-semibold mb-4">My Issues</h3>
      <div className="space-y-3">
        {issues.length === 0 && <div>No issues yet.</div>}
        {issues.map(it => (
          <div key={it._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm text-gray-600">{it.status}</div>
            </div>
            <div className="flex gap-2">
              {it.status === "pending" && <button onClick={()=> setEditing(it)} className="px-3 py-1 bg-yellow-500 rounded">Edit</button>}
              {it.status === "pending" && <button onClick={()=> { if(confirm("Delete?")) delMut.mutate(it._id); }} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>}
              <a href={`/issues/${it._id}`} className="px-3 py-1 bg-blue-600 text-white rounded">View</a>
            </div>
          </div>
        ))}
      </div>

      {editing && <EditModal issue={editing} onClose={()=> setEditing(null)} onSave={(payload)=> { editMut.mutate({ id: editing._id, payload }); setEditing(null); }} />}
    </div>
  );
}

function EditModal({ issue, onClose, onSave }) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <div className="bg-white p-6 rounded w-96">
        <h4 className="font-semibold mb-3">Edit Issue</h4>
        <input className="w-full p-2 border rounded mb-2" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="w-full p-2 border rounded mb-2" value={description} onChange={e=>setDescription(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1">Cancel</button>
          <button onClick={()=> onSave({ title, description })} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
