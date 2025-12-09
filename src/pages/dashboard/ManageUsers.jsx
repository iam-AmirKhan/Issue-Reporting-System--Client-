import React from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchUsers() {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/admin/users`);
  return res.data;
}

export default function ManageUsers() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin","users"], queryFn: fetchUsers });

  const blockMut = useMutation({ mutationFn: (id)=> axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/admin/users/${id}/block`), onSuccess: ()=> qc.invalidateQueries({ queryKey: ["admin","users"] }) });
  const unblockMut = useMutation({ mutationFn: (id)=> axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/admin/users/${id}/unblock`), onSuccess: ()=> qc.invalidateQueries({ queryKey: ["admin","users"] }) });

  if (isLoading) return <div>Loading users...</div>;
  const users = data?.users || [];

  return (
    <div>
      <h3 className="font-semibold mb-4">Manage Citizens</h3>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{u.name || u.email} {u.isPremium && <span className="ml-2 text-xs bg-green-100 px-2 rounded">Premium</span>}</div>
              <div className="text-sm text-gray-600">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              {u.isBlocked ? (
                <button onClick={()=>unblockMut.mutate(u._id)} className="px-3 py-1 bg-green-600 text-white rounded">Unblock</button>
              ) : (
                <button onClick={()=>blockMut.mutate(u._id)} className="px-3 py-1 bg-red-600 text-white rounded">Block</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
