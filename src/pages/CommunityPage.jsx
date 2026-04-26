import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const highlights = [
  { label: "Transparency", text: "Every assignment, payment boost, rejection, status change, and closure creates an audit-friendly timeline entry." },
  { label: "Priority support", text: "Premium citizens can submit unlimited issues, and boosted issues stay above normal reports." },
  { label: "Role clarity", text: "Citizens report and track, staff work assigned tasks, and admins manage people, payments, and dispatch." },
];

export default function CommunityPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1800&auto=format&fit=crop"
          alt="City infrastructure and roads"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-white">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-300 mb-4">Community impact</p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">Public infrastructure works better when reports are visible.</h1>
            <p className="text-lg text-slate-200 leading-relaxed">
              InfraCare gives residents one place to raise local issues and gives municipal teams the operational view they need to respond faster.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="border border-slate-100 rounded-lg p-6 shadow-sm bg-slate-50"
            >
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">{item.label}</h2>
              <p className="text-slate-600 leading-relaxed">{item.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">What citizens can report</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              The platform supports practical city-service cases from the project brief: broken streetlights, potholes, water leakage, garbage overflow, damaged footpaths, and other public infrastructure issues.
            </p>
            <Link to="/all-issues" className="inline-flex items-center justify-center px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors">
              Browse Issues
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Streetlights", "Potholes", "Water leakage", "Garbage overflow", "Footpaths", "Public transport"].map((label) => (
              <div key={label} className="bg-white border border-slate-100 rounded-lg px-4 py-5 text-center shadow-sm">
                <span className="text-sm font-bold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
