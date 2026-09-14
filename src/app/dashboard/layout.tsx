"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { name: "🔑 Digital Key Vault", href: "/dashboard" },
    { name: "📦 Order History", href: "/dashboard/orders" },
    { name: "👛 Vortex Wallet", href: "/dashboard/wallet" },
    { name: "🎫 Support Tickets", href: "/dashboard/tickets" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center uppercase shadow-lg shadow-indigo-600/30">
            {user?.name ? user.name[0] : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user?.name || "Customer Account"}</h2>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
                {user?.role || "CUSTOMER"}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user?.email || "customer@vortex.io"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block">Vortex Wallet</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              ${user?.walletBalance ? user.walletBalance.toFixed(2) : "0.00"}
            </span>
          </div>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
