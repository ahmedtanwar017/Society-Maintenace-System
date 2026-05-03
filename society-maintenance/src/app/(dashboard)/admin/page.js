"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, doc, writeBatch, getDoc, deleteDoc, updateDoc 
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ 
    paid: 0, pending: 0, totalCollected: 0, targetAmount: 0 
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const calculateDetailedBill = (flatType) => {
    const type = flatType?.toLowerCase() || "";
    let factor = 1.0; 
    if (type.includes("1 bhk")) factor = 1.25;
    if (type.includes("2 bhk")) factor = 1.65;

    const breakdown = {
      electricity: Math.round(345 * factor),
      water: Math.round(223 * factor),
      genMaint: Math.round(813 * factor),
      commonFund: 50,
      sinkingFund: Math.round(55 * factor),
      nonOccupancy: 304,
      repairs: Math.round(111 * factor),
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return { ...breakdown, total };
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== "admin") return;

    const unsubUsers = onSnapshot(collection(db, "users"), (userSnap) => {
      const usersList = userSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.role === "member");
      
      const unsubBills = onSnapshot(collection(db, "bills"), (billSnap) => {
        const bills = billSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        let paidCount = 0, pendingCount = 0, collected = 0, target = 0;

        const combinedData = usersList.map(res => {
          const bill = bills.find(b => b.flatId === `${res.wing}-${res.flatNo}`);
          const status = bill ? bill.status : "not generated";
          const billAmount = bill ? bill.amount : 0;
          const billId = bill ? bill.id : null;

          if (status === "paid") { paidCount++; collected += billAmount; }
          if (status === "pending") { pendingCount++; }
          if (status !== "not generated") { target += billAmount; }

          return { ...res, status, currentBillAmount: billAmount, billId };
        });

        setResidents(combinedData);
        setStats({ paid: paidCount, pending: pendingCount, totalCollected: collected, targetAmount: target });
      });
      return () => unsubBills();
    });
    return () => unsubUsers();
  }, [user]);

  const generateBills = async () => {
    const month = "April", year = 2026;
    if (!confirm(`Generate all pending bills for ${month}?`)) return;
    
    setIsGenerating(true);
    const batch = writeBatch(db);
    let newCount = 0;

    for (const res of residents) {
      const billId = `${res.wing}-${res.flatNo}-${month}-${year}`;
      const billRef = doc(db, "bills", billId);
      const billSnap = await getDoc(billRef);

      if (!billSnap.exists()) {
        const detailedData = calculateDetailedBill(res.flatType);
        batch.set(billRef, {
          flatId: `${res.wing}-${res.flatNo}`,
          residentName: res.name,
          month, year,
          billNo: Math.floor(1000 + Math.random() * 9000),
          billDate: "01/04/2026",
          dueDate: "30/04/2026",
          status: "pending",
          breakdown: detailedData,
          amount: detailedData.total,
          societyInfo: {
            name: "AIBANI CLASSIC CO-OPERATIVE HOUSING SOCIETY LTD.",
            regNo: "BOM/KWK/HSG/TC/12574/2004-2005",
            address: "Jogeshwari (West), Mumbai-400102"
          },
          createdAt: new Date().toISOString()
        });
        newCount++;
      }
    }
    if (newCount > 0) await batch.commit();
    setIsGenerating(false);
  };

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${r.wing}-${r.flatNo}`.includes(searchTerm)
  );

  if (loading || !user) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-indigo-600">LOADING CORE...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP NAV BAR */}
        <header className="flex flex-col lg:flex-row justify-between items-center mb-10 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-black text-xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800">AIBANI <span className="text-indigo-600 text-sm italic">CLASSIC</span></h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Management Suite v2.1</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group">
                <input 
                type="text" 
                placeholder="Search flat, name..."
                className="pl-12 pr-6 py-4 rounded-2xl border-none bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all w-full sm:w-72 font-medium text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-4 top-4 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
            </div>
            <button onClick={generateBills} disabled={isGenerating} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-600 shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {isGenerating ? "Syncing..." : "Sync Monthly Bills"}
            </button>
            <button onClick={logout} className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Revenue Collected", val: `₹${stats.totalCollected.toLocaleString()}`, sub: "Net Cash", color: "indigo" },
            { label: "Paid Flats", val: stats.paid, sub: "Confirmed", color: "emerald" },
            { label: "Unpaid Dues", val: stats.pending, sub: "Immediate Action", color: "rose" },
            { label: "Collection Target", val: `₹${stats.targetAmount.toLocaleString()}`, sub: "Projected", color: "slate" }
          ].map((s, i) => (
            <div key={i} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">{s.label}</p>
              <p className="text-3xl font-black text-slate-800">{s.val}</p>
              <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase italic">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* MAIN DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-white">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
             <h2 className="font-black text-slate-800 tracking-tight">Resident Ledger</h2>
             <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 border border-slate-100 shadow-sm">{filteredResidents.length} TOTAL</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <th className="p-8">Member</th>
                  <th className="p-8">Current Bill</th>
                  <th className="p-8 text-center">Payment Status</th>
                  <th className="p-8 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredResidents.map(res => (
                  <tr key={res.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="p-8">
                      <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{res.name}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">{res.wing}-{res.flatNo} <span className="mx-2 opacity-20">|</span> {res.flatType}</p>
                    </td>
                    <td className="p-8">
                      <p className="font-black text-slate-700 text-lg">₹{res.currentBillAmount?.toLocaleString() || "0"}</p>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        res.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 
                        res.status === 'pending' ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="p-8 text-right flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      {res.status === 'pending' && (
                        <button onClick={() => markAsPaidManually(res.billId)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Mark Paid">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                      )}
                      {res.billId && (
                        <button onClick={() => cancelBill(res.billId)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm" title="Delete Bill">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                      )}
                      <button onClick={() => deleteUser(res.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Remove Member">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredResidents.length === 0 && (
                <div className="p-20 text-center">
                    <div className="text-4xl mb-4 opacity-20">📂</div>
                    <p className="text-slate-400 font-bold italic">No records matching "{searchTerm}"</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}