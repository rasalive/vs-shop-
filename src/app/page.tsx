"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZyvooHero } from "@/components/ZyvooHero";
import { ProductCard } from "@/components/ProductCard";
import { FastLoginBuyModal } from "@/components/FastLoginBuyModal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("popular");
  const [loading, setLoading] = useState(true);
  const [fastLoginProduct, setFastLoginProduct] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?limit=20"),
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        setCategories(catData.categories || []);
        setProducts(prodData.products || []);
      } catch (e) {
        console.error("Home data error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProductBuy = async (product: any) => {
    // If user is ALREADY logged in -> "Bass buy par click karte hi order ho jayega!" (1-Click Instant Buy)
    if (user) {
      showToast(`Placing 1-click order for ${product.title}...`, "info");
      try {
        const phone = user.phone || "+919876543210";
        const res = await fetch("/api/orders/whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ id: product.id, quantity: 1 }],
            whatsappNumber: phone,
            customerName: user.name || "Customer",
            customerEmail: user.email,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast("Order placed successfully! Status: PENDING", "success");
          router.push(`/orders/${data.orderId}`);
        } else {
          showToast(data.error || "Order placement failed", "error");
        }
      } catch {
        showToast("Error processing 1-click order", "error");
      }
    } else {
      // User is NOT logged in -> Show Fast Login popup!
      setFastLoginProduct(product);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "entertainment") {
      const cat = p.category?.slug || "";
      const t = (p.title + " " + p.slug).toLowerCase();
      return cat === "streaming-services" || t.includes("netflix") || t.includes("crunchyroll") || t.includes("spotify");
    }
    if (selectedFilter === "ai") {
      const cat = p.category?.slug || "";
      const t = (p.title + " " + p.slug).toLowerCase();
      return cat === "software-tools" || t.includes("canva") || t.includes("chatgpt");
    }
    if (selectedFilter === "gaming") {
      const cat = p.category?.slug || "";
      const t = (p.title + " " + p.slug).toLowerCase();
      return cat === "gaming-keys" || cat === "accounts" || t.includes("steam") || t.includes("gta");
    }
    if (selectedFilter === "deals") {
      return (p.comparePrice && p.comparePrice > p.price) || p.badge?.includes("DEAL") || p.badge?.includes("HOT");
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === "price_asc") return a.price - b.price;
    if (sortOption === "price_desc") return b.price - a.price;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-[#f5f6fb]">
      {/* 1. Zyvoo 3D Floating Hero Showcase */}
      <ZyvooHero onWhatsAppOrder={(p) => handleProductBuy(p)} />

      {/* 2. "Find your next favorite" Catalog Section */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Find your next favorite.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Subscriptions you love. Prices you&apos;ll love even more.
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-[#5842f5] hover:text-[#4338ca] flex items-center gap-1 group"
          >
            <span>View all products</span>
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              ↗
            </span>
          </Link>
        </div>

        {/* Filter Pills & Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* All products */}
            <button
              onClick={() => setSelectedFilter("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                selectedFilter === "all"
                  ? "bg-slate-900 text-white font-bold shadow-sm"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>All Products</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedFilter === "all" ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                {products.length}
              </span>
            </button>

            {/* Entertainment */}
            <button
              onClick={() => setSelectedFilter("entertainment")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                selectedFilter === "entertainment"
                  ? "bg-slate-900 text-white font-bold shadow-sm"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Entertainment</span>
            </button>

            {/* AI & Productivity */}
            <button
              onClick={() => setSelectedFilter("ai")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                selectedFilter === "ai"
                  ? "bg-slate-900 text-white font-bold shadow-sm"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Software & AI</span>
            </button>

            {/* Gaming & Keys */}
            <button
              onClick={() => setSelectedFilter("gaming")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                selectedFilter === "gaming"
                  ? "bg-slate-900 text-white font-bold shadow-sm"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <span>Gaming Keys</span>
            </button>

            {/* Best deals */}
            <button
              onClick={() => setSelectedFilter("deals")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                selectedFilter === "deals"
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium"
              }`}
            >
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Best Deals</span>
            </button>
          </div>

          {/* Right Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="popular">Most popular ∨</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Rows Vertical Stack (Exact 3D clay cards from screenshot) */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 rounded-[28px] bg-white animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 p-8">
            No subscriptions found in this category.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                slug={p.slug}
                price={p.price}
                comparePrice={p.comparePrice}
                coverImage={p.coverImage}
                category={p.category}
                badge={p.badge}
                stock={p.stock}
                rating={p.rating}
                reviewCount={p.reviewCount}
                features={p.features?.map((f: any) => typeof f === 'string' ? f : f.feature)}
                deliveryTime={p.deliveryTime}
                description={p.description}
                onBuy={() => handleProductBuy(p)}
                onWhatsAppBuy={() => handleProductBuy(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Fast Login & Buy Modal */}
      {fastLoginProduct && (
        <FastLoginBuyModal
          isOpen={!!fastLoginProduct}
          onClose={() => setFastLoginProduct(null)}
          product={fastLoginProduct}
        />
      )}
    </div>
  );
}
