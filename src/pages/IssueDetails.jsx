import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export default function IssueDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get(`/api/issues/${id}`)
      .then((res) => {
        // support both res.data and res.data.issue
        const payload = res.data && res.data.issue ? res.data.issue : res.data;
        if (!mounted) return;
        setIssue(payload);
      })
      .catch((err) => {
        console.error(err);
        alert("Issue not found or failed to load.");
        navigate("/", { replace: true });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!issue) return null;

  const imageSrc =
    issue.image ||
    (issue.photos && issue.photos.length > 0 && (issue.photos[0].url || issue.photos[0])) ||
    "/placeholder.png";

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 underline mb-4"
      >
        ← Back
      </button>

      <div className="bg-white shadow-md rounded-lg p-6">
        <img
          src={imageSrc}
          alt={issue.title}
          className="w-full h-64 object-cover rounded"
        />

        <h1 className="text-3xl font-bold mt-4">{issue.title}</h1>

        <p className="mt-2 text-slate-600">
          <b>Location:</b> {issue.location || "—"}
        </p>

        <p className="mt-2 text-slate-700">{issue.description || "No description provided."}</p>

        <div className="mt-4">
          <span className="px-3 py-1 bg-slate-200 rounded text-sm">
            Status: {issue.status || "unknown"}
          </span>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Reported by: {issue.reporterName || issue.createdBy || "Anonymous"}
        </p>

        {/* optional: show more metadata if present */}
        {issue.priority && (
          <p className="mt-2 text-sm">
            <b>Priority:</b> {issue.priority}
          </p>
        )}
        {issue.assignedStaff && (
          <div className="mt-4 p-3 border rounded bg-blue-50">
            <h3 className="font-semibold">Assigned Staff</h3>
            <p>{issue.assignedStaff.name}</p>
            {issue.assignedStaff.role && <p className="text-sm text-slate-600">{issue.assignedStaff.role}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
