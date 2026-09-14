"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { FastLoginBuyModal } from "@/components/FastLoginBuyModal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const { user } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState("popular");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fastLoginProduct, setFastLoginProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let url = `/api/products?limit=50&sort=${sortOption}`;
        if (selectedCategory && selectedCategory !== "all") {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery.trim()) {
          url += `&q=${encodeURIComponent(searchQuery.trim())}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, searchQuery, sortOption]);

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

  const displayedProducts = (onlyInStock
    ? products.filter((p) => p.stock > 0)
    : products
  ).sort((a, b) => {
    if (sortOption === "price_asc") return a.price - b.price;
    if (sortOption === "price_desc") return b.price - a.price;
    if (sortOption === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return b.rating - a.rating;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* 1. Header with Search */}
      <div className="mb-8 pb-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Find your next favorite.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Subscriptions you love. Prices you&apos;ll love even more.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search subscriptions & tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:border-[#5842f5] focus:outline-none shadow-sm transition"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* 2. CATEGORIES ON TOP */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1">
          {/* All Products */}
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 whitespace-nowrap cursor-pointer ${
              selectedCategory === "all"
                ? "bg-slate-900 text-white font-bold shadow-sm"
                : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 font-medium"
            }`}
          >
            <span>All Products</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedCategory === "all" ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              {products.length}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white font-bold shadow-sm"
                    : "text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 font-medium"
                }`}
              >
                <span>{cat.name}</span>
                {cat.productCount > 0 && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    ({cat.productCount})
                  </span>
                )}
              </button>
            );
          })}

          {/* In-Stock Filter Pill */}
          <button
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
              onlyInStock
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
            }`}
          >
            <span>{onlyInStock ? "✓" : "○"}</span>
            <span>In-Stock Only</span>
          </button>
        </div>

        {/* Sort Dropdown on Right */}
        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="popular">Most popular ∨</option>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 3. PRODUCTS BELOW (Full-width 3D clay cards) */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 rounded-[28px] bg-white animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3 text-2xl">
            🔎
          </div>
          <p className="text-base font-bold text-slate-800">No subscriptions found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try resetting your search query or selecting &quot;All products&quot;.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setOnlyInStock(false);
            }}
            className="mt-4 px-6 py-2.5 rounded-full bg-[#5842f5] text-white text-xs font-bold shadow-md shadow-[#5842f5]/20 hover:bg-[#4732e0] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              slug={product.slug}
              price={product.price}
              comparePrice={product.comparePrice}
              coverImage={product.coverImage}
              category={product.category}
              badge={product.badge}
              stock={product.stock}
              rating={product.rating}
              reviewCount={product.reviewCount}
              features={product.features?.map((f: any) => typeof f === "string" ? f : f.feature)}
              deliveryTime={product.deliveryTime}
              description={product.description}
              onBuy={() => handleProductBuy(product)}
              onWhatsAppBuy={() => handleProductBuy(product)}
            />
          ))}
        </div>
      )}

      {/* Fast Login & Buy Modal */}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading subscriptions...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
