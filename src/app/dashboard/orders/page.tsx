"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📦</span>
          <span>Order History</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Track all your past and pending digital purchases.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto text-xl">
            📦
          </div>
          <h3 className="text-sm font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven&apos;t placed any orders yet. Check out the catalog to get started.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold mt-2"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPending = order.status === "PENDING";
            const isCompleted = order.status === "COMPLETED";

            return (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-[#0e1324] border border-slate-800 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white text-sm">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : isPending
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-mono font-black text-white text-sm">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold border border-indigo-500/40 transition"
                    >
                      View Details & Tracking →
                    </Link>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-slate-300">
                        {item.quantity}x {item.productTitle}
                      </span>
                      <span className="font-mono text-slate-400">
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
