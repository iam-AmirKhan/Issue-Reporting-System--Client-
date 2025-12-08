// src/components/IssueCard.jsx
import React from "react";
import { Link } from "react-router-dom";

function statusColor(status) {
  if (status === "resolved") return "bg-green-100 text-green-800";
  if (status === "in_progress") return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800"; // open / default
}

export default function IssueCard({ issue }) {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden border">
      {issue.image && (
        <div className="h-40 w-full overflow-hidden">
          <img src={issue.image} alt={issue.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{issue.title}</h3>
          <span className={`text-xs font-medium px-2 py-1 rounded ${statusColor(issue.status)}`}>
            {issue.status.replace("_", " ").toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-slate-600 mt-2 line-clamp-3">
          {issue.description || "No description provided."}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <div>
            <div><strong>Location:</strong> {issue.location || "—"}</div>
            <div className="mt-1">Reported: {new Date(issue.createdAt).toLocaleDateString()}</div>
          </div>

          <Link
            to={`/issues/${issue.id}`}
            className="ml-3 inline-block bg-slate-900 text-white px-3 py-2 rounded-md text-sm"
            aria-label={`View details for ${issue.title}`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
