import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import IssueCard from "./IssueCard";

const STATUS_ORDER = { resolved: 0, in_progress: 1, open: 2 };

export default function LatestResolvedSection({ minShow = 6 }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/api/issues?limit=12")
      .then((res) => {
        if (!mounted) return;
        const data = res.data || [];
 
        data.sort((a, b) => {
          const s = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
          if (s !== 0) return s;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
     
        setIssues(data.slice(0, Math.max(minShow, 6)));
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      })
      .finally(() => setLoading(false));

    return () => (mounted = false);
  }, [minShow]);

  if (loading) return <div className="py-12 text-center">Loading latest issues...</div>;
  if (error) return <div className="py-12 text-center text-red-600">Failed to load issues.</div>;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest issues (sorted by status)</h2>
          <a href="/all-issues" className="text-sm text-slate-600 hover:underline">View all issues</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </section>
  );
}
