import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase.config";

export default function ReportIssue() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", description: "", category: "", location: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user details from backend
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await api.get("/api/users/me");
      return res.data;
    }
  });

  // Fetch issue count for the current user
  const { data: myCount = 0, isLoading: countLoading, isError: countError } = useQuery({
    queryKey: ["my-issue-count"],
    queryFn: async () => {
      const res = await api.get("/api/issues/count?mine=true");
      return res.data.count ?? 0;
    }
  });

  const isBlocked = !!(user?.isBlocked || user?.blocked);
  const isPremium = !!user?.isPremium;
  const isCitizen = user?.role === "citizen";
  // Only enforce limit if user is a citizen, not premium, and has 3 or more issues
  const limitReached = !userLoading && !countLoading && !countError && isCitizen && !isPremium && Number(myCount) >= 3;
  const disabled = isBlocked || limitReached;

  console.log("[ReportIssue] state:", { isBlocked, isPremium, myCount, limitReached, disabled, userLoading, countLoading, countError, user });

  useEffect(() => {
    if (userError) {
      console.error("Error fetching user data:", userError);
    }
  }, [userError]);

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      console.log("[ReportIssue] Submitting to API:", payload);
      const res = await api.post("/api/issues", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-issues"] });
      qc.invalidateQueries({ queryKey: ["my-issue-count"] });
      setUploadProgress(0);
      setPhotoFile(null);
      setForm({ title: "", description: "", category: "", location: "" });
      Swal.fire({
        title: "Reported!",
        text: "Your issue has been successfully submitted.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
      setIsSubmitting(false);
      navigate("/dashboard/my-issues");
    },
    onError: (err) => {
      console.error("[ReportIssue] Mutation Error:", err);
      setIsSubmitting(false);
      setUploadProgress(0);
      const msg = err.response?.data?.message || err.message || "Failed to submit issue. Please try again.";
      Swal.fire("Submission Failed", msg, "error");
    }
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[ReportIssue] handleSubmit triggered", { disabled, isSubmitting });

    if (disabled || isSubmitting) return;

    if (!form.title || !form.description || !form.category || !form.location) {
      return Swal.fire("Incomplete Field", "Please fill out all fields.", "warning");
    }

    setIsSubmitting(true);
    let uploadedUrl = "";

    if (photoFile) {
      try {
        console.log("[ReportIssue] Starting photo upload:", photoFile.name);
        const safeName = `${Date.now()}-${photoFile.name.replace(/\s+/g, "_")}`;
        const storageRef = ref(storage, `issues/${safeName}`);
        const uploadTask = uploadBytesResumable(storageRef, photoFile);

        uploadedUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snap) => {
              const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
              setUploadProgress(pct);
            },
            (err) => {
              console.error("[ReportIssue] Photo upload task error:", err);
              setUploadProgress(0);
              reject(err);
            },
            async () => {
              const dl = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("[ReportIssue] Photo upload complete:", dl);
              setUploadProgress(100);
              resolve(dl);
            }
          );
        });
      } catch (err) {
        console.error("[ReportIssue] Image upload failed", err);
        setUploadProgress(0);
        const proceed = await Swal.fire({
          title: "Upload Failed",
          text: "Could not upload image. Submit the report without the photo?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, submit",
          cancelButtonText: "No, cancel"
        });
        
        if (!proceed.isConfirmed) {
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      console.log("[ReportIssue] Calling mutateAsync with payload:", { ...form, image: uploadedUrl });
      Swal.fire({
        title: 'Submitting Report...',
        text: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const result = await createMutation.mutateAsync({ ...form, image: uploadedUrl });
      console.log("[ReportIssue] Submission result:", result);
      console.log("[ReportIssue] mutateAsync result:", result);
    } catch (err) {
      console.error("[ReportIssue] mutateAsync catch block error:", err);
      // Ensure isSubmitting is false if error occurred and mutation onError didn't fire or wasn't enough
      setIsSubmitting(false);
    } finally {
      // Safety net to ensure we don't stay in loading state forever
      // However, onSuccess handles navigation, so we only reset if still mounted
      console.log("[ReportIssue] handleSubmit finished");
    }
  };

  if (userLoading) return <div className="text-center py-20 animate-pulse text-slate-400 font-bold">Loading user data...</div>;
  if (userError) return <div className="text-center py-20 text-red-500 font-bold">Failed to load user data. Please refresh the page.</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-up px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Report an Issue</h1>
        <p className="text-slate-600 mt-2">Contribute to the community by mapping local infrastructure problems.</p>
        <div className="h-1 w-20 bg-emerald-500 mt-4 rounded-full"></div>
      </div>

      {disabled && (
        <div className={`${isBlocked ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-800"} border p-5 rounded-2xl mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all`}>
           <div className="flex gap-4 items-center">
             <div className={`p-3 ${isBlocked ? "bg-red-100" : "bg-amber-100"} rounded-full shrink-0`}>
               <svg className={`w-6 h-6 ${isBlocked ? "text-red-600" : "text-amber-600"}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
             </div>
             <div>
               <h4 className="font-bold text-lg">{isBlocked ? "Account Restricted" : "Submission Limit Reached"}</h4>
               <p className={`text-sm ${isBlocked ? "text-red-700" : "text-amber-700"}`}>
                 {isBlocked ? "Blocked users cannot submit issues. Please contact support." : "You have reached the limit of 3 issues for free accounts."}
               </p>
             </div>
           </div>
           {!isBlocked && (
             <button onClick={() => navigate("/dashboard/profile-dashboard")} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 font-bold text-white text-sm rounded-xl shadow-md transition-all whitespace-nowrap">
               Upgrade to Premium
             </button>
           )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Issue Title</label>
            <input name="title" value={form.title} onChange={handleChange} disabled={disabled} placeholder="E.g., Deep pothole on Main Street" className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
            <select name="category" value={form.category} onChange={handleChange} disabled={disabled} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-slate-800 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100 cursor-pointer">
              <option value="">Select a category...</option>
              <option value="Roads & Sidewalks">Roads & Sidewalks</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Electricity & Lighting">Electricity & Lighting</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Public Transport">Public Transport</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Location Mapping</label>
            <input name="location" value={form.location} onChange={handleChange} disabled={disabled} placeholder="E.g., 5th Ave & 23rd St, NYC" className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100" />
          </div>
        </div>

        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Description</label>
           <textarea name="description" value={form.description} onChange={handleChange} disabled={disabled} rows="4" placeholder="Describe the severity, duration, and exact spot..." className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100 resize-none"></textarea>
        </div>

        <div>
           <label className="block text-sm font-bold text-slate-700 mb-2">Photographic Evidence (Optional)</label>
           <div className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-200 border-dashed rounded-2xl ${disabled ? 'opacity-50 bg-slate-100' : 'bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all cursor-pointer group'}`}>
             <div className="space-y-2 text-center">
                <svg className="mx-auto h-14 w-14 text-slate-400 group-hover:text-emerald-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                   <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col items-center text-sm text-slate-600 font-medium">
                  <label htmlFor="file-upload" className={`relative cursor-pointer rounded-md font-bold ${disabled ? '' : 'text-emerald-600 hover:text-emerald-500'}`}>
                    <span>{photoFile ? photoFile.name : "Click to upload an image"}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setPhotoFile(e.target.files[0])} disabled={disabled} accept="image/*" />
                  </label>
                  {!photoFile && <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>}
                </div>
             </div>
           </div>
           
           {uploadProgress > 0 && uploadProgress < 100 && (
             <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden shadow-inner">
               <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
             </div>
           )}
        </div>

        <div className="pt-6">
           <button type="submit" disabled={disabled || isSubmitting} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-emerald-500/20 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-slate-400 disabled:shadow-none transition-all">
             {isSubmitting ? (
               <span className="flex items-center gap-2">
                 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 {uploadProgress > 0 && uploadProgress < 100 ? `Uploading Photo (${uploadProgress}%)...` : "Submitting Report..."}
               </span>
             ) : "Submit Issue Report"}
           </button>
        </div>
      </form>
    </div>
  );
}
