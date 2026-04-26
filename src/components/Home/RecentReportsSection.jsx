import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import IssueCards from "../IssueCards";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";

export default function RecentReportsSection() {
  const { user: currentUser } = useContext(AuthContext);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["recent-reports"],
    queryFn: async () => {
      const res = await api.get("/api/issues?limit=6");
      return Array.isArray(res.data) ? res.data : (res.data.issues || res.data.data || []);
    },
    staleTime: 30 * 1000,
  });

  if (isLoading) return null;
  if (issues.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="max-w-xl text-center md:text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
            >
              Recent <span className="text-emerald-600">Community Reports</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 mt-2"
            >
              The latest infrastructure issues reported by citizens in your area.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/all-issues" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              Explore All Reports
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {issues.map((issue, idx) => (
            <motion.div
              key={issue._id || issue.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <IssueCards issue={issue} currentUser={currentUser} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
