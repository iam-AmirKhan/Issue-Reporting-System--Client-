
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosConfig";
import IssueCards from "../IssueCards";
import { Link } from "react-router-dom";


export default function LatestResolvedSection({ issues: propIssues, currentUser }) {
  const [fetchedIssues, setFetchedIssues] = useState([]);
  const [loading, setLoading] = useState(Boolean(!propIssues));
  const [error, setError] = useState(null);

  // fetch only when props not provided
  useEffect(() => {
    let mounted = true;
    if (propIssues && Array.isArray(propIssues)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get("/api/issues?limit=0")
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.issues) ? res.data.issues : [];
        setFetchedIssues(data);
      })
      .catch((err) => {
        console.error("Failed to fetch issues for LatestSixIssues:", err);
        setError(err);
      })
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [propIssues]);

  const source = propIssues && Array.isArray(propIssues) ? propIssues : fetchedIssues;

  const latestSix = useMemo(() => {
    if (!Array.isArray(source) || source.length === 0) return [];
    // stable sort by updatedAt -> createdAt descending
    return [...source]
      .sort((a, b) => {
        const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return tb - ta;
      })
      .slice(0, 6);
  }, [source]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded shadow text-center">
        Loading latest issues...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded shadow text-center text-red-600">
        Failed to load latest issues.
      </div>
    );
  }

  if (!latestSix.length) {
    return (
      <div className="p-6 bg-white rounded shadow text-center">
        No recent issues found.
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black">Latest Issues</h2>
        <Link to="/all-issues" className="text-sm text-blue-600 underline">
          View all issues
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestSix.map((issue) => (
          <IssueCards
            key={issue.id || issue._id}
            issue={issue}
            currentUser={currentUser}
            onUpvoted={(updatedIssue) => {
              // if parent passed issues as prop you probably handle updates there;
              // this local update keeps the card in sync if fetch was used
              setFetchedIssues((prev) =>
                prev.map((p) => (p.id === updatedIssue.id ? updatedIssue : p))
              );
            }}
          />
        ))}
      </div>
    </section>
  );
}
