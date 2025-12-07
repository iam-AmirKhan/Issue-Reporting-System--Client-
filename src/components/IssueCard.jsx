import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export default function IssueCard({ issue, onUpvote, user }) {
  const id = issue.id || issue._id;
  const userId = user?.uid || user?.email;
  const upvoters = Array.isArray(issue.upvoters) ? issue.upvoters : [];
  const alreadyUpvoted = userId ? upvoters.includes(userId) : false;
  const isOwnIssue =
    user && (issue.reporter === userId || issue.reporterEmail === user?.email);
  const upvotes = upvoters.length || issue.upvotes || 0;

  const fallback = "/placeholder.svg";


  const initialImg = useMemo(() => {
    const img = issue?.image || "";
    if (!img || typeof img !== "string") return fallback;

    if (img.includes("via.placeholder.com")) return fallback;


    try {
      const url = new URL(img);
      if (!(url.protocol === "http:" || url.protocol === "https:")) return fallback;
    } catch (e) {
 
      if (!img.startsWith("/")) return fallback;
    }

    return img;
  }, [issue]);

  const [imgSrc, setImgSrc] = useState(initialImg);

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white">
      <div className="flex gap-4">
        <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
          <img
            src={imgSrc}
            alt={issue.title || "Issue image"}
            onError={() => setImgSrc(fallback)}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{issue.title}</h3>

            <div className="text-right">
              <span
                className={`px-2 py-1 rounded text-xs text-white ${
                  issue.priority === "High" ? "bg-red-600" : "bg-gray-600"
                }`}
              >
                {issue.priority || "Normal"}
              </span>

              <div className="mt-1">
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${
                    issue.status === "Resolved"
                      ? "bg-green-600"
                      : issue.status === "In-Progress"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                >
                  {issue.status || "Pending"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {issue.category} • {issue.location}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpvote(id)}
                disabled={alreadyUpvoted || isOwnIssue}
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  alreadyUpvoted || isOwnIssue
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white"
                }`}
                title={
                  isOwnIssue
                    ? "You cannot upvote your own issue"
                    : alreadyUpvoted
                    ? "Already upvoted"
                    : "Upvote"
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="text-sm">{upvotes}</span>
              </button>

              <Link to={`/issue/${id}`} className="text-sm text-blue-600 hover:underline">View Details</Link>
            </div>

            <div className="text-xs text-gray-400">
              {new Date(issue.createdAt || issue.date || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}