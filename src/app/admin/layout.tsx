"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, switchDemoUser } = useAuth();

  const navItems = [
    { name: "📊 Overview & KPIs", href: "/admin" },
    { name: "📥 Bulk Inventory & Keys", href: "/admin/inventory" },
    { name: "🛒 Orders & Fulfillment", href: "/admin/orders" },
    { name: "👥 Users & Moderation", href: "/admin/users" },
    { name: "📦 Products & Catalog", href: "/admin/products" },
    { name: "🎫 Support Desk", href: "/admin/tickets" },
    { name: "🏷️ Promo Coupons", href: "/admin/coupons" },
  ];

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPPORT")) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl mx-auto">
          🔒
        </div>
        <h2 className="text-2xl font-black text-white font-mono">
          ADMIN ACCESS REQUIRED
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          You need an Administrator or Support role to view the Vortex Command Center.
        </p>
        <div className="pt-4">
          <button
            onClick={() => switchDemoUser("ADMIN")}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition"
          >
            ⚡ Switch to Demo Admin Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-indigo-500/30 shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center text-xl font-bold">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white font-mono">
                VORTEX ADMIN CONSOLE
              </h1>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30 font-bold">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as {user.name} ({user.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            View Live Store →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800"
                }`}
              >
                {item.name}
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
