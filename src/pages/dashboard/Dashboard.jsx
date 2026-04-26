import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Link } from "react-router-dom";
import StatsChart from "../../components/Dashboard/StatsChart";

export default function Dashboard() {
  const { user, role } = useOutletContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => (await api.get("/api/dashboard/stats")).data,
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
    </div>
  );

  const chartData = [
    { name: 'Pending', value: stats?.pending || 0 },
    { name: 'In Progress', value: stats?.inProgress || 0 },
    { name: 'Resolved', value: stats?.resolved || 0 },
  ].filter(x => x.value > 0);

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-slate-500">Here is what is happening with your infrastructure reports today.</p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Issues", value: stats?.total || 0, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending", value: stats?.pending || 0, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "In Progress", value: stats?.inProgress || 0, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Resolved", value: stats?.resolved || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg} ${card.color}`}>
              <span className="font-bold text-xl">{card.value}</span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Visual Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Issue Distribution</h3>
          <p className="text-sm text-slate-400 mb-6">Breakdown of reports by current status.</p>
          <StatsChart data={chartData} type="pie" />
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="text-lg font-bold text-slate-800 mb-1">Weekly Activity</h3>
           <p className="text-sm text-slate-400 mb-6">Reports volume across the status spectrum.</p>
           <StatsChart data={chartData} type="bar" />
        </div>
      </div>

      {role === "citizen" && (
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <h3 className="text-2xl font-bold text-white mb-2">Have a new issue to report?</h3>
               <p className="text-slate-300 max-w-lg">Help us keep the city clean and functional. Report potholes, broken lights, or water leaks in under a minute.</p>
             </div>
             <Link to="/dashboard/report-issue" className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)]">
               Report Issue Now
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
