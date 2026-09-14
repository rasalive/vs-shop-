"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast("Copied credentials to clipboard!", "success");
    setTimeout(() => setCopiedKey(null), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="w-10 h-10 border-2 border-[#5842f5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium">Checking live order status...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-4 text-2xl">
          🔍
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          Could not find an order matching reference &quot;{resolvedParams.id}&quot;.
        </p>
        <Link
          href="/products"
          className="px-6 py-2.5 rounded-2xl bg-[#5842f5] hover:bg-[#4732e0] text-white text-xs font-bold shadow-md shadow-[#5842f5]/20 transition"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isPending = order.status === "PENDING";
  const isCompleted = order.status === "COMPLETED";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/dashboard/orders" className="hover:text-slate-900 transition">
            Orders
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold font-mono">#{order.orderNumber}</span>
        </div>

        <button
          onClick={fetchOrder}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm flex items-center gap-1.5 transition"
        >
          <span>🔄</span>
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Main Status Hero Card: PENDING */}
      {isPending && (
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/90 border border-amber-200 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 text-2xl shrink-0 shadow-inner">
              ⏳
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                  ORDER UNDER VERIFICATION
                </span>
                <span className="text-xs text-amber-800 font-mono font-bold">
                  #{order.orderNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Order Verification In Progress
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Your order has been placed successfully. Our automated system is verifying the payment and your digital license credentials will be provisioned shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Status Hero Card: COMPLETED */}
      {isCompleted && (
        <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 text-2xl shrink-0">
              ✓
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                ORDER COMPLETED & DELIVERED
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Payment Verified • Digital Credentials Active
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Your credentials are decrypted below and saved permanently to your personal Digital Vault.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivered Keys Section if Completed */}
      {order.purchases && order.purchases.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>🔑</span>
            <span>Fulfilled Digital Credentials</span>
          </h3>

          <div className="space-y-3">
            {order.purchases.map((purchase: any) => (
              <div
                key={purchase.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {purchase.product?.title || "Digital Asset"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(purchase.keySecret, purchase.id)}
                    className="px-3 py-1 rounded-xl bg-[#5842f5] hover:bg-[#4732e0] text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                  >
                    {copiedKey === purchase.id ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 select-all break-all shadow-inner">
                  {purchase.keySecret}
                </div>

                {purchase.notes && (
                  <p className="text-[11px] text-slate-500">
                    Instructions: {purchase.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Info & Items */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Order Reference</span>
            <span className="font-mono font-bold text-slate-900">#{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Payment Method</span>
            <span className="font-semibold text-[#5842f5]">{order.paymentMethod}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Payment Status</span>
            <span
              className={`font-semibold ${
                order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Total Amount</span>
            <span className="font-mono font-black text-slate-900 text-sm">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Ordered Items
          </h4>
          <div className="divide-y divide-slate-100">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-bold text-purple-600">
                    ✦
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900">{item.productTitle}</h5>
                    <p className="text-slate-500 text-[11px]">
                      Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Delivery Notes */}
        {order.notes && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">Delivery Notes:</span>
            <p className="text-slate-600">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-2xl bg-[#5842f5] hover:bg-[#4732e0] text-white text-xs font-bold shadow-md shadow-[#5842f5]/20 transition"
        >
          Go to Digital Vault
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
        >
          Browse More Products
        </Link>
      </div>
    </div>
  );
}
