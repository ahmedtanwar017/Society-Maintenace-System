import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Society Maintenance System",
  description: "Manage society maintenance digitally",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        {/* ✅ Razorpay Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        {/* ✅ Vercel Fix Script */}
        <Script id="vercel-fix" strategy="beforeInteractive">
          {`(function (l) {
            if (l.search[1] === "/") {
              var decoded = l.search
                .slice(1)
                .split("&")
                .map(function (s) {
                  return s.replace(/~and~/g, "&");
                })
                .join("?");
              window.history.replaceState(
                null,
                null,
                l.pathname.slice(0, -1) + decoded + l.hash
              );
            }
          })(window.location);`}
        </Script>

        {/* 🔥 Global Auth Context */}
        <AuthProvider>
          {children}
        </AuthProvider>

      </body>
    </html>
  );
}