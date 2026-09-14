"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (res.ok) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading admin KPIs...</div>;
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            ${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : "0.00"}
          </div>
          <span className="text-[10px] text-emerald-500 flex items-center gap-1">
            <span>↑</span>
            <span>Real-time settled sales</span>
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Orders
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {stats?.totalOrders || 0}
          </div>
          <span className="text-[10px] text-slate-400">Across all gateways</span>
        </div>

        {/* Pending Orders (WhatsApp & Manual) */}
        <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/30 space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Pending Orders
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
            {stats?.pendingOrders || 0}
          </div>
          <Link
            href="/admin/orders?status=PENDING"
            className="text-[10px] text-amber-400 hover:underline font-semibold block"
          >
            Review WhatsApp orders →
          </Link>
        </div>

        {/* Total Registered Users */}
        <div className="p-5 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Users
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-400">
            {stats?.totalUsers || 0}
          </div>
          <span className="text-[10px] text-slate-400">Customers & Admins</span>
        </div>

        {/* Active Tickets */}
        <div className="p-5 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Tickets
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
            {stats?.activeTickets || 0}
          </div>
          <Link
            href="/admin/tickets"
            className="text-[10px] text-cyan-400 hover:underline font-semibold block"
          >
            View support queue →
          </Link>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Stock Warnings
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
            {stats?.inventoryAlerts ? stats.inventoryAlerts.length : 0}
          </div>
          <Link
            href="/admin/inventory"
            className="text-[10px] text-rose-400 hover:underline font-semibold block"
          >
            Import fresh keys →
          </Link>
        </div>
      </div>

      {/* Low Stock Banner if any */}
      {stats?.inventoryAlerts && stats.inventoryAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>
              Low inventory stock on {stats.inventoryAlerts.length} products:{" "}
              {stats.inventoryAlerts.map((p: any) => `${p.title} (${p.remaining} left)`).join(", ")}
            </span>
          </div>
          <Link
            href="/admin/inventory"
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shrink-0 transition"
          >
            Restock Keys
          </Link>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recent Orders Activity
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="pb-3 font-semibold">Order #</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Gateway</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 font-mono font-bold text-white">
                    #{order.orderNumber}
                  </td>
                  <td className="py-3 text-slate-300">
                    <p className="font-semibold">{order.customerName}</p>
                    <p className="text-[10px] text-slate-500">{order.customerEmail}</p>
                  </td>
                  <td className="py-3 font-mono font-bold text-emerald-400">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3 text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : order.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
