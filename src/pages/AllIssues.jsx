import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import IssueCard from "../components/IssueCards";

// Optionally import MOCK_ISSUES or reuse from another file if you have it
const MOCK_ISSUES = [
  // (use the same mock objects you already have)
];

export default function AllIssues({ currentUser }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filter / search UI state (UI-first - not enforced on backend yet)
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api.get("/api/issues?limit=0") // use backend pagination/limit if you want; 0 -> all (if supported)
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.issues) ? res.data.issues : [];
        // default: boosted issues first, then priority (high first), then status order, then recent
        data.sort((a, b) => {
          // boosted first
          if (!!b.boosted !== !!a.boosted) return b.boosted ? -1 : 1;
          // priority
          const pA = (a.priority || "normal") === "high" ? 0 : 1;
          const pB = (b.priority || "normal") === "high" ? 0 : 1;
          if (pA !== pB) return pA - pB;
          // status (optional custom order)
          const statusOrder = { pending: 0, in_progress: 1, open: 2, resolved: 3, closed: 4 };
          const sA = statusOrder[a.status] ?? 99;
          const sB = statusOrder[b.status] ?? 99;
          if (sA !== sB) return sA - sB;
          // updatedAt newest first
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });

        setIssues(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
        // fallback to mock
        setIssues(MOCK_ISSUES);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, []);

  // client-side filtering & search (UI-first; server-side not implemented)
  const filtered = useMemo(() => {
    return issues.filter((it) => {
      if (categoryFilter !== "all" && (it.category || "uncategorized") !== categoryFilter) return false;
      if (statusFilter !== "all" && (it.status || "open") !== statusFilter) return false;
      if (priorityFilter !== "all" && (it.priority || "normal") !== priorityFilter) return false;

      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (it.title || "").toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q) ||
        (it.location || "").toLowerCase().includes(q)
      );
    });
  }, [issues, search, categoryFilter, statusFilter, priorityFilter]);

  if (loading) return <div className="p-8 text-center">Loading issues...</div>;
  if (error && !issues.length) return <div className="p-8 text-center text-red-600">Failed to load issues.</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">All Issues</h1>

        <div className="flex gap-3 items-center w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues (title, description, location)"
            className="border rounded px-3 py-2 w-full md:w-64"
          />

          {/* category/status/priority filters - UI only for now */}
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded px-2 py-2">
            <option value="all">All categories</option>
            <option value="road">Road</option>
            <option value="lighting">Lighting</option>
            <option value="sanitation">Sanitation</option>
            <option value="uncategorized">Uncategorized</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-2 py-2">
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="open">Open</option>
            <option value="in_progress">In-Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border rounded px-2 py-2">
            <option value="all">Any priority</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            // pass setters so IssueCard can update optimistic state after upvote
            onUpvoted={(updatedIssue) => {
              // update that issue in list
              setIssues((prev) => prev.map((p) => (p.id === updatedIssue.id ? updatedIssue : p)));
            }}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}
