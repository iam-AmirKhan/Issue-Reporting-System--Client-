import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Report the issue",
    text: "Citizens submit a title, category, photo, description, and exact location for public problems like potholes, broken lights, leaks, and waste overflow.",
  },
  {
    title: "Admin reviews it",
    text: "Administrators verify the report, reject invalid submissions, or assign the issue to a municipal staff member.",
  },
  {
    title: "Staff updates progress",
    text: "Assigned staff move the issue through pending, in-progress, working, resolved, and closed statuses while adding timeline updates.",
  },
  {
    title: "Citizens track outcomes",
    text: "Reporters and community members can follow the timeline, upvote important issues, and see resolution progress.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-slate-50">
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-300 mb-4">How it works</p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">A clear path from public report to resolved issue.</h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              InfraCare connects citizens, admins, and staff through a traceable workflow that keeps every important action in the issue timeline.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white border border-slate-100 rounded-lg p-6 shadow-sm"
            >
              <span className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black mb-5">
                {index + 1}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mb-3">{step.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{step.text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 bg-white border border-slate-100 rounded-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Ready to report a public issue?</h2>
            <p className="text-slate-500 mt-2">Submit a clear report and let the system track the response from start to closure.</p>
          </div>
          <Link to="/dashboard/report-issue" className="inline-flex items-center justify-center px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors">
            Report Issue
          </Link>
        </div>
      </section>
    </main>
  );
}
