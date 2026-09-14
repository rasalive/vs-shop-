"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, total, couponCode, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 ");
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Add some subscriptions or passes from the catalog to continue checkout.
        </p>
        <Link
          href="/products"
          className="px-6 py-2.5 rounded-2xl bg-[#5842f5] hover:bg-[#4732e0] text-white text-xs font-bold shadow-sm transition"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const handleOnlineCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.trim().length < 8) {
      showToast("Please enter your WhatsApp phone number for key delivery & verification", "error");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          whatsappNumber: phone,
          customerName: name || user?.name || "Customer",
          customerEmail: email || user?.email,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Order placed successfully! Status: PENDING", "success");
        clearCart();
        router.push(`/orders/${data.orderId}`);
      } else {
        showToast(data.error || "Order placement failed. Please try again.", "error");
      }
    } catch {
      showToast("Checkout error occurred", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your details for instant credential delivery and digital vault access.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Customer Info & Payment Gateways */}
        <form onSubmit={handleOnlineCheckout} className="lg:col-span-7 space-y-6">
          {/* Customer Information */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              1. Delivery & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:border-[#5842f5] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (for Key Delivery)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:border-[#5842f5] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:border-[#5842f5] focus:bg-white focus:outline-none font-mono transition"
                />
                <span className="absolute left-3.5 top-3 text-slate-400">📱</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Order credentials and verification updates will be sent to this WhatsApp number.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-[#5842f5] hover:bg-[#4732e0] text-white font-black text-sm shadow-lg shadow-[#5842f5]/30 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Place Order & Verify (${total.toFixed(2)})</span>
                <span className="text-base font-bold">→</span>
              </>
            )}
          </button>
        </form>

        {/* Right Col: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Order Summary ({items.length} items)
            </h3>

            {/* Items */}
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <Image src={item.coverImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"} alt={item.title} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 line-clamp-1 max-w-[180px]">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Digital Delivery</span>
                <span className="text-emerald-600 font-semibold">FREE (Instant)</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Due</span>
                <span className="font-mono text-[#5842f5]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Guarantee Note */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">🛡️ 100% Guaranteed Key Delivery</p>
              <p>
                Credentials are automatically provisioned and decrypted in your personal Digital Vault immediately upon payment verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
