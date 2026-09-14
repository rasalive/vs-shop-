"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AnnouncementBar() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname.startsWith("/admin")) return null;

  return (
    <div className="bg-[#12182b] text-slate-300 border-b border-slate-800/80 text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Promotional Sale Banner */}
        <Link
          href="/products?deals=true"
          className="flex items-center gap-2 font-medium hover:text-white transition group"
        >
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            LIMITED OFFER
          </span>
          <span className="text-xs">
            Use code <strong className="text-white font-bold tracking-wide">WELCOME10</strong> for 10% off your first digital order • Instant Vault Delivery
          </span>
          <span className="text-slate-400 text-xs group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>

        {/* Right: Authentic Store Links & Trust Badges */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            25,000+ Orders Delivered
          </span>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <Link
            href="/support"
            className="hover:text-white transition flex items-center gap-1"
          >
            <span>24/7 Support</span>
          </Link>

          <span className="text-slate-700">•</span>

          <Link
            href="/dashboard/orders"
            className="hover:text-white transition"
          >
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
