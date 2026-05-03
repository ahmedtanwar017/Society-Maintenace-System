"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        router.push(userSnap.data().role === "admin" ? "/admin" : "/member");
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "#f4f7fc" }}
    >
      {/* Background SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <circle cx="400" cy="300" r="320" stroke="#e2ecf8" strokeWidth="1" fill="none" />
        <circle cx="400" cy="300" r="210" stroke="#e8f0fa" strokeWidth="0.8" fill="none" />
        <circle cx="400" cy="300" r="110" stroke="#ecf2fb" strokeWidth="0.6" fill="none" />
        <line x1="80" y1="0" x2="720" y2="600" stroke="#e8eef8" strokeWidth="0.7" />
        <line x1="720" y1="0" x2="80" y2="600" stroke="#e8eef8" strokeWidth="0.7" />
        <line x1="400" y1="0" x2="400" y2="600" stroke="#ebf0f9" strokeWidth="0.5" />
        <line x1="0" y1="300" x2="800" y2="300" stroke="#ebf0f9" strokeWidth="0.5" />
        <polygon points="400,30 760,570 40,570" stroke="#e8edf8" strokeWidth="0.6" fill="none" />
        <rect x="230" y="120" width="340" height="360" stroke="#eaf0f9" strokeWidth="0.6" fill="none" rx="2" />
        <circle cx="400" cy="300" r="3" fill="#3b6fd4" opacity="0.15" />
      </svg>

      {/* Card */}
      <div className="relative z-10 w-[360px] bg-white border border-[#dde3ee] rounded-sm px-10 py-11 text-center">

        {/* Top accent */}
        <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#3b6fd4] to-transparent" />

        {/* Corner marks */}
        <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-[#b0c4ea]" />
        <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-[#b0c4ea]" />
        <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-[#b0c4ea]" />
        <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-[#b0c4ea]" />

        {/* Emblem */}
        <div className="flex justify-center mb-5">
          <svg width="48" height="48" viewBox="0 0 52 52" fill="none" stroke="#3b6fd4">
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

        <p className="text-[9px] tracking-[0.28em] text-[#3b6fd4] uppercase font-bold mb-1">
          Residential Society
        </p>
        <h1 className="text-[22px] font-medium text-[#1a2540] leading-snug mb-1" style={{ fontFamily: "Georgia, serif" }}>
          Member Login
        </h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0aec0] mb-5">
          Secure Member Portal
        </p>
        <div className="h-px bg-[#eaf0f8] mb-6" />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-left text-[12px] text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-[3px] px-3 py-[10px] mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3 text-left">
          {/* Email */}
          <div>
            <label className="block text-[9px] tracking-[0.2em] uppercase text-[#6b7280] font-bold mb-1.5">Email Address</label>
            <div className="relative">
              <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#9aa3b5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email" placeholder="resident@society.in" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-9 pr-3 py-[11px] bg-[#f9fafc] border border-[#dde3ee] rounded-[3px] text-[13px] text-[#111827] outline-none focus:border-[#3b6fd4] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[9px] tracking-[0.2em] uppercase text-[#6b7280] font-bold mb-1.5">Password</label>
            <div className="relative">
              <svg className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none text-[#9aa3b5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="w-full pl-9 pr-9 py-[11px] bg-[#f9fafc] border border-[#dde3ee] rounded-[3px] text-[13px] text-[#111827] outline-none focus:border-[#3b6fd4] focus:bg-white transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[11px] top-1/2 -translate-y-1/2 text-[#9aa3b5] bg-transparent border-0 p-0 cursor-pointer flex items-center">
                {showPassword
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end -mt-1">
            <button type="button" onClick={() => router.push("/forget-password")}
              className="text-[10px] text-[#3b6fd4] tracking-[0.08em] uppercase bg-transparent border-0 cursor-pointer p-0">
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-[13px] bg-[#3b6fd4] text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-[3px] border-0 cursor-pointer hover:bg-[#2d5ab8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Authenticating...
              </>
            ) : "Sign In to Portal"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-[#9aa3b5]">
          Not a member?{" "}
          <a href="/register" className="text-[#3b6fd4] no-underline hover:underline">Request Access</a>
        </p>
        <p className="mt-3 text-[9px] text-[#ccd5e0] tracking-[0.18em] uppercase">Authorized residents only</p>
      </div>
    </div>
  );
}