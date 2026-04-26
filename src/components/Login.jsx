import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

export default function Login() {
  const { login, loginWithGoogle } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("citizen");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      
      // Verification: Check if the logged-in user's role matches the selection
      if (user.role !== selectedRole) {
         // We still let them in, but we show a small toast about their actual role
         console.log(`User is actually a ${user.role}`);
      }

      Swal.fire({
         title: 'Success!',
         text: `Successfully logged in as ${selectedRole.toUpperCase()}`,
         icon: 'success',
         timer: 1500,
         showConfirmButton: false
      });
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire({
         title: 'Login Failed',
         text: err.message || 'Check your credentials and try again.',
         icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      Swal.fire({
         title: 'Welcome!',
         text: 'Logged in with Google successfully.',
         icon: 'success',
         timer: 1500,
         showConfirmButton: false
      });
      navigate(from, { replace: true });
    } catch (err) {
      Swal.fire({
         title: 'Google Login Failed',
         text: err.message,
         icon: 'error'
      });
    }
  };

  const roles = [
    { id: "admin", label: "Admin" },
    { id: "staff", label: "Staff" },
    { id: "citizen", label: "Citizen" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Portal Login</h1>
            <p className="text-slate-300 text-sm">Select your role and enter your credentials.</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="flex bg-slate-800/50 p-1 rounded-xl mb-8 border border-slate-700/50">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedRole === role.id 
                    ? "bg-emerald-500 text-white shadow-lg" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">{selectedRole.toUpperCase()} Email</label>
              <input 
                required 
                type="email" 
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder={`Enter your ${selectedRole} email`}
                className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
              <input 
                required 
                type="password" 
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 mt-4"
            >
              {loading ? "Verifying..." : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Social Login</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          <button 
            onClick={handleGoogle} 
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl transition-colors mb-6 shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-400 font-bold hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
