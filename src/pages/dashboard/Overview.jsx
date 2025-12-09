import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchDashboard() {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const res = await axios.get(`${base}/api/dashboard`);
  return res.data;
}

export default function Overview() {
  const { user } = useContext(AuthContext);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboard,
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // optional
    retry: 1,
  });

  if (isLoading) return <div className="text-black">Loading overview...</div>;
  if (error) return <div className="text-red-600">Error loading overview</div>;

  const stats = data?.stats || {};
  return (
    <div>
      <h2 className="text-xl text-black font-semibold mb-4">Welcome, {user?.name || user?.email}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(stats).length === 0 ? (
          <div className="p-4 border rounded text-black">No stats available</div>
        ) : (
          Object.entries(stats).map(([key, val]) => (
            <div key={key} className="p-4 border rounded">
              <div className="text-sm text-black">{key}</div>
              <div className="text-2xl font-bold text-black">{val}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
