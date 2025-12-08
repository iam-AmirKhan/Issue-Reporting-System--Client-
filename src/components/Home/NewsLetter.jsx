import React, { useState } from "react";

export default function NewsLetter() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(null);

  const subscribe = (e) => {
    e.preventDefault();
    setOk(true);
    setTimeout(() => setOk(null), 3000);
    setEmail("");
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-lg p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">Stay updated</h3>
            <p className="text-sm opacity-80">Get monthly updates about resolved issues and community events.</p>
          </div>
          <form onSubmit={subscribe} className="flex gap-2">
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Your email" required className="px-3 py-2 rounded text-white" />
            <button className="bg-white text-slate-900 px-4 py-2 rounded">Subscribe</button>
          </form>
        </div>
        {ok && <p className="mt-3 text-sm">Thank you — you are subscribed!</p>}
      </div>
    </section>
  );
}
