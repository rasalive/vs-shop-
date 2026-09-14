"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-white border-t border-slate-200/90 text-slate-500 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5842f5] to-[#7c3aed] text-white flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a9 9 0 0 1 9 9c0 1.25-.26 2.45-.73 3.53M12 3a9 9 0 0 0-7.79 4.5M12 3v9M20.27 15.53A9 9 0 0 1 12 21c-1.3 0-2.53-.28-3.64-.78M20.27 15.53l-7.79-3.53M8.36 20.22A9 9 0 0 1 3 12c0-1.6.42-3.1 1.21-4.5M8.36 20.22 12 12" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                VORTEX
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 uppercase">
                  DIGITAL
                </span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Direct marketplace for authenticated digital subscriptions, licensed software keys, and instant entertainment access.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Over 25,000+ Keys & Subscriptions Delivered</span>
            </div>
          </div>

          {/* Subscriptions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Popular Subscriptions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=streaming-services" className="hover:text-slate-900 transition">
                  Spotify Premium & Netflix UHD
                </Link>
              </li>
              <li>
                <Link href="/products?category=software-tools" className="hover:text-slate-900 transition">
                  ChatGPT Plus & Canva Pro
                </Link>
              </li>
              <li>
                <Link href="/products?category=gaming-keys" className="hover:text-slate-900 transition">
                  Steam Keys & Gaming Licenses
                </Link>
              </li>
              <li>
                <Link href="/products?deals=true" className="hover:text-slate-900 transition font-medium text-indigo-600">
                  Featured Weekly Deals →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Customer Desk
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition">
                  Digital License Vault
                </Link>
              </li>
              <li>
                <Link href="/dashboard/orders" className="hover:text-slate-900 transition">
                  Order Tracking & History
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wallet" className="hover:text-slate-900 transition">
                  Vortex Wallet & Balance
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-slate-900 transition">
                  24/7 Help Desk & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Buyer Protection */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
              Buyer Protection
            </h4>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Every digital license includes our replacement warranty. Automated key delivery directly into your personal vault.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-700">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">
                256-Bit SSL Encrypted
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">
                0-2m Automated Delivery
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">
                100% Replacement Warranty
              </span>
            </div>
          </div>
        </div>

        {/* Accepted Payment Gateways & Copyright */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700">Secure Payments:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">Stripe</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">Visa</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">PayPal</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">Razorpay</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">Crypto</span>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} Vortex Digital Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
