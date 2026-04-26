import { useQuery } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function ProfileDashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await api.get("/api/users/me")).data
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const res = await api.get("/api/payments/me");
      return Array.isArray(res.data) ? res.data : (res.data.payments || []);
    },
    enabled: !!user?.isPremium
  });

  const subscribe = async () => {
    try {
      const { data } = await api.post("/api/payments/create-subscription-session");
      if (data.paymentUrl) {
         window.location.href = data.paymentUrl;
      } else {
         Swal.fire("Info", "Subscription completed directly (Sandbox).", "success");
         window.location.reload();
      }
    } catch (err) {
      Swal.fire("Error", "Could not start payment. " + (err.response?.data?.message || ""), "error");
    }
  };

  const downloadInvoice = (payment) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 20, null, null, "center");
    
    // Brand
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129); // Emerald 500
    doc.text("InfraCare Public Services", 20, 35);
    
    // Reset Color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Details
    doc.text(`Date: ${payment.createdAt || payment.date ? new Date(payment.createdAt || payment.date).toLocaleDateString() : "No date"}`, 20, 45);
    doc.text(`Transaction ID: ${payment.transactionId || payment._id}`, 20, 50);
    doc.text(`Status: Paid (${payment.status || 'Success'})`, 20, 55);

    // Billed To
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${user.name}`, 20, 75);
    doc.text(`Email: ${user.email}`, 20, 80);

    // Line Items
    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, 100);
    doc.text("Amount (TK)", 160, 100);
    
    doc.line(20, 102, 190, 102);
    
    doc.setFont("helvetica", "normal");
    const desc = payment.purpose === "boost" ? "Issue Priority Boost" : "Premium Citizen Subscription";
    const amount = payment.amount || (payment.purpose === "boost" ? "100" : "1000");
    
    doc.text(desc, 20, 110);
    doc.text(`${amount} TK`, 160, 110);
    
    doc.line(20, 115, 190, 115);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 135, 125);
    doc.text(`${amount} TK`, 160, 125);

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Thank you for contributing to your city's infrastructure.", 105, 270, null, null, "center");

    doc.save(`Invoice_${payment.transactionId || payment._id}.pdf`);
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl mx-4 mt-8"></div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800">Your Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account details and subscription status.</p>
      </div>

      {user.blocked && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl mb-6 shadow-sm flex items-start gap-4">
          <svg className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <h3 className="font-bold text-rose-800">Account Blocked</h3>
            <p className="text-sm text-rose-700 mt-1">Your account has been restricted by administrators. You cannot post or manage issues at this time. Please contact support.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-center p-6 relative">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-50 shadow-md overflow-hidden relative z-10">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-3xl uppercase">
                  {(user.name || "U")[0]}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">{user.name}</h2>
            <p className="text-sm text-slate-500 mb-4">{user.email}</p>
            
            <div className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg inline-block shadow-sm ${
              user.isPremium ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
            }`}>
              {user.isPremium ? "Premium Citizen" : "Free Tier"}
            </div>
          </div>
        </div>

        {/* Details & Subscription */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Subscription Plan</h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                {user.isPremium ? (
                  <>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                       Active Premium Member
                    </div>
                    <p className="text-sm text-slate-600">You have unlimited issue submissions and priority support.</p>
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-slate-800 mb-1">Free Tier Limitations</h4>
                    <p className="text-sm text-slate-600">You are limited to creating 3 issues. Upgrade to unlock unlimited reporting.</p>
                  </>
                )}
              </div>
              
              {!user.isPremium && !user.blocked && (
                <button onClick={subscribe} className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30 transform hover:scale-105">
                  Upgrade Now (1000 TK)
                </button>
              )}
            </div>
          </div>

          {/* Payment History & Invoices */}
          {payments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Payment History</h3>
              <ul className="space-y-4">
                {payments.map(ctx => (
                  <li key={ctx._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{ctx.purpose === "boost" ? "Issue Boost" : "Premium Subscription"}</h4>
                      <p className="text-xs text-slate-500 mt-1">{new Date(ctx.createdAt || ctx.date).toLocaleDateString()} • {ctx.amount || (ctx.purpose==="boost"?100:1000)} TK</p>
                    </div>
                    <button onClick={() => downloadInvoice(ctx)} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Invoice PDF
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
