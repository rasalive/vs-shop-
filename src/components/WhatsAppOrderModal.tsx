"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: string;
    title: string;
    price: number;
    coverImage?: string;
    stock?: number;
  } | null;
  items?: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    coverImage?: string;
  }>;
}

export function WhatsAppOrderModal({
  isOpen,
  onClose,
  product,
  items,
}: WhatsAppOrderModalProps) {
  const router = useRouter();
  const { user, refreshUser, switchDemoUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 ");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  if (!isOpen) return null;

  const orderItems = product
    ? [{ id: product.id, title: product.title, price: product.price, quantity: 1, coverImage: product.coverImage }]
    : items || [];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInstantBuy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.trim().length < 8) {
      showToast("Please enter your WhatsApp number with country code.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          whatsappNumber: phone,
          customerName: name || user?.name || "Customer",
          customerEmail: user?.email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Order placed successfully! Status: PENDING (Admin verifying)", "success");
        // Refresh auth state so user profile shows logged in immediately
        await refreshUser();
        onClose();

        // Redirect to live order tracking page
        router.push(`/orders/${data.orderId}`);
      } else {
        showToast(data.error || "Failed to create order", "error");
      }
    } catch {
      showToast("Network error creating order", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    try {
      await switchDemoUser("CUSTOMER");
      showToast("Fast logged in as customer!", "success");
    } catch {
      showToast("Demo login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#5842f5]/10 border border-[#5842f5]/20 flex items-center justify-center text-[#5842f5] text-xl font-bold">
            ⚡
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {user ? "1-Click Instant Buy" : "Fast Login & Buy"}
            </h3>
            <p className="text-xs text-slate-500">
              {user ? "Bas Buy par click karo aur order ho gaya!" : "Login karo aur 1-click me buy karo"}
            </p>
          </div>
        </div>

        {/* User Status / Fast Login Pill */}
        {user ? (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-800 truncate max-w-[180px]">
                {user.name || "Customer"}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-emerald-700 text-[10px] font-bold border border-emerald-200">
              ✓ Fast Logged In
            </span>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
            <span className="text-amber-800 text-[11px] font-medium">
              ⚡ Fast login ke liye WhatsApp number enter karein:
            </span>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 text-[10px] font-bold hover:bg-amber-100 transition shrink-0"
            >
              1-Click Demo Login
            </button>
          </div>
        )}

        {/* Order item preview */}
        <div className="bg-[#f8f9fd] border border-slate-200/80 rounded-2xl p-4 mb-5 space-y-2">
          {orderItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-slate-800 font-bold truncate max-w-[220px]">{item.title}</span>
              <span className="font-mono text-slate-900 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold">
            <span className="text-slate-500">Total Due:</span>
            <span className="font-mono text-[#5842f5] text-base">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Buy Form */}
        <form onSubmit={handleInstantBuy} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              WhatsApp Number for Delivery <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:border-[#5842f5] focus:outline-none shadow-sm transition"
              />
              <span className="absolute left-3.5 top-3.5 text-slate-400">📱</span>
            </div>
          </div>

          {!user && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-[#5842f5] focus:outline-none shadow-sm transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#5842f5] hover:bg-[#4732e0] text-white font-black text-sm shadow-[0_8px_24px_rgba(88,66,245,0.38)] flex items-center justify-center gap-2 transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Processing Order...</span>
            ) : (
              <>
                <span>{user ? "Instant 1-Click Buy" : "Confirm & Place Order"} (${subtotal.toFixed(2)})</span>
                <span>→</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Instant order verification • Official digital license keys • Delivered directly to your WhatsApp & Digital Vault.
          </p>
        </form>
      </div>
    </div>
  );
}
