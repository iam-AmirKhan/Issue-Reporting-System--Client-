import React from "react";

const TESTS = [
  { id: 1, name: "Rina", text: "I reported a broken streetlight and it was fixed within a week!" },
  { id: 2, name: "Jamal", text: "Great app — made reporting so easy." },
];

export default function Testimonials() {
  return (
    <section className="py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl text-black font-bold mb-6">What citizens say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTS.map(t => (
            <div key={t.id} className="bg-white p-6 rounded shadow">
              <p className="text-slate-700 mb-3">“{t.text}”</p>
              <div className="text-sm text-slate-500">— {t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
