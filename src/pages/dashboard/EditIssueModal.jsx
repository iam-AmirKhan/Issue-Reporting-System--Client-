import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export default function EditIssueModal({ issue, onClose }) {
  const [form, setForm] = useState({
    title: issue.title,
    description: issue.description,
    category: issue.category
  });

  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () =>
      await axios.put(`/api/issues/${issue._id}`, form),
    onSuccess: () => {
      qc.invalidateQueries(["my-issues"]);
      onClose();
    }
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 w-full max-w-md rounded shadow">
        <h2 className="text-xl font-bold mb-3">Edit Issue</h2>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => updateMutation.mutate()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
