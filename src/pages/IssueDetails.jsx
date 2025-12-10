import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";


const nowISO = () => new Date().toISOString();
const formatDate = (s) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleString(); } catch { return s; }
};


function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    if (!parsed.id && !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function IssueDetails({ currentUser: propUser }) {
  const { id } = useParams();
  const navigate = useNavigate();


  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(propUser || null);

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
      setCheckingAuth(false);
      return;
    }
    const restored = getUserFromStorage();
    setCurrentUser(restored);
    setCheckingAuth(false);
  }, [propUser]);

  useEffect(() => {
    if (!checkingAuth && !currentUser) {
      navigate("/login", { replace: true });
    }
  }, [checkingAuth, currentUser, navigate]);


  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [timelineMessage, setTimelineMessage] = useState("");
  const [statusToSet, setStatusToSet] = useState("");
  const [assignStaffId, setAssignStaffId] = useState("");
  const [availableStaff, setAvailableStaff] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", contact: "" });


  useEffect(() => {
    if (checkingAuth) return;
    let mounted = true;
    setLoading(true);

    api.get(`/api/issues/${id}`)
      .then((res) => {
        if (!mounted) return;
        const payload = res.data && (res.data.issue || res.data);
        setIssue(payload);
      })
      .catch((err) => {
        console.error("Failed to load issue:", err);
        alert("Issue not found or failed to load.");
        navigate("/", { replace: true });
      })
      .finally(() => mounted && setLoading(false));

    api.get("/api/staff")
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data) ? res.data : (res.data.staff || []);
        setAvailableStaff(list);
      })
      .catch(() => { /* ignore staff fetch failure */ });

    if (currentUser) setProfileForm({ name: currentUser.name || "", contact: currentUser.contact || "" });

    return () => (mounted = false);
  }, [id, navigate, currentUser, checkingAuth]);


  const isOwner = useMemo(() => {
    if (!currentUser || !issue) return false;
    return issue.createdBy === currentUser.id || issue.reporterId === currentUser.id;
  }, [currentUser, issue]);

  const canEdit = isOwner && issue && (issue.status === "pending" || issue.status === "open");
  const canDelete = isOwner && !!issue;
  const canBoost = currentUser && currentUser.role === "citizen" && issue && !issue.boosted;
  const isAdmin = currentUser && currentUser.role === "admin";
  const isStaff = currentUser && currentUser.role === "staff";

  // refresh issue
  const refresh = async () => {
    try {
      const res = await api.get(`/api/issues/${id}`);
      const payload = res.data && (res.data.issue || res.data);
      setIssue(payload);
    } catch (err) {
      console.error("refresh failed", err);
    }
  };

  // helper: post timeline entry and optimistic prepend
  const postTimeline = async ({ status, message, role = currentUser?.role || "Citizen", updatedBy = currentUser?.name || currentUser?.id }) => {
    const entry = { status, message, role, updatedBy, timestamp: nowISO() };
    try {
      await api.post(`/api/issues/${id}/timeline`, entry);
      setIssue((prev) => prev ? { ...prev, timeline: [entry, ...(prev.timeline || [])] } : prev);
      return true;
    } catch (err) {
      console.error("post timeline failed", err);
      return false;
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!confirm("Delete this issue? This cannot be undone.")) return;
    setActionBusy(true);
    try {
      await api.delete(`/api/issues/${id}`);
      await postTimeline({ status: "deleted", message: `Issue deleted by ${currentUser.name || currentUser.id}`, role: currentUser.role || "Citizen" });
      alert("Issue deleted.");
      navigate("/issues");
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    } finally {
      setActionBusy(false);
    }
  };

  // EDIT -> navigate to edit page
  const handleEdit = () => navigate(`/issues/${id}/edit`);

  // BOOST (trigger payment on backend)
  const handleBoost = async () => {
    if (!canBoost) return alert("You cannot boost this issue.");
    if (!confirm("Boost this issue for 100 TK? Proceed to payment?")) return;
    setActionBusy(true);
    try {
      const res = await api.post(`/api/issues/${id}/boost`, { amount: 100 });
      const updated = res.data && (res.data.issue || res.data);
      if (updated) setIssue(updated);
      else await refresh();
      await postTimeline({ status: "boosted", message: `Boosted by ${currentUser.name || currentUser.id} (100 TK)`, role: currentUser.role || "Citizen" });
      alert("Boost successful — priority set to High.");
    } catch (err) {
      console.error(err);
      alert("Boost/payment failed.");
    } finally {
      setActionBusy(false);
    }
  };

  // ASSIGN staff (admin)
  const handleAssign = async () => {
    if (!isAdmin || !assignStaffId) return alert("Select staff to assign.");
    setActionBusy(true);
    try {
      const res = await api.post(`/api/issues/${id}/assign`, { staffId: assignStaffId });
      const updated = res.data && (res.data.issue || res.data);
      if (updated) setIssue(updated);
      else await refresh();
      await postTimeline({ status: "assigned", message: `Assigned to staff ${assignStaffId}`, role: "Admin" });
      alert("Assigned.");
      setAssignStaffId("");
    } catch (err) {
      console.error(err);
      alert("Assign failed.");
    } finally {
      setActionBusy(false);
    }
  };

  // REJECT (admin)
  const handleReject = async () => {
    if (!isAdmin) return;
    if (!confirm("Reject this issue?")) return;
    setActionBusy(true);
    try {
      await api.post(`/api/issues/${id}/reject`);
      await postTimeline({ status: "rejected", message: `Rejected by ${currentUser.name || currentUser.id}`, role: "Admin" });
      alert("Rejected.");
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Reject failed.");
    } finally {
      setActionBusy(false);
    }
  };

  // Staff/Admin change status
  const handleChangeStatus = async (newStatus) => {
    if (!(isAdmin || isStaff)) return alert("Not permitted.");
    if (!newStatus) return;
    if (!confirm(`Change status to ${newStatus}?`)) return;
    setActionBusy(true);
    try {
      const res = await api.put(`/api/issues/${id}`, { status: newStatus });
      const updated = res.data && (res.data.issue || res.data);
      if (updated) setIssue(updated);
      else await refresh();
      await postTimeline({ status: newStatus, message: `Status set to ${newStatus} by ${currentUser.name || currentUser.id}`, role: isAdmin ? "Admin" : "Staff" });
      alert("Status updated.");
    } catch (err) {
      console.error(err);
      alert("Status update failed.");
    } finally {
      setActionBusy(false);
    }
  };

  // Add note to timeline
  const handleAddNote = async () => {
    const msg = timelineMessage?.trim();
    if (!msg) return alert("Write a note first.");
    setActionBusy(true);
    try {
      const ok = await postTimeline({ status: "note", message: msg, role: currentUser.role || "Citizen" });
      if (ok) {
        setTimelineMessage("");
        alert("Note added.");
      } else {
        alert("Failed to add note.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add note.");
    } finally {
      setActionBusy(false);
    }
  };

  // Edit profile save (PUT /api/users/:id)
  const handleProfileSave = async () => {
    if (!currentUser) return;
    setActionBusy(true);
    try {
      const res = await api.put(`/api/users/${currentUser.id}`, { name: profileForm.name, contact: profileForm.contact });
      const updated = res.data && (res.data.user || res.data);
      if (updated) {
        const merged = { ...(currentUser || {}), ...updated };
        localStorage.setItem("user", JSON.stringify(merged));
        setCurrentUser(merged);
        setShowEditProfile(false);
        alert("Profile updated.");
      } else alert("Profile update returned no data.");
    } catch (err) {
      console.error(err);
      alert("Profile update failed.");
    } finally {
      setActionBusy(false);
    }
  };

  if (checkingAuth || loading) return <div className="p-8 text-center">Loading...</div>;
  if (!issue) return null;

  const imageSrc = issue.image || (issue.photos && issue.photos[0] && (issue.photos[0].url || issue.photos[0])) || "/placeholder.png";
  const timeline = (issue.timeline || []).slice().sort((a, b) => new Date(b.timestamp || b.time || b.date || 0) - new Date(a.timestamp || a.time || a.date || 0));

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="text-blue-600 underline">← Back</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN */}
        <main className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black">{issue.title}</h1>
              <p className="text-sm text-black mt-1">{issue.category || "Uncategorized"} • {issue.location || "—"}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${issue.boosted ? "bg-yellow-200 text-black" : "bg-gray-200 text-black"}`}>{issue.boosted ? "Boosted" : "Not boosted"}</span>
                <span className={`text-xs px-2 py-1 rounded ${issue.priority === "high" ? "bg-red-200 text-black" : "bg-gray-200 text-black"}`}>Priority: {issue.priority || "normal"}</span>
                <span className={`text-xs px-2 py-1 rounded ${issue.status === "resolved" ? "bg-green-200 text-black" : "bg-gray-200 text-black"}`}>Status: {issue.status || "—"}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              {canEdit && <button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">Edit</button>}
              {canDelete && <button onClick={handleDelete} disabled={actionBusy} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Delete</button>}
              {canBoost && <button onClick={handleBoost} disabled={actionBusy} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Boost (100 TK)</button>}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <img src={imageSrc} alt={issue.title} className="w-full h-64 object-cover rounded" />
            </div>

            <div>
              <h3 className="font-semibold text-black">Description</h3>
              <p className="mt-2 text-sm text-black whitespace-pre-line">{issue.description || "No description provided."}</p>

              <div className="mt-4 text-sm text-black">
                <div><strong>Reported by:</strong> {issue.reporterName || issue.createdBy || "Anonymous"}</div>
                {issue.reporterContact && <div className="text-xs text-slate-600">Contact: {issue.reporterContact}</div>}
              </div>

              <div className="mt-4">
                <strong className="text-sm text-black">Upvotes:</strong> <span className="text-black">{issue.upvoteCount ?? (issue.upvoters ? issue.upvoters.length : 0)}</span>
              </div>

              {isAdmin && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium text-black">Admin actions</h4>
                  <div className="mt-2 flex gap-2 items-center">
                    <select value={assignStaffId} onChange={(e) => setAssignStaffId(e.target.value)} className="border rounded px-2 py-1">
                      <option value="">Assign staff</option>
                      {availableStaff.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name || s.id}</option>)}
                    </select>
                    <button onClick={handleAssign} disabled={actionBusy} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm">Assign</button>
                    <button onClick={handleReject} disabled={actionBusy} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-sm">Reject</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add update */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-black">Add update</h3>
            <div className="mt-3 flex flex-col gap-2">
              <textarea value={timelineMessage} onChange={(e) => setTimelineMessage(e.target.value)} placeholder="Write a progress update or note..." className="border rounded px-3 py-2 w-full" rows={3} />
              <div className="flex items-center gap-2">
                {(isStaff || isAdmin) && (
                  <>
                    <select value={statusToSet} onChange={(e) => setStatusToSet(e.target.value)} className="border rounded px-2 py-1">
                      <option value="">(Change status)</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In-Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button onClick={() => statusToSet && handleChangeStatus(statusToSet)} disabled={actionBusy || !statusToSet} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm">Update status</button>
                  </>
                )}

                <button onClick={handleAddNote} disabled={actionBusy || !timelineMessage.trim()} className="bg-gray-800 hover:bg-black text-white px-3 py-1 rounded text-sm">Add note</button>
              </div>
            </div>
          </div>
        </main>

        {/* ASIDE */}
        <aside className="bg-white rounded-lg shadow p-6">
          <div>
            <h3 className="text-lg font-semibold text-black">Assigned staff</h3>
            {issue.assignedStaff ? (
              <div className="mt-3 flex items-center gap-3">
                <img src={issue.assignedStaff.avatar || "/avatar-placeholder.png"} alt={issue.assignedStaff.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <div className="font-medium text-black">{issue.assignedStaff.name}</div>
                  <div className="text-xs text-slate-600">{issue.assignedStaff.contact || issue.assignedStaff.email || ""}</div>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-black">No staff assigned yet.</div>
            )}
          </div>

          {/* Profile edit */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-black">Your profile</h4>
              <button onClick={() => setShowEditProfile((s) => !s)} className="text-sm text-blue-600 underline">{showEditProfile ? "Cancel" : "Edit profile"}</button>
            </div>

            {!showEditProfile ? (
              <div className="mt-3 text-sm text-black">
                <div><strong>Name:</strong> {currentUser?.name || "—"}</div>
                <div className="text-xs text-slate-600"><strong>Contact:</strong> {currentUser?.contact || "—"}</div>
                <div className="text-xs text-slate-600"><strong>Role:</strong> {currentUser?.role || "citizen"}</div>
              </div>
            ) : (
              <div className="mt-3">
                <label className="block text-sm text-black">Name</label>
                <input className="w-full border rounded px-2 py-1 mt-1" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
                <label className="block text-sm text-black mt-2">Contact</label>
                <input className="w-full border rounded px-2 py-1 mt-1" value={profileForm.contact} onChange={(e) => setProfileForm((p) => ({ ...p, contact: e.target.value }))} />
                <div className="mt-3 flex gap-2">
                  <button disabled={actionBusy} onClick={handleProfileSave} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Save</button>
                  <button disabled={actionBusy} onClick={() => { setShowEditProfile(false); setProfileForm({ name: currentUser?.name || "", contact: currentUser?.contact || "" }); }} className="bg-gray-200 px-3 py-1 rounded text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* TIMELINE */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-black">Timeline ({timeline.length})</h4>
            <div className="mt-3 space-y-3">
              {timeline.length === 0 && <div className="text-sm text-black">No timeline events yet.</div>}
              {timeline.map((t, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${t.status === "resolved" ? "bg-green-200 text-black" : t.status === "in_progress" ? "bg-blue-200 text-black" : t.status === "pending" ? "bg-yellow-200 text-black" : "bg-gray-200 text-black"}`}>
                        {t.status || "note"}
                      </span>
                      <div className="text-sm font-medium text-black">{t.updatedBy || "System"}</div>
                      <div className="text-xs text-slate-600">({t.role || "—"})</div>
                    </div>
                    <div className="text-xs text-slate-600">{formatDate(t.timestamp || t.time || t.date || t.createdAt)}</div>
                  </div>
                  <div className="mt-2 text-sm text-black">{t.message}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-600">
            <div>Created: {formatDate(issue.createdAt || issue.created)}</div>
            <div>Updated: {formatDate(issue.updatedAt)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
