import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import api from "../../api/axiosConfig";
import Swal from "sweetalert2";

export default function Payments() {
  const [filterStr, setFilterStr] = useState("all");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const res = await api.get("/api/payments");
      return Array.isArray(res.data) ? res.data : (res.data.payments || []);
    }
  });

  const downloadInvoice = (payment) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 20, null, null, "center");
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text("InfraCare Admin Portal", 20, 35);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${payment.createdAt || payment.date ? new Date(payment.createdAt || payment.date).toLocaleDateString() : "No date"}`, 20, 45);
    doc.text(`Transaction ID: ${payment.transactionId || payment._id}`, 20, 50);
    doc.text(`Status: Paid (${payment.status || 'Success'})`, 20, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 20, 70);
    doc.setFont("helvetica", "normal");
    doc.text(`User ID / Meta: ${payment.userId || payment.citizenId || "Citizen Payment"}`, 20, 75);
    doc.text(`Service / Purpose: ${payment.purpose === "boost" ? "Issue Boost" : "Premium Subscription"}`, 20, 80);
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
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Thank you for contributing to your city's infrastructure.", 105, 270, null, null, "center");
    doc.save(`Invoice_${payment.transactionId || payment._id}.pdf`);
  };

  const filtered = payments.filter(p => filterStr === "all" || p.purpose === filterStr);

  const totalRevenue = payments.reduce((acc, curr) => acc + (Number(curr.amount) || (curr.purpose === "boost" ? 100 : 1000)), 0);

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl mx-4 mt-8"></div>;

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Payments & Revenue</h1>
          <p className="text-slate-500 mt-1">Review system transactions and generate official invoices.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-100">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
             <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <div className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Total Revenue</div>
            <div className="text-lg font-black text-slate-800 leading-tight">{totalRevenue.toLocaleString()} TK</div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <select value={filterStr} onChange={e => setFilterStr(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-emerald-500 block p-2 outline-none shadow-sm cursor-pointer">
           <option value="all">All Payments</option>
           <option value="subscription">Subscriptions</option>
           <option value="boost">Boosts</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filtered.map((ctx) => (
                <tr key={ctx._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-800">{ctx.transactionId || ctx._id}</div>
                    <div className="text-xs text-slate-500 font-medium">{new Date(ctx.createdAt || ctx.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     {ctx.purpose === "boost" ? (
                       <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-700">Issue Boost</span>
                     ) : (
                       <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-100 text-blue-700">Subscription</span>
                     )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-800">{ctx.amount || (ctx.purpose==="boost"?100:1000)} TK</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                     <button onClick={() => downloadInvoice(ctx)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-emerald-600 text-xs font-bold rounded-lg transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Generate PDF
                     </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm">No transaction history available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
