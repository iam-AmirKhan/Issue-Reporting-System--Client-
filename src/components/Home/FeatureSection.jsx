import React from "react";

const FEATURES = [
  { id: "f1", title: "Quick reporting", desc: "Submit a report with photo & location in under 30 seconds." },
  { id: "f2", title: "Authority notifications", desc: "Relevant departments receive automatic notifications." },
  { id: "f3", title: "Track progress", desc: "Follow your report from 'Open' to 'Resolved'." },
  { id: "f4", title: "Community validation", desc: "Citizens can upvote issues to prioritize fixes." },
];

export default function FeatureSection() {
  return (
    <section className="py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl text-black font-bold mb-6">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(f => (
            <div key={f.id} className="bg-white p-5 rounded shadow">
              <h3 className="font-semibold mb-2 text-black">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
