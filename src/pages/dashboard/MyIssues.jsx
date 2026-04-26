import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import EditIssueModal from "./EditIssueModal";

export default function MyIssues() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-issues"],
    queryFn: async () => (await axios.get("/api/issues?mine=true")).data
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`/api/issues/${id}`),
    onSuccess: () => qc.invalidateQueries(["my-issues"])
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl text-black font-bold mb-4">My Issues</h1>

      <div className="space-y-4">
        {data?.map((issue) => (
          <div
            key={issue._id}
            className="p-4 bg-white rounded shadow flex justify-between"
          >
            <div>
              <h2 className="font-bold">{issue.title}</h2>
              <p className="text-sm text-gray-600">{issue.status}</p>
            </div>

            <div className="flex gap-3">
              {issue.status === "pending" && (
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => setEditing(issue)}
                >
                  Edit
                </button>
              )}

              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => deleteMutation.mutate(issue._id)}
              >
                Delete
              </button>

              <a
                href={`/issues/${issue._id}`}
                className="px-3 py-1 bg-gray-700 text-white rounded"
              >
                View
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditIssueModal issue={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
