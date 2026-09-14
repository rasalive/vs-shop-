"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface FastLoginBuyModalProps {
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

export function FastLoginBuyModal({
  isOpen,
  onClose,
  product,
  items,
}: FastLoginBuyModalProps) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState("+91 ");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const orderItems = product
    ? [{ id: product.id, title: product.title, price: product.price, quantity: 1, coverImage: product.coverImage }]
    : items || [];

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Place order directly via API
  const placeOrder = async (userPhone: string, userName?: string) => {
    const res = await fetch("/api/orders/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: orderItems,
        whatsappNumber: userPhone,
        customerName: userName || user?.name || "Customer",
        customerEmail: user?.email,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Order confirmed! Digital credentials preparing...", "success");
      onClose();
      router.push(`/orders/${data.orderId}`);
      return true;
    } else {
      showToast(data.error || "Failed to create order", "error");
      return false;
    }
  };

  const handleFastLoginAndBuy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.trim().length < 8) {
      showToast("Please enter a valid phone number with country code.", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Fast login to create / restore session
      const loginRes = await fetch("/api/auth/fast-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: name.trim() || "Customer",
        }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        showToast(loginData.error || "Checkout authentication failed", "error");
        setLoading(false);
        return;
      }

      await refreshUser();
      // 2. Immediately place the order in 1 click
      await placeOrder(phone, name);
    } catch {
      showToast("An error occurred while processing your order.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Express Digital Checkout
            </h3>
            <p className="text-xs text-slate-500">
              Instant key delivery to your WhatsApp & Digital Vault
            </p>
          </div>
        </div>

        {/* Selected Product Summary */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 mb-5 space-y-2">
          {orderItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-slate-800 font-bold truncate max-w-[220px]">{item.title}</span>
              <span className="font-mono text-slate-900 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold items-center">
            <span className="text-slate-600">Total Amount:</span>
            <span className="font-mono text-[#5842f5] text-lg">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Express Checkout Form */}
        <form onSubmit={handleFastLoginAndBuy} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              WhatsApp Delivery Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:border-[#5842f5] focus:outline-none shadow-xs transition"
              />
              <span className="absolute left-3.5 top-3.5 text-emerald-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.346.491 1.2.534 1.288.043.088.072.19.014.306-.058.116-.087.188-.173.289l-.26.302c-.087.098-.178.204-.077.378.101.173.449.74 0.963 1.198.662.59 1.221.774 1.394.86.173.087.275.072.376-.044.101-.116.433-.506.549-.68.116-.174.231-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.073.043.419-.101.824z" />
                </svg>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Your digital license credentials and activation instructions will be delivered here instantly.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Full Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs focus:border-[#5842f5] focus:outline-none shadow-xs transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Securing Order...</span>
              </span>
            ) : (
              <>
                <span>Complete Order (${subtotal.toFixed(2)})</span>
                <span className="text-base">→</span>
              </>
            )}
          </button>

          {/* Trust Guarantees */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>256-Bit SSL Encrypted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Instant Key Provisioning</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
