"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden font-sans"
      style={{ background: "#f4f7fc" }}
    >
      {/* Background rings */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="400" cy="300" r="320" stroke="#e2ecf8" strokeWidth="1" fill="none" />
        <circle cx="400" cy="300" r="210" stroke="#e8f0fa" strokeWidth="0.8" fill="none" />
        <circle cx="400" cy="300" r="110" stroke="#ecf2fb" strokeWidth="0.6" fill="none" />
        <line x1="80" y1="0" x2="720" y2="600" stroke="#e8eef8" strokeWidth="0.7" />
        <line x1="720" y1="0" x2="80" y2="600" stroke="#e8eef8" strokeWidth="0.7" />
        <rect x="230" y="120" width="340" height="360" stroke="#eaf0f9" strokeWidth="0.6" fill="none" rx="2" />
        <circle cx="400" cy="300" r="3" fill="#3b6fd4" opacity="0.15" />
      </svg>

      {/* Card */}
      <div className="relative z-10 w-[360px] bg-white text-center px-10 py-12 rounded-sm border border-[#dde3ee]">

        {/* Top accent line */}
        <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#3b6fd4] to-transparent" />

        {/* Corner marks */}
        <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-[#b0c4ea]" />
        <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-[#b0c4ea]" />
        <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-[#b0c4ea]" />
        <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-[#b0c4ea]" />

        {/* Emblem */}
        <div className="flex justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 52 52" fill="none" stroke="#3b6fd4">
            <polygon points="26,3 49,14.5 49,37.5 26,49 3,37.5 3,14.5" strokeWidth="1.2" strokeLinejoin="round" />
            <circle cx="26" cy="26" r="7" fill="#eef4ff" strokeWidth="1" />
            <circle cx="26" cy="26" r="2.5" fill="#3b6fd4" stroke="none" />
          </svg>
        </div>

        <p className="text-[9px] tracking-[0.28em] text-[#3b6fd4] uppercase font-bold mb-2">
          Residential Society
        </p>

        <h1 className="text-[22px] font-serif font-medium text-[#1a2540] leading-snug mb-1">
          Society Maintenance<br />System
        </h1>

        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-6">
          Member Portal
        </p>

        {/* Badges */}
        <div className="flex justify-center gap-2 mb-8">
          {["Secure", "Residents Only"].map((tag) => (
            <span key={tag} className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-100">
              {tag}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#eaf0f8] mb-7" />

        {/* Buttons */}
        <button
          onClick={() => router.push("/login")}
          className="w-full py-3.5 mb-2.5 bg-[#3b6fd4] text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#2d5ab8] active:scale-[0.98] transition-all"
        >
          Member Login
        </button>

        <button
          onClick={() => router.push("/register")}
          className="w-full py-3.5 bg-white text-[#3b6fd4] text-[10px] font-bold tracking-[0.2em] uppercase border border-[#c5d3ee] rounded-sm hover:bg-[#f5f8ff] active:scale-[0.98] transition-all"
        >
          New Registration
        </button>

        <p className="text-[9px] tracking-[0.2em] uppercase text-[#ccd5e0] mt-6">
          Authorized Access Only
        </p>
      </div>
    </div>
  );
}