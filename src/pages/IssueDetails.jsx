import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [processingBoost, setProcessingBoost] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/api/issues/${id}`)
      .then(res => { if (!mounted) return; setIssue(res.data); })
      .catch(err => { console.error(err); Swal.fire("Error", "Unable to load issue", "error"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => (mounted = false);
  }, [id]);

  const refresh = async () => {
    try {
      const res = await api.get(`/api/issues/${id}`);
      setIssue(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const isReporter = user && issue && (issue.reporterId === user.uid || issue.reporterEmail === user.email);
  const canEdit = isReporter && issue && (issue.status === "pending" || issue.status === "open");
  const canDelete = isReporter;


  const handleDelete = async () => {
    const ok = await Swal.fire({
      icon: "warning",
      title: "Delete issue?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!ok.isConfirmed) return;

    try {
      await api.delete(`/api/issues/${id}`);
      Swal.fire("Deleted", "Issue deleted successfully", "success");
      navigate("/all-issues");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

 
  const handleBoost = async () => {
    if (!issue) return;
    if (issue.priority === "high") {
      Swal.fire("Already boosted", "This issue already has high priority.", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Boost priority for 100 Tk",
      text: "This will pay 100 Tk to boost the issue priority. Continue?",
      showCancelButton: true,
      confirmButtonText: "Pay 100 Tk",
    });
    if (!confirm.isConfirmed) return;

    setProcessingBoost(true);
    try {

      const payRes = await api.post(`/api/payments/boost`, {
        issueId: id,
        amount: 100,
        currency: "BDT",
        payer: { uid: user?.uid, email: user?.email, name: user?.displayName || "" },
      });

      if (!payRes.data || !payRes.data.success) {
        throw new Error(payRes.data?.message || "Payment failed");
      }

      await api.post(`/api/issues/${id}/timeline`, {
        status: issue.status,
        note: `Issue boosted by ${user?.displayName || user?.email || "user"}. Payment tx: ${payRes.data.transactionId || "n/a"}`,
        updatedBy: user?.displayName || user?.email || "citizen",
        eventType: "boost_payment",
      });

      await api.put(`/api/issues/${id}`, { priority: "high" });

      Swal.fire("Success", "Issue boosted. Priority is now HIGH.", "success");
      await refresh();
    } catch (err) {
      console.error("Boost failed:", err);
      Swal.fire("Error", err?.response?.data?.message || err.message || "Boost/payment failed", "error");
    } finally {
      setProcessingBoost(false);
    }
  };

  if (loading) return <div className="py-12 text-center">Loading issue details...</div>;
  if (!issue) return <div className="py-12 text-center">Issue not found.</div>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{issue.title}</h1>
          <div className="text-sm text-slate-500 mt-1">
            Reported: {new Date(issue.createdAt).toLocaleString()} • Status:{" "}
            <span className={`px-2 py-1 rounded text-xs font-medium ${issue.status === "resolved" ? "bg-green-100 text-green-800" : issue.status === "in_progress" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
              {issue.status.replace("_", " ").toUpperCase()}
            </span>
            {" "}
            {issue.priority === "high" && <span className="ml-2 px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 font-medium">BOOSTED</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && <button onClick={() => setEditOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Edit</button>}
          {canDelete && <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>}
          <button
            onClick={handleBoost}
            disabled={processingBoost || issue.priority === "high"}
            className={`px-4 py-2 rounded ${issue.priority === "high" ? "bg-gray-300 text-gray-700" : "bg-amber-500 text-white"}`}
          >
            {processingBoost ? "Processing..." : (issue.priority === "high" ? "Already Boosted" : "Boost (100 Tk)")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="lg:col-span-2 bg-white rounded shadow p-6">
          {issue.image && <img src={issue.image} alt={issue.title} className="w-full h-80 object-cover rounded mb-4" />}

          <section className="mb-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-slate-700">{issue.description}</p>
          </section>

          <section className="mb-4">
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-slate-700">{issue.location || "Not specified"}</p>
          </section>

          <section className="mb-6">
            <h3 className="font-semibold mb-2">Issue Tracking</h3>
            <IssueTimeline items={issue.timeline || []} />
          </section>
        </article>

        <aside className="bg-white rounded shadow p-6 space-y-4">
          <div>
            <div className="text-sm text-slate-500">Reported by</div>
            <div className="font-medium">{issue.reporterName || issue.reporterEmail || "Anonymous"}</div>
            {issue.reporterContact && <div className="text-sm text-slate-500">{issue.reporterContact}</div>}
          </div>

          <div>
            <div className="text-sm text-slate-500">Status</div>
            <div className="text-lg font-semibold">{issue.status.replace("_", " ")}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Priority</div>
            <div className="text-lg font-semibold">{issue.priority || "normal"}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Assigned staff</div>
            {issue.assignedStaff ? (
              <div className="border rounded p-3">
                <div className="font-medium">{issue.assignedStaff.name}</div>
                <div className="text-sm text-slate-600">{issue.assignedStaff.role || "Staff"}</div>
                {issue.assignedStaff.contact && <div className="text-sm">{issue.assignedStaff.contact}</div>}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No staff assigned</div>
            )}
          </div>

          <div>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="w-full bg-slate-900 text-white px-4 py-2 rounded">
              Back to top
            </button>
          </div>
        </aside>
      </div>

      {/* Edit modal */}
      {editOpen && <EditIssueModal issue={issue} onClose={() => setEditOpen(false)} onSaved={async () => { setEditOpen(false); await refresh(); }} />}
    </main>
  );
}
