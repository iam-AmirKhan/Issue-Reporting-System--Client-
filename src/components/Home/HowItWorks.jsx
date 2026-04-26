import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Report an Issue",
    desc: "Snap a photo, add a brief description, and pinpoint the location on the map. It takes less than a minute.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    step: "02",
    title: "Authorities Notified",
    desc: "Your report is instantly routed to the relevant department based on the selected category and region.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    step: "03",
    title: "Track Progress",
    desc: "Receive real-time timeline updates as staff are assigned to the issue and work transitions from pending to resolved.",
    color: "from-amber-400 to-orange-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-slate-50 overflow-hidden relative">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight"
          >
            How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">works</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            A streamlined process designed to bring citizens and authorities together to solve community infrastructure problems fast.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[4rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-300 via-emerald-300 to-amber-300 z-0"></div>

          {steps.map((s, i) => (
            <motion.div 
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.15, type: "spring", stiffness: 100 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${s.color} p-1 shadow-lg shadow-black/10 mb-6 transform group-hover:-translate-y-2 transition-transform duration-300`}>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative shadow-inner">
                  <span className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br ${s.color}`}>
                    {s.step}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-3">{s.title}</h3>
              <p className="text-slate-600 leading-relaxed max-w-sm">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
