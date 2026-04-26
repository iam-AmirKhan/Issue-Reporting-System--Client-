import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-lg text-center bg-white border border-slate-100 rounded-lg shadow-sm p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-3">404 Not Found</p>
        <h1 className="text-4xl font-black text-slate-900 mb-4">This page is outside the service map.</h1>
        <p className="text-slate-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  );
}
