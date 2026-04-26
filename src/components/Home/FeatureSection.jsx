import React from "react";
import { motion } from "framer-motion";

const FEATURES = [
  { 
    id: "f1", 
    title: "Quick Reporting", 
    desc: "Submit a report with photo & location in under 30 seconds using our intuitive map interface.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    color: "bg-amber-500"
  },
  { 
    id: "f2", 
    title: "Instant Routing", 
    desc: "Relevant departments receive automatic notifications based on the issue category and location.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "bg-blue-500"
  },
  { 
    id: "f3", 
    title: "Transparent Tracking", 
    desc: "Follow your report in real-time. Transparent milestones from assignment to final resolution.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "bg-emerald-500"
  },
  { 
    id: "f4", 
    title: "Community Voice", 
    desc: "Citizens can upvote existing issues to help authorities prioritize effectively.",
    icon: "M14 10h4.708c.953 0 1.258-1.121.579-1.785l-7.292-7.147a.8.8 0 00-1.157 0L3.547 8.215C2.868 8.88 3.173 10 4.125 10H8.875v7.2a.8.8 0 00.8.8h4.325a.8.8 0 00.8-.8V10z",
    color: "bg-indigo-500"
  },
];

export default function FeatureSection() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4"
          >
            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">Features</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500"
          >
            Our platform provides the necessary tools for smooth communication between citizens and city workers.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f, idx) => (
            <motion.div 
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-white hover:border-emerald-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 shadow-lg shadow-black/5 transform group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                 <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                 </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
