"use client";

import React from "react";
import Link from "next/link";

export default function SupportHubPage() {
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+1234567890";
  const waChat = `https://wa.me/${supportPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hello Vortex Support! I need help with an order or inquiry."
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          24/7 Priority Support Desk
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-mono">
          HOW CAN WE HELP YOU?
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Our specialized gaming support team is available round-the-clock for digital key replacements, WhatsApp direct orders, and technical inquiries.
        </p>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WhatsApp Channel (Featured) */}
        <div className="p-6 rounded-3xl bg-[#0d161e] border border-emerald-500/40 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl">
              💬
            </div>
            <h3 className="text-base font-bold text-white">Direct WhatsApp Support</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect directly with our sales & fulfillment representatives for immediate order verification and payment confirmation.
            </p>
          </div>

          <a
            href={waChat}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <span>Open WhatsApp Chat</span>
            <span>→</span>
          </a>
        </div>

        {/* Support Ticket Desk */}
        <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl">
              🎫
            </div>
            <h3 className="text-base font-bold text-white">Open a Support Ticket</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track replacements, invalid key reports, and account questions with an official ticket thread in your user dashboard.
            </p>
          </div>

          <Link
            href="/dashboard/tickets"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <span>Go to Ticket Desk</span>
            <span>→</span>
          </Link>
        </div>

        {/* Frequently Asked Questions */}
        <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl">
              ❓
            </div>
            <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Find instant answers regarding key delivery speeds, buyer warranties, accepted payment methods, and refund guidelines.
            </p>
          </div>

          <Link
            href="/faq"
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <span>Browse Knowledgebase</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
