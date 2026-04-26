import React, { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import IssueCards from "../components/IssueCards";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

export default function AllIssues() {
  const { user: currentUser } = useContext(AuthContext);

  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [debouncedSearch, setDebouncedSearch] = useState("");


  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchIssues = async () => {
    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort: sortBy,
    });

    if (debouncedSearch) params.append("search", debouncedSearch);
    if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
    if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
    if (priorityFilter && priorityFilter !== "all") params.append("priority", priorityFilter);

    const res = await api.get(`/api/issues?${params.toString()}`);

    const resultData = res.data;
    if (Array.isArray(resultData)) {
      return { issues: resultData, totalPages: 1 };
    }
    const issueList = resultData.issues || resultData.data || [];
    return {
      issues: issueList,
      totalPages: resultData.totalPages || Math.ceil((resultData.total || issueList.length || 0) / limit) || 1
    };
  };

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["all-issues", page, limit, debouncedSearch, categoryFilter, statusFilter, priorityFilter],
    queryFn: fetchIssues,
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

  const issues = data?.issues || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 w-64 bg-slate-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-rose-500 mb-2">Error loading issues</h2>
        <p className="text-slate-600">Please check your connection or try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">Reports</span>
          </h1>
          <p className="text-slate-500 mt-2">Explore, track, and support issues across the city.</p>
        </div>


        <div className="flex flex-wrap gap-3 items-center glass p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search issues..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-56 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 min-w-[120px]"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="upvotes">Most Upvoted</option>
          </select>

          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 min-w-[140px]"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Categories</option>
            <option value="Roads & Sidewalks">Roads & Sidewalks</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Electricity & Lighting">Electricity & Lighting</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Public Transport">Public Transport</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 min-w-[120px]"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 min-w-[120px]"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Any Priority</option>
            <option value="high">High priority</option>
            <option value="normal">Normal priority</option>
          </select>
        </div>
      </div>


      <div className="relative min-h-[400px]">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {issues.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-700">No issues found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {issues.map((issue) => (
              <IssueCards
                key={issue._id || issue.id}
                issue={issue}
                currentUser={currentUser}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Pagination ────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Previous
          </button>

          <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center text-sm font-medium transition-colors ${page === i + 1
                    ? "bg-emerald-500 text-white"
                    : "text-slate-700 hover:bg-slate-50 border-l border-slate-100 first:border-l-0"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
