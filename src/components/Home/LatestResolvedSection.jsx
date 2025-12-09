import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import IssueCard from "../IssueCard";

const STATUS_ORDER = { resolved: 0, in_progress: 1, open: 2 };

const MOCK_ISSUES = [
  {
    id: "mock-1",
    title: "Poth-e gaddha — near market",
    description: "Large pothole causing traffic issues.",
    status: "resolved",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    location: "City Market",
    image:
      "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?q=80&w=1400&auto=format&fit=crop",
    reporterName: "Local Citizen",
  },
  {
    id: "mock-2",
    title: "Streetlight broken",
    description: "Lamp post not working at night.",
    status: "resolved",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    location: "Block A",
    image:
      "https://images.unsplash.com/photo-1497493292307-31c376b6e479?q=80&w=1400&auto=format&fit=crop",
    reporterName: "Rina",
  },
  {
    id: "mock-3",
    title: "Overflowing trash bin",
    description: "Garbage bin overflow near bus stop.",
    status: "resolved",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    location: "Bus Stop",
    image:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1400&auto=format&fit=crop",
    reporterName: "Jamal",
  },
  {
    id: "mock-4",
    title: "Sidewalk cracked",
    description: "Cracked footpath causing hazards.",
    status: "in_progress",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    location: "Main Rd",
    image:
      "https://images.unsplash.com/photo-1505691723518-36a89b3a53b3?q=80&w=1400&auto=format&fit=crop",
    reporterName: "Ayesha",
  },
  {
    id: "mock-5",
    title: "Drain blockage",
    description: "Water not draining after rain.",
    status: "open",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    location: "Near School",
    image:
      "https://images.unsplash.com/photo-1508873699372-7ae9b5d8c8a9?q=80&w=1400&auto=format&fit=crop",
    reporterName: "Community",
  },
  {
    id: "mock-6",
    title: "Missing traffic sign",
    description: "Stop sign missing at junction.",
    status: "resolved",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    location: "Junction 4",
    image:
      "https://images.unsplash.com/photo-1455380572553-8696bFAf26d8?q=80&w=1400&auto=format&fit=crop",
    reporterName: "Officer",
  },
];

export default function LatestResolvedSection({ minShow = 6 }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get("/api/issues?limit=12")
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.issues) ? res.data.issues : [];
        data.sort((a, b) => {
          const s = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
          if (s !== 0) return s;
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });

        const take = data.slice(0, minShow);
        if (take.length < minShow) {
          const needed = minShow - take.length;
          const extras = MOCK_ISSUES.filter((m) => !data.find((d) => d.id === m.id)).slice(0, needed);
          setIssues([...take, ...extras]);
        } else {
          setIssues(take);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err);
        setIssues(MOCK_ISSUES.slice(0, minShow));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [minShow]);

  if (loading) return <div className="py-12 text-center">Loading latest issues...</div>;
  if (error && !issues.length) return <div className="py-12 text-center text-red-600">Failed to load issues. Showing sample data.</div>;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest issues (sorted by status)</h2>
          <a href="/all-issues" className="text-sm text-slate-600 hover:underline">View all issues</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </section>
  );
}
