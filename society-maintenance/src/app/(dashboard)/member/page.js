"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function MemberDashboard() {
  const { user, loading, logout } = useAuth();
  const [activeBill, setActiveBill] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "member")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== "member") return;
    const q = query(collection(db, "bills"), where("flatId", "==", `${user.wing}-${user.flatNo}`));
    const unsubscribe = onSnapshot(q, (snap) => {
      const allBills = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveBill(allBills.find(b => b.status === "pending") || null);
      setHistory(allBills.filter(b => b.status === "paid").sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)));
    });
    return () => unsubscribe();
  }, [user]);

  const handlePayment = async (bill) => {
    setIsProcessing(true);
    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) { alert("Razorpay SDK failed."); setIsProcessing(false); return; }

    try {
      const response = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: bill.amount, billId: bill.id }),
      });
      const orderData = await response.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "AIBANI CLASSIC CHS",
        description: `Maintenance Bill: ${bill.month}`,
        order_id: orderData.id,
        handler: async function (response) {
          await updateDoc(doc(db, "bills", bill.id), {
            status: "paid",
            paidAt: new Date().toISOString(),
            razorpay_payment_id: response.razorpay_payment_id,
            paymentMethod: "razorpay_online"
          });
          alert("Payment Successful!");
          setIsProcessing(false);
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#4F46E5" },
        modal: { ondismiss: () => setIsProcessing(false) }
      };
      new window.Razorpay(options).open();
    } catch (e) { setIsProcessing(false); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-receipt");
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalBody;
    window.location.reload();
  };

  if (loading || !user) return <div className="h-screen flex items-center justify-center font-black animate-pulse">AIBANI CLASSIC...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile & Logout Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
              {user.wing}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome Back</p>
              <h1 className="text-xl font-black text-slate-800 uppercase italic">Flat {user.flatNo}</h1>
            </div>
          </div>
          <button onClick={logout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
             </svg>
          </button>
        </div>

        {/* Dynamic Billing Card */}
        <div className="mb-12">
          {activeBill ? (
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-100 border border-indigo-50 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
              
              <div className="relative z-10 text-center">
                <span className="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{activeBill.month} Maintenance</span>
                <div className="text-8xl font-black text-slate-900 my-8 tracking-tighter">₹{activeBill.amount}</div>
                
                <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                  <button onClick={() => setSelectedBill(activeBill)} className="flex-1 px-8 py-5 rounded-3xl bg-slate-100 font-black text-slate-700 hover:bg-slate-200 transition-all text-sm">
                    DETAILS
                  </button>
                  <button onClick={() => handlePayment(activeBill)} disabled={isProcessing} className="flex-[2] px-8 py-5 rounded-3xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-200 hover:scale-[1.03] transition-all text-sm">
                    {isProcessing ? "PROCESSING..." : "PAY NOW"}
                  </button>
                </div>
                <p className="mt-6 text-[10px] font-bold text-slate-300 uppercase">Due Date: {activeBill.dueDate}</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500 p-12 rounded-[3.5rem] text-white text-center shadow-2xl shadow-emerald-100 border-b-8 border-emerald-600">
               <div className="text-5xl mb-4">✨</div>
               <h2 className="text-2xl font-black italic">Perfect Record!</h2>
               <p className="text-emerald-100 text-sm font-medium mt-1">All maintenance bills are fully paid.</p>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
             <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Payment History</h3>
             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-8">
                      <p className="font-black text-slate-700">{h.month} {h.year}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {h.billNo}</p>
                    </td>
                    <td className="p-8">
                      <p className="font-black text-emerald-600 text-lg">₹{h.amount}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(h.paidAt).toLocaleDateString('en-GB')}</p>
                    </td>
                    <td className="p-8 text-right">
                      <button onClick={() => setSelectedBill(h)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-indigo-600 transition-all">
                        RECEIPT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && (
                <div className="p-16 text-center text-slate-300 font-bold italic">No history found.</div>
            )}
          </div>
        </div>
      </div>

      {/* --- PROFESSIONAL RECEIPT MODAL --- */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
              <button onClick={handlePrint} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all">Download PDF</button>
              <button onClick={() => setSelectedBill(null)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-all font-bold">✕</button>
            </div>
            
            <div id="printable-receipt" className="p-10 overflow-y-auto bg-white text-black font-serif">
              <div className="border-[3px] border-black p-6 relative">
                {/* Official Stamp Look */}
                {selectedBill.status === 'paid' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[10px] border-emerald-500/20 text-emerald-500/20 font-black text-8xl -rotate-12 pointer-events-none uppercase">Paid</div>
                )}

                <div className="text-center border-b-2 border-black pb-4 mb-6">
                  <h1 className="text-xl font-bold leading-tight uppercase tracking-tighter">{selectedBill.societyInfo?.name}</h1>
                  <p className="text-[9px] font-sans mt-1">REG. NO: {selectedBill.societyInfo?.regNo}</p>
                  <p className="text-[10px] font-sans uppercase">{selectedBill.societyInfo?.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-[11px] mb-6 font-sans">
                  <p><strong>Bill No:</strong> {selectedBill.billNo}</p>
                  <p className="text-right"><strong>Date:</strong> {selectedBill.billDate}</p>
                  <p><strong>Member:</strong> {selectedBill.residentName}</p>
                  <p className="text-right"><strong>Flat:</strong> {selectedBill.flatId}</p>
                  <p><strong>Billing Period:</strong> {selectedBill.month} {selectedBill.year}</p>
                  <p className="text-right font-bold text-red-600"><strong>Due Date:</strong> {selectedBill.dueDate}</p>
                </div>

                <table className="w-full text-[11px] font-sans border-collapse border-2 border-black">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-black text-left">
                      <th className="p-2 border-r-2 border-black">Particulars</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {Object.entries(selectedBill.breakdown || {}).filter(([k]) => k !== 'total').map(([key, val]) => (
                      <tr key={key}>
                        <td className="p-2 border-r-2 border-black uppercase text-[10px]">{key.replace(/([A-Z])/g, ' $1')}</td>
                        <td className="p-2 text-right font-mono">{val}.00</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-black bg-slate-50 font-bold text-sm">
                      <td className="p-2 text-right border-r-2 border-black">NET PAYABLE:</td>
                      <td className="p-2 text-right font-mono text-lg">₹{selectedBill.amount}.00</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-10 flex justify-between items-end">
                   <div className="text-[9px] font-sans italic opacity-60">
                     Generated digitally by Aibani Suite.<br/>No signature required if paid online.
                   </div>
                   <div className="text-center border-t border-black pt-2 min-w-[120px]">
                     <p className="text-[9px] font-black uppercase tracking-tighter">Hon. Treasurer</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}