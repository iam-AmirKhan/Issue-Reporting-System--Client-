import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

export default function Register() {
  const { registerWithPhoto, loginWithGoogle, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect to dashboard after Google redirect login
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return Swal.fire("Incomplete Field", "Please fill out all required fields.", "warning");
    }
    if (form.password.length < 6) {
      return Swal.fire("Weak Password", "Password should be at least 6 characters.", "warning");
    }
    setLoading(true);
    try {
      await registerWithPhoto(form.name, form.email, form.password, file);
      Swal.fire({
         title: 'Registration Successful',
         text: 'Welcome to InfraCare!',
         icon: 'success',
         timer: 1500,
         showConfirmButton: false
      });
      navigate("/");
    } catch (err) {
      Swal.fire({
         title: 'Registration Failed',
         text: err.message || 'Something went wrong.',
         icon: 'error'
      });
    } finally {
       setLoading(false);
    }
  };

  const handleGoogle = () => {
    loginWithGoogle()
      .then(() => {
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        Swal.fire({ title: 'Google Login Failed', text: err.message, icon: 'error' });
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Create an Account</h1>
            <p className="text-slate-300 text-sm">Join the community and start reporting infrastructure issues today.</p>
          </div>

          <button 
            onClick={handleGoogle} 
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl transition-colors mb-6 shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">or sign up with email</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input 
                required 
                type="text" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Jane Doe"
                className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input 
                required 
                type="email" 
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="jane@example.com"
                className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Profile Photo (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-400"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 mt-4"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
