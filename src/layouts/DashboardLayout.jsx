import { Outlet, Link } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 flex gap-6">
        <aside className="w-64 bg-white p-4 rounded shadow h-fit">
          <h3 className="font-semibold mb-4">Dashboard</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dashboard" className="block">Overview</Link></li>
            <li><Link to="/dashboard/my-issues" className="block">My Issues</Link></li>
            <li><Link to="/dashboard/payments" className="block">Payments</Link></li>
            <li><Link to="/dashboard/profile" className="block">Profile</Link></li>
          </ul>
        </aside>

        <main className="flex-1">
          <div className="bg-white p-6 rounded shadow">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
