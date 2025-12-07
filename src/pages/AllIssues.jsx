import React, { useContext, useMemo, useState } from "react";
import { useAllIssues, useUpvoteIssue } from "../hooks/useQueries";
import IssueCard from "../components/IssueCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AllIssues() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();


  const query = useAllIssues();

  const issuesArray = query?.data?.data ?? query?.data ?? [];

  const isLoading = query.isLoading;
  const isError = query.isError;
  const error = query.error;

  const upvoteMutation = useUpvoteIssue();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const categories = useMemo(() => {
    const s = new Set();
    (issuesArray || []).forEach(i => { if (i.category) s.add(i.category); });
    return Array.from(s);
  }, [issuesArray]);

  const filtered = useMemo(() => {
    let list = (issuesArray || []).slice();


    list.sort((a,b) => {
      const pa = (a.priority === "High") ? 1 : 0;
      const pb = (b.priority === "High") ? 1 : 0;
      if (pa !== pb) return pb - pa; 
      return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
    });

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(it => 
        (it.title || "").toLowerCase().includes(s) ||
        (it.description || "").toLowerCase().includes(s) ||
        (it.location || "").toLowerCase().includes(s)
      );
    }

    if (categoryFilter) list = list.filter(it => it.category === categoryFilter);
    if (statusFilter) list = list.filter(it => it.status === statusFilter);
    if (priorityFilter) list = list.filter(it => (it.priority || "Normal") === priorityFilter);

    return list;
  }, [issuesArray, search, categoryFilter, statusFilter, priorityFilter]);

  const handleUpvote = (issueId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const issue = issuesArray.find(i => (i.id || i._id) === issueId);
    const userId = user.uid || user.email;
    if (!issue) return;
    if (issue.reporter === userId || issue.reporterEmail === user.email) {
      Swal.fire("Not allowed", "You cannot upvote your own issue", "warning");
      return;
    }
    const upvoters = Array.isArray(issue.upvoters) ? issue.upvoters : [];
    if (upvoters.includes(userId)) {
      Swal.fire("Info", "You already upvoted", "info");
      return;
    }

    upvoteMutation.mutate({ issueId, userId }, {
      onError: (err) => {
        Swal.fire("Error", err?.response?.data?.message || err?.message || "Failed to upvote", "error");
      },
      onSuccess: () => {
        Swal.fire("Success", "Upvoted", "success");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">All Issues</h1>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search by title, description, location..."
          className="md:col-span-2 p-2 border rounded"
        />

        <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select value={priorityFilter} onChange={(e)=>setPriorityFilter(e.target.value)} className="p-2 border rounded md:col-span-1">
          <option value="">All Priority</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
        </select>
      </div>

      {isLoading && <p>Loading issues...</p>}
      {isError && <p className="text-red-500">Failed to load issues: {String(error?.message)}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(it => (
          <IssueCard key={it.id || it._id} issue={it} onUpvote={handleUpvote} user={user} />
        ))}
      </div>

      {filtered.length === 0 && !isLoading && <p className="mt-6">No issues found.</p>}
    </div>
  );
}