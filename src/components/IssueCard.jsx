import React from "react";
import { Link } from "react-router-dom";

export default function IssueCard({ issue }) {

  const imageSrc = issue.image || (issue.photos && issue.photos[0] && issue.photos[0].url) || "/placeholder.png";

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <img
        src={imageSrc}
        alt={issue.title}
        className="w-full h-40 object-cover rounded"
      />

      <h3 className="mt-3 text-lg font-semibold">{issue.title}</h3>
      <p className="text-sm text-slate-600">{issue.location}</p>

      <div className="mt-3 flex justify-between items-center">
        <span className="px-2 py-1 bg-slate-200 rounded text-xs">
          {issue.status}
        </span>

        <Link
          to={`/issue/${issue.id}`}
          className="text-blue-600 text-sm underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
