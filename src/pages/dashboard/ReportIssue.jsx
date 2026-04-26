import { useState } from "react";
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

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await api.get("/api/users/me")).data
  });

  const { data: myCount = 0 } = useQuery({
    queryKey: ["my-issue-count"],
    queryFn: async () => (await api.get("/api/issues/count?mine=true")).data.count
  });

  const isBlocked = !!(user?.isBlocked || user?.blocked);
  const limitReached = !userLoading && !user?.isPremium && myCount >= 3;
  const disabled = isBlocked || limitReached;

  const createMutation = useMutation({
    mutationFn: async (payload) => await api.post("/api/issues", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-issues"] });
      qc.invalidateQueries({ queryKey: ["my-issue-count"] });
      Swal.fire("Reported!", "Your issue has been successfully submitted.", "success");
      navigate("/dashboard/my-issues");
    },
    onError: (err) => {
      Swal.fire("Error", err.response?.data?.message || "Failed to submit issue", "error");
    }
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.location) {
      return Swal.fire("Incomplete Field", "Please fill out all fields.", "warning");
    }

    let uploadedUrl = "";

    if (photoFile) {
      try {
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
            (err) => reject(err),
            async () => {
              const dl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(dl);
            }
          );
        });
      } catch (err) {
        console.error("Image upload failed", err);
        Swal.fire("Upload Failed", "Could not upload image. Attempting submission without photo.", "warning");
      }
    }

    createMutation.mutate({ ...form, image: uploadedUrl });
  };

  if (userLoading) return <div className="text-center py-20 animate-pulse text-slate-400 font-bold">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800">Report an Issue</h1>
        <p className="text-slate-500 mt-1 pb-4 border-b border-slate-100">Contribute to the community by mapping local infrastructure problems.</p>
      </div>

      {disabled && (
        <div className={`${isBlocked ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800"} border p-4 rounded-xl mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4`}>
           <div className="flex gap-3 items-center">
             <div className={`p-2 ${isBlocked ? "bg-rose-100" : "bg-amber-100"} rounded-full shrink-0`}>
               <svg className={`w-5 h-5 ${isBlocked ? "text-rose-600" : "text-amber-600"}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
             </div>
             <div>
               <h4 className="font-bold text-sm">{isBlocked ? "Account Restricted" : "Submission Limit Reached"}</h4>
               <p className={`text-xs ${isBlocked ? "text-rose-700/80" : "text-amber-700/80"}`}>
                 {isBlocked ? "Blocked users cannot submit, edit, upvote, or boost issues. Please contact the authorities." : "Free users can submit a maximum of 3 issues."}
               </p>
             </div>
           </div>
           {!isBlocked && <button onClick={() => navigate("/dashboard/profile-dashboard")} className="px-5 py-2 shrink-0 bg-amber-500 hover:bg-amber-600 font-bold text-white text-sm rounded-lg shadow-sm transition-colors">
             Upgrade to Premium
           </button>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Title</label>
          <input name="title" value={form.title} onChange={handleChange} disabled={disabled} placeholder="E.g., Deep pothole on Main Street" className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
          <select name="category" value={form.category} onChange={handleChange} disabled={disabled} className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-700 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100 cursor-pointer">
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
          <label className="block text-sm font-semibold text-slate-700 mb-2">Location Mapping</label>
          <input name="location" value={form.location} onChange={handleChange} disabled={disabled} placeholder="E.g., 5th Ave & 23rd St, NYC" className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100" />
        </div>

        <div>
           <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Description</label>
           <textarea name="description" value={form.description} onChange={handleChange} disabled={disabled} rows="4" placeholder="Describe the severity, duration, and exact spot..." className="w-full bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100 resize-none"></textarea>
        </div>

        <div>
           <label className="block text-sm font-semibold text-slate-700 mb-2">Photographic Evidence</label>
           <div className={`mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-slate-200 border-dashed rounded-xl ${disabled ? 'opacity-50 bg-slate-100' : 'bg-slate-50 hover:bg-slate-100 hover:border-emerald-300 transition-colors cursor-pointer group'}`}>
             <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400 group-hover:text-emerald-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                   <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex justify-center text-sm text-slate-600 font-medium">
                  <label htmlFor="file-upload" className={`relative cursor-pointer rounded-md border-none font-bold outline-none ${disabled ? '' : 'text-emerald-600 hover:text-emerald-500'}`}>
                    <span>{photoFile ? photoFile.name : "Upload a file"}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setPhotoFile(e.target.files[0])} disabled={disabled} accept="image/*" />
                  </label>
                </div>
                {!photoFile && <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>}
             </div>
           </div>
           
           {/* Progress bar */}
           {uploadProgress > 0 && uploadProgress < 100 && (
             <div className="w-full bg-slate-200 rounded-full h-2.5 mt-3">
               <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
             </div>
           )}
        </div>

        <div className="pt-4 border-t border-slate-100">
           <button type="submit" disabled={disabled || createMutation.isPending} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:shadow-none transition-all">
             {createMutation.isPending || (uploadProgress > 0 && uploadProgress < 100) ? "Submitting Report..." : "Submit Report"}
           </button>
        </div>

      </form>
    </div>
  );
}
