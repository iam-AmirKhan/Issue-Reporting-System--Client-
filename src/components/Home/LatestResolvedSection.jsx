import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axiosConfig";
import IssueCards from "../IssueCards";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";

export default function LatestResolvedSection() {
  const { user: currentUser } = useContext(AuthContext);

  const { data: issues = [], isLoading, isError } = useQuery({
    queryKey: ["latest-issues"],
    queryFn: async () => {
      const res = await api.get("/api/issues?status=resolved&limit=6");
      const resultData = res.data;
      const data = Array.isArray(resultData)
        ? resultData
        : Array.isArray(resultData.issues)
          ? resultData.issues
          : Array.isArray(resultData.data)
            ? resultData.data
            : [];
      
      return data
        .filter((issue) => {
          const s = (issue.status || "").toLowerCase().replace("-", "_");
          return s === "resolved";
        })
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 6);
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-64 bg-slate-50 rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
     return null; // Silent fail on home section error or show error message
  }

  if (issues.length === 0) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-2xl font-bold text-slate-800 mb-2">No Reports Yet</h2>
           <p className="text-slate-500">Be the first to report an infrastructure issue in your area.</p>
           <Link to="/dashboard/report-issue" className="inline-block mt-4 text-emerald-600 font-bold hover:underline">
              Start Reporting →
           </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[100px] -mr-48 -mt-48"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -ml-48 -mb-48"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="max-w-xl text-center md:text-left">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
            >
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">Resolved Issues</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-500 mt-2"
            >
              Recently completed public infrastructure work from the community timeline.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/all-issues" className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-500 group transition-all">
              View All Issues
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {issues.map((issue, idx) => (
            <motion.div
              key={issue._id || issue.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <IssueCards
                issue={issue}
                currentUser={currentUser}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
