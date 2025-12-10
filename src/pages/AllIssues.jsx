// src/pages/AllIssues.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";
import IssueCard from "../components/IssueCards";

// Optional: provide mocks if API fails or for dev
const MOCK_ISSUES = [
  // put your mock objects here, or import from another file
];

function normalizeValue(v) {
  if (v == null) return "";
  return String(v).toLowerCase();
}

export default function AllIssues({ currentUser }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // debounce search input (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api
      .get("/api/issues?limit=0")
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.issues)
          ? res.data.issues
          : [];

        data.sort((a, b) => {
          if (!!b.boosted !== !!a.boosted) return b.boosted ? -1 : 1;
          const pA = (a.priority || "normal") === "high" ? 0 : 1;
          const pB = (b.priority || "normal") === "high" ? 0 : 1;
          if (pA !== pB) return pA - pB;
          const statusOrder = { pending: 0, in_progress: 1, open: 2, resolved: 3, closed: 4 };
          const sA = statusOrder[a.status] ?? 99;
          const sB = statusOrder[b.status] ?? 99;
          if (sA !== sB) return sA - sB;
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });

        setIssues(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
        // fallback to mocks if you provided them
        setIssues(MOCK_ISSUES);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, []);

  // derive filter options from loaded issues (normalized)
  const categories = useMemo(() => {
    const set = new Set();
    issues.forEach((it) => set.add(normalizeValue(it.category || "uncategorized")));
    return ["all", ...Array.from(set).filter(Boolean)];
  }, [issues]);

  const statuses = useMemo(() => {
    const set = new Set();
    issues.forEach((it) => set.add(normalizeValue(it.status || "open")));
    return ["all", ...Array.from(set).filter(Boolean)];
  }, [issues]);

  const priorities = useMemo(() => {
    const set = new Set();
    issues.forEach((it) => set.add(normalizeValue(it.priority || "normal")));
    return ["all", ...Array.from(set).filter(Boolean)];
  }, [issues]);

  // client-side filtering (search + selects)
  const filtered = useMemo(() => {
    const q = normalizeValue(debouncedSearch);

    return issues.filter((it) => {
      const cat = normalizeValue(it.category || "uncategorized");
      const st = normalizeValue(it.status || "open");
      const pr = normalizeValue(it.priority || "normal");

      if (categoryFilter !== "all" && cat !== normalizeValue(categoryFilter)) return false;
      if (statusFilter !== "all" && st !== normalizeValue(statusFilter)) return false;
      if (priorityFilter !== "all" && pr !== normalizeValue(priorityFilter)) return false;

      if (!q) return true;

      const hay = [
        it.id,
        it.title,
        it.description,
        it.location,
        it.category,
        it.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [issues, debouncedSearch, categoryFilter, statusFilter, priorityFilter]);

  if (loading) return <div className="p-8 text-center">Loading issues...</div>;
  if (error && !issues.length) return <div className="p-8 text-center text-red-600">Failed to load issues.</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">All Issues</h1>

        <div className="flex gap-3 items-center w-full md:w-auto">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search issues (title, description, location, id)"
            className="border rounded px-3 py-2 w-full md:w-64"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded px-2 py-2"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-2"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All status" : s}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded px-2 py-2"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "Any priority" : p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            currentUser={currentUser}
            onUpvoted={(updatedIssue) => {
              setIssues((prev) => prev.map((p) => (p.id === updatedIssue.id ? updatedIssue : p)));
            }}
          />
        ))}
      </div>
    </div>
  );
}
