import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchMyIssues() {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const res = await axios.get(`${base}/api/issues/my`);
  return res.data;
}

export default function MyIssues() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["myIssues"],
    queryFn: fetchMyIssues,
    staleTime: 1000 * 60,
    retry: 1,
  });

  if (isLoading) return <div className="text-black">Loading issues...</div>;
  if (error) return <div className="text-red-600">Error loading issues</div>;

  const issues = data?.issues || [];

  return (
    <div>
      <h3 className="font-semibold text-black mb-4">My Issues</h3>
      <div className="space-y-3 text-black">
        {issues.length === 0 && <div>No issues yet.</div>}
        {issues.map((it) => (
          <div key={it._id} className="p-3 border rounded text-black">
            <div className="font-semibold text-black">{it.title}</div>
            <div className="text-sm text-black">{it.status} • {new Date(it.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
