"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", wing: "A", flatNo: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const flatId = `${formData.wing}-${formData.flatNo}`;
    try {
      const flatRef = doc(db, "flats", flatId);
      const flatSnap = await getDoc(flatRef);
      if (!flatSnap.exists()) { setError("Invalid flat number. Please check your wing and number."); return; }
      if (flatSnap.data().isRegistered) { setError("This flat is already registered by another member."); return; }
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name, email: formData.email, wing: formData.wing,
        flatNo: formData.flatNo, flatType: flatSnap.data().type,
        role: "member", createdAt: new Date().toISOString(),
      });
      await updateDoc(flatRef, { isRegistered: true, ownerId: user.uid });
      router.push("/member");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-9 pr-3 py-[10px] bg-[#f9fafc] border border-[#dde3ee] rounded-[3px] text-[13px] text-[#111827] outline-none focus:border-[#3b6fd4] focus:bg-white transition-colors";

  return (
    <div className="fixed inset-0 grid overflow-hidden font-sans" style={{ gridTemplateColumns: "1fr 1fr" }}>

      {/* ── LEFT PANEL ── */}
      <div className="relative flex flex-col justify-center px-14 overflow-hidden text-white" style={{ background: "#1a2f6e" }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <circle cx="250" cy="350" r="320" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
          <circle cx="250" cy="350" r="220" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
          <circle cx="250" cy="350" r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
          <line x1="0" y1="0" x2="500" y2="700" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="500" y1="0" x2="0" y2="700" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <polygon points="250,20 480,620 20,620" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" fill="none" />
          <rect x="60" y="80" width="380" height="540" stroke="rgba(255,255,255,0.03)" strokeWidth="0.7" fill="none" rx="2" />
        </svg>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-[5px] rounded-full text-[9px] tracking-[0.18em] uppercase text-blue-200 border border-white/20 mb-8"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secure Registration
          </div>

          <h2 className="text-[30px] font-medium leading-tight mb-4 text-white" style={{ fontFamily: "Georgia, serif" }}>
            Join Your Residential Community
          </h2>
          <p className="text-[13px] leading-relaxed mb-8 max-w-[280px]" style={{ color: "#bfdbfe" }}>
            Register as an authorized member to access maintenance services, announcements, and your society portal.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { n: 1, title: "Fill your details", desc: "Enter your name, email and create a secure password." },
              { n: 2, title: "Verify your flat", desc: "Select your wing and flat number to confirm residency." },
              { n: 3, title: "Access your portal", desc: "Get instant access to your member dashboard." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-3">
                <div className="flex items-center justify-center shrink-0 mt-[1px] text-[10px] font-bold text-white"
                  style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.25)" }}>
                  {n}
                </div>
                <div className="text-[12px] leading-relaxed" style={{ color: "#bfdbfe" }}>
                  <span className="text-white font-medium block mb-[1px]">{title}</span>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="relative flex items-center justify-center overflow-hidden" style={{ background: "#f4f7fc" }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <circle cx="300" cy="400" r="320" stroke="#e2ecf8" strokeWidth="1" fill="none" />
          <circle cx="300" cy="400" r="210" stroke="#e8f0fa" strokeWidth="0.8" fill="none" />
          <circle cx="300" cy="400" r="110" stroke="#ecf2fb" strokeWidth="0.6" fill="none" />
          <line x1="80" y1="0" x2="720" y2="800" stroke="#e8eef8" strokeWidth="0.7" />
          <line x1="520" y1="0" x2="-120" y2="800" stroke="#e8eef8" strokeWidth="0.7" />
          <line x1="300" y1="0" x2="300" y2="800" stroke="#ebf0f9" strokeWidth="0.5" />
          <line x1="0" y1="400" x2="600" y2="400" stroke="#ebf0f9" strokeWidth="0.5" />
          <rect x="120" y="100" width="360" height="600" stroke="#eaf0f9" strokeWidth="0.6" fill="none" rx="2" />
          <circle cx="300" cy="400" r="3" fill="#3b6fd4" opacity="0.15" />
        </svg>

        {/* Card */}
        <div className="relative z-10 w-[400px] bg-white border border-[#dde3ee] rounded-sm px-9 py-9 text-center">
          <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#3b6fd4] to-transparent" />
          <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-[#b0c4ea]" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-[#b0c4ea]" />
          <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-[#b0c4ea]" />
          <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-[#b0c4ea]" />

          <div className="flex justify-center mb-4">
            <svg width="46" height="46" viewBox="0 0 52 52" fill="none" stroke="#3b6fd4">
              <polygon points="26,3 49,14.5 49,37.5 26,49 3,37.5 3,14.5" strokeWidth="1.2" strokeLinejoin="round" />
              <polygon points="26,11 41,19.5 41,32.5 26,41 11,32.5 11,19.5" strokeWidth="0.7" stroke="#d0d9ed" />
              <circle cx="26" cy="26" r="7" fill="#eef4ff" strokeWidth="1" />
              <circle cx="26" cy="26" r="2.5" fill="#3b6fd4" stroke="none" />
              <line x1="26" y1="11" x2="26" y2="19" strokeWidth="1" opacity="0.4" />
              <line x1="26" y1="33" x2="26" y2="41" strokeWidth="1" opacity="0.4" />
              <line x1="11" y1="26" x2="19" y2="26" strokeWidth="1" opacity="0.4" />
              <line x1="33" y1="26" x2="41" y2="26" strokeWidth="1" opacity="0.4" />
            </svg>
          </div>

          <p className="text-[9px] tracking-[0.28em] text-[#3b6fd4] uppercase font-bold mb-1">Residential Society</p>
          <h1 className="text-[22px] font-medium text-[#1a2540] mb-1" style={{ fontFamily: "Georgia, serif" }}>New Registration</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0aec0] mb-4">Member Onboarding</p>
          <div className="h-px bg-[#eaf0f8] mb-5" />

          {error && (
            <div className="flex items-center gap-2 text-left text-[11px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-[3px] px-3 py-[9px] mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-3 text-left">
            {/* Full Name */}
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-[#6b7280] font-bold mb-1.5">Full Name</label>
              <div className="relative">
                <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#9aa3b5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <input type="text" placeholder="Your full name" onChange={set("name")} required className={inputCls} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-[#6b7280] font-bold mb-1.5">Email Address</label>
              <div className="relative">
                <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#9aa3b5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <input type="email" placeholder="resident@society.in" onChange={set("email")} required className={inputCls} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-[#6b7280] font-bold mb-1.5">Password</label>
              <div className="relative">
                <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#9aa3b5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input type={showPassword ? "text" : "password"} placeholder="Create a password" onChange={set("password")} required
                  className={inputCls.replace("pr-3", "pr-9")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[11px] top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer p-0 flex items-center text-[#9aa3b5]">
                  {showPassword
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Wing + Flat */}
            <div>
              <label className="block text-[9px] tracking-[0.2em] uppercase text-[#6b7280] font-bold mb-1.5">Flat Details</label>
              <div className="grid gap-2" style={{ gridTemplateColumns: "130px 1fr" }}>
                <div className="relative">
                  <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#9aa3b5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                  <select onChange={set("wing")} defaultValue="A"
                    className="w-full py-[10px] bg-[#f9fafc] border border-[#dde3ee] rounded-[3px] text-[13px] text-[#111827] outline-none appearance-none cursor-pointer focus:border-[#3b6fd4] focus:bg-white transition-colors"
                    style={{ paddingLeft: 34, paddingRight: 12 }}>
                    {["A", "B", "C", "D"].map(w => <option key={w} value={w}>Wing {w}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#9aa3b5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <input type="number" placeholder="Flat No. e.g. 101" onChange={set("flatNo")} required className={inputCls} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-[3px] border-0 cursor-pointer py-[12px] mt-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#3b6fd4" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#2d5ab8"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#3b6fd4"; }}>
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-[11px] text-[#9aa3b5]">
            Already a member?{" "}
            <a href="/login" className="text-[#3b6fd4] no-underline hover:underline">Sign In</a>
          </p>
          <p className="text-center mt-3 text-[9px] tracking-[0.18em] uppercase text-[#ccd5e0]">Authorized residents only</p>
        </div>
      </div>
    </div>
  );
}