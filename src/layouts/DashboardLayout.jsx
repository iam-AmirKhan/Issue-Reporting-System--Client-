import { Outlet, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user: authUser } = useContext(AuthContext);

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await api.get("/api/users/me")).data,
    initialData: authUser, // Start with context user
  });

  if (isLoading && !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const role = user?.role || "citizen";

  const getLinks = () => {
    const base = [
      { path: "/dashboard", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { path: "/dashboard/profile-dashboard", label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    ];

    if (role === "citizen") {
      base.push(
        { path: "/dashboard/my-issues", label: "My Issues", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { path: "/dashboard/report-issue", label: "Report Issue", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" }
      );
    } else if (role === "staff") {
      base.push(
        { path: "/dashboard/assigned-issues", label: "Assigned Issues", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" }
      );
    } else if (role === "admin") {
      base.push(
        { path: "/dashboard/manage-issues", label: "Manage Issues", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { path: "/dashboard/manage-users", label: "Manage Citizens", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
        { path: "/dashboard/manage-staff", label: "Manage Staff", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
        { path: "/dashboard/payments", label: "Payments (PDF)", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" }
      );
    }
    return base;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen pt-4 pb-12 gap-6 px-4">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-24">
            
            {/* User Meta */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl uppercase">
                    {(user?.name || "U")[0]}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-slate-800 text-lg truncate">{user?.name || "User"}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">{role}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {getLinks().map((link) => (
                <NavLink
                  key={link.path}
                  end={link.path === "/dashboard"}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                    }`
                  }
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[500px]">
            <Outlet context={{ user, role }} />
          </div>
        </main>
        
      </div>
    </div>
  );
}
