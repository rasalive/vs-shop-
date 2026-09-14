"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { WhatsAppOrderModal } from "@/components/WhatsAppOrderModal";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldOpenWhatsApp = searchParams.get("action") === "whatsapp";

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${resolvedParams.id}`);
        const data = await res.json();
        if (res.ok && data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          if (shouldOpenWhatsApp) {
            setIsWhatsAppModalOpen(true);
          }
        } else {
          router.push("/products");
        }
      } catch {
        router.push("/products");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [resolvedParams.id, router, shouldOpenWhatsApp]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="w-10 h-10 border-2 border-[#5842f5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium">Loading subscription details...</p>
      </div>
    );
  }

  if (!product) return null;

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast("This item is currently sold out", "error");
      return;
    }
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        coverImage: product.coverImage,
        stock: product.stock,
      },
      quantity
    );
    showToast(`Added ${quantity}x "${product.title}" to cart!`, "success");
  };

  const handleInstantBuy = () => {
    if (product.stock <= 0) {
      showToast("This item is currently sold out", "error");
      return;
    }
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        coverImage: product.coverImage,
        stock: product.stock,
      },
      quantity
    );
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-900 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-slate-900 transition">
          Products
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-slate-900 transition"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Column: Product Visuals */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video sm:aspect-[16/10] rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
            <Image
              src={product.coverImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#5842f5] text-white shadow-sm">
                {product.badge}
              </span>
            )}
            <div className="absolute top-4 right-4">
              {product.stock > 0 ? (
                <span className="px-3 py-1 rounded-full bg-white/95 text-emerald-600 border border-emerald-200 text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {product.stock} In Stock
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-white/95 text-rose-600 border border-rose-200 text-xs font-bold backdrop-blur-md shadow-sm">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <span className="block text-xl mb-1">⚡</span>
              <span className="block text-xs font-bold text-slate-900">Instant Delivery</span>
              <span className="text-[10px] text-slate-500">{product.deliveryTime}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <span className="block text-xl mb-1">🛡️</span>
              <span className="block text-xs font-bold text-slate-900">Warranty</span>
              <span className="text-[10px] text-slate-500">{product.warrantyPeriod}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <span className="block text-xl mb-1">🔑</span>
              <span className="block text-xs font-bold text-slate-900">Digital Vault</span>
              <span className="text-[10px] text-slate-500">1-Click Key Decrypt</span>
            </div>
          </div>

          {/* Description & Features */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Subscription Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Key Features & Included Benefits
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features.map((feat: string, i: number) => (
                    <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout & Action Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#5842f5]/10 text-[#5842f5] border border-[#5842f5]/20">
                {product.category?.name || "Subscription"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {product.title}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center text-amber-500 font-bold">
                  ★ {product.rating} ({product.reviewCount} reviews)
                </span>
                <span>•</span>
                <span>🔥 {product.totalSold}+ sold</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Special Price:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-sm font-mono text-slate-400 line-through">
                      ${product.comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {discount && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-600 border border-rose-200">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-l-xl transition"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-mono text-slate-900 font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-r-xl transition disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Call To Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* WhatsApp Direct Buy Button (Highlighted) */}
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.346.491 1.2.534 1.288.043.088.072.19.014.306-.058.116-.087.188-.173.289l-.26.302c-.087.098-.178.204-.077.378.101.173.449.74 0.963 1.198.662.59 1.221.774 1.394.86.173.087.275.072.376-.044.101-.116.433-.506.549-.68.116-.174.231-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.073.043.419-.101.824z" />
                </svg>
                <span>Buy via WhatsApp (Instant Pending Verification)</span>
              </button>

              {/* Instant Buy (Credit Card / Crypto) */}
              <button
                onClick={handleInstantBuy}
                disabled={product.stock <= 0}
                className="w-full py-3.5 rounded-2xl bg-[#5842f5] hover:bg-[#4732e0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#5842f5]/25 transition transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Instant Checkout (${(product.price * quantity).toFixed(2)})</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Add to Bag */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-sm transition disabled:opacity-40"
              >
                Add to Cart
              </button>
            </div>

            {/* Buyer Trust Assurance */}
            <div className="text-[11px] text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
              <p className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Encrypted delivery to your personal Digital Vault</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Full email access & login credential instructions</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>24/7 Live ticket & WhatsApp helpdesk support</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="pt-10 border-t border-slate-200/80">
          <h2 className="text-xl font-black text-slate-900 mb-6">Related Subscriptions & Passes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                slug={item.slug}
                price={item.price}
                comparePrice={item.comparePrice}
                coverImage={item.coverImage}
                stock={item.stock}
              />
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppOrderModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        product={{
          id: product.id,
          title: product.title,
          price: product.price,
          coverImage: product.coverImage,
          stock: product.stock,
        }}
      />
    </div>
  );
}
