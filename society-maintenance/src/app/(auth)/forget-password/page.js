"use client";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent to your email!");
    } catch (err) {
      setMessage("Error: User not found");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <input 
          type="email" placeholder="Enter your email" className="w-full p-2 border rounded"
          onChange={(e) => setEmail(e.target.value)} required 
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded">Send Link</button>
        {message && <p className="mt-4 text-sm text-blue-600">{message}</p>}
      </form>
    </div>
  );
}