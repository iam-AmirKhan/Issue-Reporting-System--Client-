import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link to="/" className="text-xl font-black text-white">
              Infra<span className="text-emerald-400">Care</span>
            </Link>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Public infrastructure issue reporting for citizens, municipal staff, and administrators.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/all-issues" className="hover:text-white transition-colors">All Issues</Link>
            <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link to="/community" className="hover:text-white transition-colors">Community</Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800 text-sm text-slate-500">
          (c) {new Date().getFullYear()} InfraCare Public Issue Reporting System.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
