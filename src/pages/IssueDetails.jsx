import React, { useContext, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

const formatDate = (s) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleString(); } catch { return s; }
};

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useContext(AuthContext);

  const [timelineMessage, setTimelineMessage] = useState("");
  const [statusToSet, setStatusToSet] = useState("");
  const [assignStaffId, setAssignStaffId] = useState("");

  // Fetch Issue Details
  const { data: issue, isLoading, isError } = useQuery({
    queryKey: ["issue", id],
    queryFn: async () => {
      const res = await api.get(`/api/issues/${id}`);
      return res.data?.issue || res.data;
    },
    enabled: !!id,
  });

  // Fetch Available Staff for Admin
  const { data: availableStaff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await api.get("/api/staff");
      return Array.isArray(res.data) ? res.data : (res.data.staff || res.data.data || []);
    },
    enabled: currentUser?.role === "admin",
  });

  // Check roles
  const currentUserIds = [currentUser?.id, currentUser?._id, currentUser?.uid].filter(Boolean).map(String);
  const issueOwnerIds = [issue?.createdBy, issue?.submitterId, issue?.reporterId].filter(Boolean).map(String);
  const isOwner = currentUser && issue && issueOwnerIds.some((ownerId) => currentUserIds.includes(ownerId));
  const canEdit = isOwner && issue && (issue.status === "pending" || issue.status === "open");
  const canDelete = isOwner && !!issue;
  const canBoost = currentUser && currentUser.role === "citizen" && !currentUser.blocked && !currentUser.isBlocked && issue && !issue.boosted;
  const isAdmin = currentUser && currentUser.role === "admin";
  const isStaff = currentUser && currentUser.role === "staff";

  // Mutations
  const timelineMutation = useMutation({
    mutationFn: async (entry) => await api.post(`/api/issues/${id}/timeline`, entry),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issue", id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => await api.delete(`/api/issues/${id}`),
    onSuccess: () => {
      Swal.fire("Deleted!", "The issue has been removed.", "success");
      navigate("/all-issues");
      queryClient.invalidateQueries({ queryKey: ["all-issues"] });
      queryClient.invalidateQueries({ queryKey: ["my-issues"] });
    },
    onError: () => Swal.fire("Error", "Failed to delete issue.", "error"),
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, payload }) => {
      if (action === "boost") return await api.post(`/api/issues/${id}/boost`, payload);
      if (action === "assign") return await api.post(`/api/issues/${id}/assign`, payload);
      if (action === "reject") return await api.post(`/api/issues/${id}/reject`);
      if (action === "status") return await api.put(`/api/issues/${id}`, payload);
    },
    onSuccess: (data, variables) => {
      let msg = "Action successful.";
      if (variables.action === "boost") msg = "Issue boosted to high priority!";
      if (variables.action === "assign") msg = "Staff assigned successfully.";
      if (variables.action === "reject") msg = "Issue rejected.";
      if (variables.action === "status") msg = "Status updated.";
      
      Swal.fire("Success", msg, "success");
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      getRelatedQueriesToInvalidate().forEach(q => queryClient.invalidateQueries({ queryKey: q }));
      
      // Clear forms
      if (variables.action === "assign") setAssignStaffId("");
      if (variables.action === "status") setStatusToSet("");
    },
    onError: (err) => {
      Swal.fire("Error", err.response?.data?.message || "Action failed.", "error");
    }
  });

  const getRelatedQueriesToInvalidate = () => {
    return [["all-issues"], ["dashboard-stats"], ["my-issues"], ["assigned-issues"]];
  };

  // Handlers using SweetAlert
  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate();
        // Fire timeline event before deleting assuming backend handles timeline logic if deleted
      }
    });
  };

  const handleBoost = () => {
    Swal.fire({
      title: 'Boost Issue',
      text: "Boost priority to HIGH for 100 TK?",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Pay 100 TK'
    }).then((result) => {
      if (result.isConfirmed) {
        actionMutation.mutate({ action: "boost", payload: { amount: 100 } });
        timelineMutation.mutate({ status: "boosted", message: "Priority boosted via payment", role: "Citizen" });
      }
    });
  };

  const handleAssign = () => {
    if (!assignStaffId) return Swal.fire("Wait", "Select a staff member first.", "warning");
    actionMutation.mutate({ action: "assign", payload: { staffId: assignStaffId } });
    const selectedStaffName = availableStaff.find(s => s.id === assignStaffId || s._id === assignStaffId)?.name || 'Staff';
    timelineMutation.mutate({ status: "assigned", message: `Assigned to ${selectedStaffName}`, role: "Admin" });
  };

  const handleReject = () => {
    Swal.fire({
      title: 'Reject Issue?',
      text: "This will mark the issue securely as rejected and notify the citizen.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Reject'
    }).then((result) => {
      if (result.isConfirmed) {
        actionMutation.mutate({ action: "reject" });
        timelineMutation.mutate({ status: "rejected", message: "Issue rejected by administration", role: "Admin" });
      }
    });
  };

  const handleChangeStatus = () => {
    if (!statusToSet) return;
    Swal.fire({
      title: 'Update Status',
      text: `Change status to ${statusToSet}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Update'
    }).then((result) => {
      if (result.isConfirmed) {
        actionMutation.mutate({ action: "status", payload: { status: statusToSet } });
        timelineMutation.mutate({ 
          status: statusToSet, 
          message: `Status changed to ${statusToSet}`, 
          role: isAdmin ? "Admin" : "Staff" 
        });
      }
    });
  };

  const handleAddNote = () => {
    if (!timelineMessage.trim()) return Swal.fire("Empty Note", "Please write something.", "info");
    timelineMutation.mutate({ status: "note", message: timelineMessage, role: currentUser?.role || "Citizen" }, {
      onSuccess: () => {
        setTimelineMessage("");
        Swal.fire({ title: "Note Added", icon: "success", timer: 1500, showConfirmButton: false });
      }
    });
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
  if (isError || !issue) return (
    <div className="text-center py-20 text-slate-500">
      <h2 className="text-2xl font-bold text-rose-500 mb-2">Issue Not Found</h2>
      <Link to="/all-issues" className="text-blue-500 hover:underline">Return to issues list</Link>
    </div>
  );

  const imageSrc = issue.image || (issue.photos && issue.photos[0]?.url) || "/placeholder.png";
  const timeline = (issue.timeline || []).slice().sort((a, b) => new Date(b.timestamp || b.time || b.date || b.createdAt || 0) - new Date(a.timestamp || a.time || a.date || a.createdAt || 0));

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* ── Header Area ── */}
      <div className="bg-slate-900 border-b border-slate-800 pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/all-issues" className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to issues
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  issue.status === "resolved" ? "bg-emerald-500 text-white" :
                  issue.status === "in_progress" || issue.status === "working" ? "bg-blue-500 text-white" :
                  issue.status === "closed" ? "bg-slate-600 text-white" :
                  "bg-amber-500 text-white"
                }`}>
                  {issue.status?.replace("_", " ") || "PENDING"}
                </span>
                {issue.priority === "high" && (
                   <span className="px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold">URGENT</span>
                )}
                {issue.boosted && (
                   <span className="px-3 py-1 bg-amber-400 text-black rounded-full text-xs font-bold flex items-center gap-1 shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                     <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"/></svg>
                     BOOSTED
                   </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{issue.title}</h1>
              <div className="flex items-center gap-4 text-slate-400 mt-4 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {issue.category || "General"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {issue.location || "Unknown location"}
                </span>
              </div>
            </div>
            
            {/* Action buttons (Owner / Citizen) */}
            <div className="flex flex-wrap gap-3 md:justify-end shrink-0">
              {canEdit && (
                <Link to="/dashboard/my-issues" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors shadow">
                  Edit Issue
                </Link>
              )}
              {canDelete && (
                <button onClick={handleDelete} className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500 text-sm font-medium rounded-lg transition-all shadow">
                  Delete
                </button>
              )}
              {canBoost && (
                <button onClick={handleBoost} disabled={actionMutation.isPending} className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 text-sm font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)] rounded-lg transition-all transform hover:scale-105">
                  ⚡ Boost Priority (100 TK)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── Left Column: Media & Description ── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
              <div className="relative aspect-video bg-slate-100">
                <img src={imageSrc} alt={issue.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1.5 shadow">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                  {issue.upvoteCount ?? (issue.upvoters ? issue.upvoters.length : 0)} Upvotes
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[15px]">
                  {issue.description || "No detailed description provided."}
                </p>
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                     {(issue.reporterName?.[0] || "A").toUpperCase()}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-800">Reported by {issue.reporterName || issue.createdBy || "Anonymous Citizen"}</p>
                     <p className="text-xs text-slate-500">{formatDate(issue.createdAt || issue.created)}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Admin Management Panel */}
            {isAdmin && (
              <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                  <h3 className="text-indigo-900 font-bold flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Admin Controls
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assign Staff</label>
                      <div className="flex gap-2">
                        <select 
                          value={assignStaffId} 
                          onChange={(e) => setAssignStaffId(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                        >
                          <option value="">Choose staff member...</option>
                          {availableStaff.map((s) => (
                            <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.email || "staff"})</option>
                          ))}
                        </select>
                        <button onClick={handleAssign} disabled={actionMutation.isPending || !assignStaffId} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors shadow">
                          Assign
                        </button>
                      </div>
                    </div>
                    {issue.status === "pending" && (
                      <div className="md:border-l md:border-slate-100 md:pl-6 md:w-1/3 flex items-end">
                        <button onClick={handleReject} disabled={actionMutation.isPending} className="w-full px-4 py-2 bg-white border-2 border-rose-500 text-rose-500 hover:bg-rose-50 font-medium rounded-lg text-sm transition-colors">
                          Reject Issue
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Timeline & Progress ── */}
          <div className="space-y-6 lg:mt-0">
            
            {/* Staff Assigned Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Handling Staff</h3>
              {issue.assignedStaff ? (
                <div className="flex items-center gap-4">
                  <img src={issue.assignedStaff.avatar || "https://ui-avatars.com/api/?name=" + issue.assignedStaff.name} alt={issue.assignedStaff.name} className="w-12 h-12 rounded-full border border-slate-200" />
                  <div>
                    <h4 className="font-bold text-slate-800">{issue.assignedStaff.name}</h4>
                    <p className="text-xs text-slate-500">Contact: {issue.assignedStaff.contact || issue.assignedStaff.email || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-dashed border-slate-200">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm font-medium">No staff assigned yet.</span>
                </div>
              )}
            </div>

            {/* Post Update (Staff/Admin/Citizen) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Post an Update</h3>
               <textarea 
                 value={timelineMessage} 
                 onChange={(e) => setTimelineMessage(e.target.value)}
                 placeholder="Add a progress note, question, or updates to the timeline..."
                 className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 min-h-[100px] mb-3 resize-none"
               />
               <div className="flex flex-col sm:flex-row gap-2">
                 {(isStaff || isAdmin) && (
                   <select 
                     value={statusToSet} 
                     onChange={(e) => setStatusToSet(e.target.value)}
                     className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 shadow-sm flex-1 cursor-pointer"
                   >
                     <option value="">Change status to...</option>
                     <option value="pending">Mark Pending</option>
                     <option value="in_progress">Mark In-Progress</option>
                     <option value="resolved">Mark Resolved</option>
                     <option value="closed">Mark Closed</option>
                   </select>
                 )}
                 {(isStaff || isAdmin) && statusToSet ? (
                   <button onClick={handleChangeStatus} disabled={actionMutation.isPending} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm">
                     Update Status
                   </button>
                 ) : (
                   <button onClick={handleAddNote} disabled={timelineMutation.isPending || !timelineMessage.trim()} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-sm transition-colors shadow-sm w-full">
                     Add to Timeline
                   </button>
                 )}
               </div>
            </div>

            {/* Timeline UI */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Issue Timeline
              </h3>
              
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {timeline.length === 0 ? (
                    <li className="pb-8">
                      <p className="text-sm text-slate-500 italic text-center">No timeline events recorded.</p>
                    </li>
                  ) : timeline.map((event, eventIdx) => (
                    <li key={event._id || eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== timeline.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              event.status === 'resolved' ? 'bg-emerald-500' :
                              event.status === 'in_progress' || event.status === 'assigned' ? 'bg-blue-500' :
                              event.status === 'rejected' ? 'bg-rose-500' :
                              event.status === 'boosted' ? 'bg-amber-400' :
                              'bg-slate-400'
                            }`}>
                              {event.status === 'resolved' ? <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : 
                               event.status === 'assigned' ? <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> :
                               event.status === 'boosted' ? <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"/></svg> :
                               <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-slate-800">
                                {event.message}{' '}
                                <span className="font-medium text-slate-900 border-b border-dashed border-slate-300">
                                  by {event.updatedBy || event.role || "System"}
                                </span>
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-xs text-slate-500 font-medium">
                              <time dateTime={event.timestamp || event.createdAt}>{formatDate(event.timestamp || event.createdAt)}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
