"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (res.ok && data.order) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast("Key copied to clipboard!", "success");
    setTimeout(() => setCopiedKey(null), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="w-10 h-10 border-2 border-[#5842f5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium">Retrieving your provisioned keys...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      {/* Success Banner */}
      <div className="text-center space-y-4 mb-10">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-md">
          ✓
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          Payment Verified • Order #{order?.orderNumber || "CONFIRMED"}
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Your Digital Assets Are Ready!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Thank you for choosing Vortex. Your digital keys and credentials have been automatically provisioned below and stored permanently in your Digital Vault.
        </p>
      </div>

      {/* Provisioned Keys Card */}
      {order?.purchases && order.purchases.length > 0 && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>🔑</span>
              <span>Your Provisioned Keys & Credentials</span>
            </h3>
            <span className="text-xs text-emerald-600 font-mono font-bold">
              {order.purchases.length} Item(s) Delivered
            </span>
          </div>

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
                    {copiedKey === purchase.id ? "✓ Copied!" : "📋 Copy Key"}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 select-all break-all shadow-inner">
                  {purchase.keySecret}
                </div>

                {purchase.notes && (
                  <p className="text-[11px] text-slate-500 italic">
                    Instructions: {purchase.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-2xl bg-[#5842f5] hover:bg-[#4732e0] text-white text-xs font-bold shadow-md shadow-[#5842f5]/20 transition"
        >
          View in Digital Key Vault
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
        >
          Browse More Subscriptions
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading order receipt...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
