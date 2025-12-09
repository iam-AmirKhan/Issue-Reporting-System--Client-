import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchPayments() {
  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const res = await axios.get(`${base}/api/payments/my`);
  return res.data;
}

export default function Payments() {
  const { data, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments,
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) return <div className="text-black">Loading payments...</div>;

  const payments = data?.payments || [];
  return (
    <div>
      <h3 className="font-semibold text-black mb-4">Payments</h3>
      <div className="space-y-2">
        {payments.length === 0 && <div>No payments found.</div>}
        {payments.map(p => (
          <div key={p._id} className="p-3 border rounded">
            <div>{p.amount} {p.currency} — {p.status}</div>
            <div className="text-sm text-black">{new Date(p.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
