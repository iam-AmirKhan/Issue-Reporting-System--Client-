import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export default function IssueCards({ issue, currentUser, onUpvoted }) {
  const navigate = useNavigate();
  const [localUpvoted, setLocalUpvoted] = useState(

    !!(currentUser && Array.isArray(issue.upvoters) && issue.upvoters.includes(currentUser.id))
  );
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount ?? (issue.upvoters ? issue.upvoters.length : 0));
  const [busy, setBusy] = useState(false);


  const isOwner = currentUser && (issue.createdBy === currentUser.id || issue.reporterId === currentUser.id);

  const handleUpvote = async () => {
    if (!currentUser) {
  
      navigate("/login");
      return;
    }
    if (isOwner) {
      alert("You cannot upvote your own issue.");
      return;
    }
    if (localUpvoted) {
     
      alert("You have already upvoted this issue.");
      return;
    }


    setBusy(true);
    setLocalUpvoted(true);
    setUpvoteCount((c) => c + 1);

    try {
      const res = await api.post(`/api/issues/${issue.id}/upvote`);

      const updated = res.data && (res.data.issue || res.data);
      if (updated) {

        setUpvoteCount(updated.upvoteCount ?? (updated.upvoters ? updated.upvoters.length : upvoteCount));
        if (onUpvoted) onUpvoted(updated);
      }
    } catch (err) {
      console.error(err);

      setLocalUpvoted(false);
      setUpvoteCount((c) => Math.max(0, c - 1));
      alert("Failed to upvote. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const imageSrc = issue.image || (issue.photos && issue.photos[0] && (issue.photos[0].url || issue.photos[0])) || "/placeholder.png";

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${issue.boosted ? "ring-2 ring-yellow-300" : ""}`}>
      <img src={imageSrc} alt={issue.title} className="w-full h-40 object-cover rounded" />

      <div className="mt-3 flex justify-between items-start gap-2">
        <div>
          <h3 className="text-lg font-semibold">{issue.title}</h3>
          <p className="text-sm text-slate-600">{issue.category || "uncategorized"} • {issue.location || "—"}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xs px-2 py-1 rounded-full bg-slate-200">{issue.status || "open"}</div>
          <div className={`text-xs px-2 py-1 rounded-full ${issue.priority === "high" ? "bg-red-200" : "bg-slate-200"}`}>
            {issue.priority === "high" ? "High" : "Normal"}
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-700 line-clamp-3">{issue.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpvote}
            disabled={busy}
            className={`flex items-center gap-2 px-3 py-1 rounded ${localUpvoted ? "bg-green-600 text-white" : "bg-slate-100"} text-sm`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={localUpvoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
            <span>{upvoteCount}</span>
          </button>

          {/* optionally show who boosted */}
          {issue.boosted && <span className="text-xs px-2 py-1 bg-yellow-100 rounded">Boosted</span>}
        </div>

        <Link to={`/issue/${issue.id}`} className="text-blue-600 underline text-sm">View Details</Link>
      </div>
    </div>
  );
}
