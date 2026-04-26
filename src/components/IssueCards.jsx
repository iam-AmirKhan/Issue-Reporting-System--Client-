import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import Swal from "sweetalert2";

export default function IssueCards({ issue, currentUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Optimistic upvote count
  const upvoters = Array.isArray(issue.upvoters) ? issue.upvoters : [];
  const currentUserIds = [currentUser?.id, currentUser?._id, currentUser?.uid].filter(Boolean).map(String);
  const initialUpvoted = currentUser ? upvoters.map(String).some((id) => currentUserIds.includes(id)) : false;
  
  const [localUpvoted, setLocalUpvoted] = useState(initialUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount ?? upvoters.length);

  const issueOwnerIds = [issue.createdBy, issue.submitterId, issue.reporterId].filter(Boolean).map(String);
  const isOwner = currentUser && issueOwnerIds.some((ownerId) => currentUserIds.includes(ownerId));

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/issues/${issue._id || issue.id}/upvote`);
      return res.data;
    },
    onMutate: async () => {
      // Optimistic update
      setLocalUpvoted(true);
      setUpvoteCount(c => c + 1);
    },
    onError: (err) => {
      // Revert on error
      setLocalUpvoted(initialUpvoted);
      setUpvoteCount(issue.upvoteCount ?? upvoters.length);
      Swal.fire({
        icon: 'error',
        title: 'Upvote Failed',
        text: err.response?.data?.message || 'Please try again later.',
        confirmButtonColor: '#10b981'
      });
    },
    onSuccess: () => {
      // Just invalidate queries so fresh data isn't stale tomorrow
      queryClient.invalidateQueries({ queryKey: ["all-issues"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const handleUpvote = () => {
    if (!currentUser) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'You must be logged in to upvote issues.',
        confirmButtonColor: '#10b981'
      }).then((res) => {
         if(res.isConfirmed) navigate("/login");
      });
      return;
    }
    if (isOwner) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Allowed',
        text: 'You cannot upvote your own issue.',
        confirmButtonColor: '#10b981'
      });
      return;
    }
    if (currentUser?.blocked || currentUser?.isBlocked) {
      Swal.fire({
        icon: 'warning',
        title: 'Account Restricted',
        text: 'Blocked users cannot upvote issues. Please contact the authorities.',
        confirmButtonColor: '#10b981'
      });
      return;
    }
    if (localUpvoted) {
      Swal.fire({
        icon: 'info',
        title: 'Already Upvoted',
        text: 'Every citizen can upvote an issue only once.',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    upvoteMutation.mutate();
  };

  const imageSrc = issue.image || (issue.photos && issue.photos[0]?.url) || "/placeholder.png";

  return (
    <div
      className={`group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 overflow-hidden flex flex-col ${
        issue.boosted ? "ring-2 ring-amber-400 ring-offset-2" : ""
      }`}
    >
      {/* ── Image Header ── */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={imageSrc} 
          alt={issue.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=No+Photo" }}
        />
        
        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
            issue.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
            issue.status === "in_progress" || issue.status === "working" ? "bg-blue-100 text-blue-700" :
            issue.status === "closed" ? "bg-slate-200 text-slate-700" :
            "bg-amber-100 text-amber-700"
          }`}>
            {(issue.status || "Pending").replace("_", " ").toUpperCase()}
          </span>
          {issue.priority === "high" && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-700 shadow-sm animate-pulse">
              URGENT
            </span>
          )}
        </div>

        {/* Badges Top Right */}
        {issue.boosted && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-400 text-amber-900 shadow-sm flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" />
              </svg>
              BOOSTED
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 truncate max-w-[50%]">
            {issue.category || "General"}
          </span>
          <span>•</span>
          <span className="truncate flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {issue.location || "Unknown"}
          </span>
        </div>

        <h3 className="text-[17px] font-bold text-slate-800 leading-tight mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {issue.title}
        </h3>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {issue.description || "No description provided."}
        </p>

        {/* ── Actions ── */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <button
            onClick={handleUpvote}
            disabled={upvoteMutation.isPending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              localUpvoted 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <svg
              className={`w-4 h-4 ${localUpvoted ? "text-emerald-500" : "text-slate-400"}`}
              fill={localUpvoted ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span>{upvoteCount}</span>
          </button>

          <Link
            to={`/issue/${issue.id || issue._id}`}
            className="flex items-center gap-1 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            Details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
