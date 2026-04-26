import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => (await axios.get("/api/dashboard/stats")).data
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl text-black font-bold mb-4">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Issues", value: data.total },
          { label: "Pending", value: data.pending },
          { label: "In Progress", value: data.inProgress },
          { label: "Resolved", value: data.resolved }
        ].map((card) => (
          <div key={card.label} className="p-4 bg-white rounded shadow">
            <p className="text-gray-600">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
