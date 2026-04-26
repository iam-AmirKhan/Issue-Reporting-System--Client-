import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ReportIssue() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
  });

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await axios.get("/api/users/me")).data
  });

  const { data: myCount } = useQuery({
    queryKey: ["my-issue-count"],
    queryFn: async () =>
      (await axios.get("/api/issues/count?mine=true")).data.count
  });

  const createMutation = useMutation({
    mutationFn: async () => await axios.post("/api/issues", form),
    onSuccess: () => {
      qc.invalidateQueries(["my-issues"]);
      window.location.href = "/dashboard/my-issues";
    }
  });

  const disabled = !user?.isPremium && myCount >= 3;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Report Issue</h1>

      {disabled && (
        <div className="p-3 bg-yellow-200 rounded mb-3 text-black">
          Free users can submit only <b>3 issues</b>.
          <a
            href="/dashboard/profile"
            className="ml-2 text-blue-600 underline"
          >
            Upgrade to Premium
          </a>
        </div>
      )}

      <input
        name="title"
        placeholder="Title"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <textarea
        name="description"
        placeholder="Description"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        name="category"
        placeholder="Category"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        name="location"
        placeholder="Location"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <button
        disabled={disabled}
        onClick={() => createMutation.mutate()}
        className={`w-full py-2 rounded text-white ${
          disabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
        }`}
      >
        Submit Issue
      </button>
    </div>
  );
}
