"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      let url = "/api/admin/orders";
      if (filterStatus !== "ALL") {
        url += `?status=${filterStatus}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 4 seconds so newly placed orders appear instantly
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, paymentStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Order status updated to ${status}! Credentials fulfilled.`, "success");
        await fetchOrders();
      } else {
        showToast(data.error || "Failed to update order", "error");
      }
    } catch {
      showToast("Error updating order status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🛒</span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Orders & Key Delivery Desk
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                {pendingCount} Pending Action
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Review incoming customer buy orders, customer WhatsApp numbers, and fulfill digital keys. (Auto-refreshes live)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PENDING", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition shadow-sm ${
                filterStatus === st
                  ? "bg-[#5842f5] text-white shadow-[#5842f5]/20"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={fetchOrders}
            className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition"
            title="Refresh list now"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="w-8 h-8 border-2 border-[#5842f5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading incoming orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <span className="text-3xl block mb-2">📦</span>
            No orders found matching filter &quot;{filterStatus}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Order #</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Customer & Contact</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Items</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Total</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const isPending = order.status === "PENDING";
                  const phone = order.user?.phone || order.whatsappNumber;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      {/* Order ref & time */}
                      <td className="py-4 font-mono">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-black text-[#5842f5] hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                        <span className="block text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer info & WhatsApp */}
                      <td className="py-4">
                        <p className="font-bold text-slate-900">{order.user?.name || "Customer"}</p>
                        <p className="text-[11px] text-slate-500">{order.user?.email || "No email"}</p>
                        {phone && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-200">
                              💬 {phone}
                            </span>
                            <a
                              href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello! Contacting you regarding your Order #${order.orderNumber} from Vortex.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-emerald-600 hover:underline"
                            >
                              Chat ↗
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-4 text-slate-700">
                        <p className="font-bold">{order.items.length} item(s)</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {order.items.map((i: any) => `${i.quantity}x ${i.productTitle}`).join(", ")}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-4 font-mono font-black text-slate-900 text-sm">
                        ${order.totalAmount.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : isPending
                              ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right space-x-2">
                        {isPending && (
                          <button
                            disabled={actionLoading === order.id}
                            onClick={() => updateOrderStatus(order.id, "COMPLETED", "PAID")}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                            title="Verify payment and auto-fulfill credentials"
                          >
                            ✓ Approve & Deliver
                          </button>
                        )}

                        <Link
                          href={`/orders/${order.id}`}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition inline-block"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
