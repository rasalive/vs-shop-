"use client";

import React, { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "How fast do I receive my digital keys or accounts?",
    a: "Delivery is instant! Within 0-2 minutes of payment confirmation, your keys and credentials appear automatically in your personal Digital Key Vault (/dashboard) and are also sent to your registered email.",
  },
  {
    q: "How does the WhatsApp Direct Order option work?",
    a: "When you select WhatsApp Direct, you simply enter your WhatsApp number. Your order is created with status PENDING, and you are redirected to the order tracking page with a direct WhatsApp chat link to complete verification with our sales staff.",
  },
  {
    q: "What does the 100% Replacement Warranty cover?",
    a: "All accounts and Steam keys come with a guaranteed warranty. If any credential fails or is invalid upon arrival, open a ticket on our Support Desk (/dashboard/tickets) or message us on WhatsApp for an instant replacement.",
  },
  {
    q: "Which payment gateways do you accept?",
    a: "We support Credit/Debit cards (via Stripe), UPI and Netbanking (via Razorpay), PayPal, Cryptocurrency (USDT, BTC, Solana), Vortex Wallet Balance, and WhatsApp Direct Pay.",
  },
  {
    q: "How can I top up and use my Vortex Wallet?",
    a: "Head to your Dashboard > Vortex Wallet (/dashboard/wallet). You can choose a quick deposit amount ($10, $25, $50, $100) and then enjoy instant 1-click zero-fee checkout on any product in the store.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Everything you need to know about Vortex Marketplace deliveries, warranties, and orders.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#0e1324] border border-slate-800 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <span className="font-bold text-sm text-white">{item.q}</span>
                <span className="text-indigo-400 text-lg font-mono">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-3xl bg-indigo-950/30 border border-indigo-500/30 text-center space-y-3">
        <h3 className="text-base font-bold text-white">Still have questions?</h3>
        <p className="text-xs text-slate-400">
          Our support team is available 24/7 on WhatsApp and ticket desk.
        </p>
        <Link
          href="/support"
          className="inline-block px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Contact Support Desk
        </Link>
      </div>
    </div>
  );
}
