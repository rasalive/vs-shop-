"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface HeroProduct {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  category: string;
  rating: number;
  ratingCount: string;
  price: number;
  comparePrice: number;
  discount: string;
  badge: string;
  accentColor: string;
  glowColor: string;
  gradientBg: string;
  stock: number;
  features: string[];
  iconSvg: React.ReactNode;
  coverImage?: string;
}

const FEATURED_SLIDES: HeroProduct[] = [
  {
    id: "spotify-premium-hero",
    title: "Spotify Premium [1 Month]",
    slug: "spotify-premium-1-month",
    subtitle: "Stream unlimited music and podcasts ad-free with offline downloads and highest bitrate master audio.",
    category: "Streaming & Music",
    rating: 4.9,
    ratingCount: "47,200+",
    price: 2.99,
    comparePrice: 9.99,
    discount: "-70%",
    badge: "GLOBAL LICENSE",
    accentColor: "#1ed760",
    glowColor: "rgba(30, 215, 96, 0.25)",
    gradientBg: "from-[#0a1f14] via-[#091410] to-[#0a0d14]",
    stock: 25,
    features: [
      "Ad-free music listening on all devices",
      "Download tracks to listen offline",
      "Unlimited skips & high audio bitrate",
      "Instant credentials sent to Vault & WhatsApp",
    ],
    iconSvg: (
      <svg className="w-8 h-8 text-[#1ed760]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.31c-.22.36-.688.472-1.048.252-2.87-1.753-6.48-2.15-10.737-1.178-.412.094-.82-.162-.914-.574-.094-.412.162-.82.574-.914 4.656-1.064 8.65-.615 11.873 1.365.36.22.472.688.252 1.049zm1.468-3.26c-.276.45-.865.594-1.315.318-3.286-2.02-8.295-2.605-12.18-1.425-.506.154-1.043-.134-1.197-.64-.154-.506.134-1.043.64-1.197 4.444-1.348 9.967-.698 13.734 1.628.45.276.594.865.318 1.316zm.126-3.41c-3.94-2.34-10.435-2.555-14.218-1.406-.604.184-1.246-.16-1.43-.764-.184-.604.16-1.246.764-1.43 4.343-1.318 11.51-1.066 16.035 1.62.544.323.722 1.03.4 1.574-.324.544-1.03.722-1.574.4-.01-.004.023.006.023.006z" />
      </svg>
    ),
  },
  {
    id: "netflix-lifetime-hero",
    title: "Netflix UHD [LIFETIME 4K]",
    slug: "netflix-lifetime-uhd",
    subtitle: "Stream blockbuster movies and exclusive series in ultra-crisp 4K HDR with your own private PIN profile.",
    category: "Cinema & Shows",
    rating: 5.0,
    ratingCount: "38,500+",
    price: 19.99,
    comparePrice: 49.99,
    discount: "-60%",
    badge: "PRIVATE PROFILE PIN",
    accentColor: "#e50914",
    glowColor: "rgba(229, 9, 20, 0.25)",
    gradientBg: "from-[#220708] via-[#150506] to-[#0a0d14]",
    stock: 15,
    features: [
      "Ultra HD 4K HDR streaming resolution",
      "Private personal profile with custom PIN lock",
      "Works on Smart TVs, Phones, PC & Tablets",
      "Full lifetime renewal & replacement warranty",
    ],
    iconSvg: (
      <span className="text-[#e50914] font-black text-2xl sm:text-3xl tracking-tighter font-serif select-none">
        N
      </span>
    ),
  },
  {
    id: "chatgpt-plus-hero",
    title: "ChatGPT Plus & Canvas [GPT-4o]",
    slug: "chatgpt-plus-30-days",
    subtitle: "Unlock cutting-edge OpenAI reasoning, live Canvas coding, advanced data analysis, and priority server access.",
    category: "AI & Productivity",
    rating: 4.9,
    ratingCount: "29,800+",
    price: 14.99,
    comparePrice: 20.00,
    discount: "-25%",
    badge: "GPT-4O UNLOCKED",
    accentColor: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.25)",
    gradientBg: "from-[#061826] via-[#05111a] to-[#0a0d14]",
    stock: 18,
    features: [
      "Full GPT-4o, Canvas, and Voice mode access",
      "DALL-E 3 image generation & custom GPTs",
      "Zero usage rate caps during peak hours",
      "Direct login credentials provisioned in vault",
    ],
    iconSvg: (
      <svg className="w-8 h-8 text-[#06b6d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.587-1.11L2 22l1.11-5.413A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2z" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
  },
  {
    id: "steam-diamond-hero",
    title: "Steam Random Diamond Key [AAA]",
    slug: "steam-random-diamond-key",
    subtitle: "Guaranteed $20–$70 value AAA title key. Activate permanently on your personal global Steam library.",
    category: "Gaming Licenses",
    rating: 4.9,
    ratingCount: "19,400+",
    price: 7.99,
    comparePrice: 29.99,
    discount: "-73%",
    badge: "AAA GUARANTEED",
    accentColor: "#6366f1",
    glowColor: "rgba(99, 102, 241, 0.25)",
    gradientBg: "from-[#111328] via-[#0c0e1e] to-[#0a0d14]",
    stock: 22,
    features: [
      "Guaranteed Metacritic 75+ rated AAA game",
      "Region-Free Global permanent activation",
      "Direct Steam code reveal in your digital vault",
      "100% duplicate protection guarantee",
    ],
    iconSvg: (
      <svg className="w-8 h-8 text-[#6366f1]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.979 0C5.378 0 .025 5.34.025 11.928a11.905 11.905 0 0 0 1.767 6.205l4.887-7.009a3.633 3.633 0 0 1 3.513-2.617c2.016 0 3.65 1.63 3.65 3.642 0 .532-.116 1.038-.323 1.498l4.475 2.584a5.952 5.952 0 0 0 .19-1.496c0-3.328-2.698-6.024-6.028-6.024-3.33 0-6.027 2.696-6.027 6.024 0 .39.043.769.114 1.139L.906 18.064A11.936 11.936 0 0 0 11.979 24c6.602 0 11.954-5.34 11.954-11.928C23.933 5.34 18.58 0 11.979 0zm-5.074 16.326l-2.072 2.973a11.758 11.758 0 0 0 2.21.906l1.923-2.759a2.383 2.383 0 0 1-2.061-1.12zm7.42-3.822a2.373 2.373 0 0 1-2.37 2.368 2.37 2.37 0 0 1-1.393-.454l2.122-3.045c.91.134 1.641.864 1.641 1.771z" />
      </svg>
    ),
  },
];

interface ZyvooHeroProps {
  onWhatsAppOrder: (product: any) => void;
}

export function ZyvooHero({ onWhatsAppOrder }: ZyvooHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const current = FEATURED_SLIDES[currentIndex];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % FEATURED_SLIDES.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length);
    setProgress(0);
  }, []);

  // Auto-slide timer with smooth progress bar
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50; // update progress every 50ms
    const totalDuration = 6000; // 6 seconds per slide
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleSelectSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: current.id,
        title: current.title,
        price: current.price,
        coverImage: current.coverImage,
        stock: current.stock,
      },
      1
    );
    showToast(`Added ${current.title} to cart!`, "success");
  };

  return (
    <section
      className="relative overflow-hidden pt-6 pb-12 transition-colors duration-500"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Stage: Epic Games / Steam Style Cinematic Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Cinematic Feature Showcase (8 Columns) */}
          <div
            className={`lg:col-span-8 rounded-3xl bg-gradient-to-br ${current.gradientBg} border border-slate-800 text-white p-6 sm:p-10 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[460px] transition-all duration-500`}
            style={{
              boxShadow: `0 20px 60px -15px ${current.glowColor}, 0 0 30px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Ambient Backlight Glow */}
            <div
              className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-700 opacity-40"
              style={{ backgroundColor: current.accentColor }}
            />

            {/* Top Row: Category, Star Rating & Official Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-black shadow-sm"
                  style={{ backgroundColor: current.accentColor }}
                >
                  {current.badge}
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  {current.category}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center text-amber-400 font-bold">
                  ★ {current.rating.toFixed(1)}
                </span>
                <span className="text-slate-400 font-normal">
                  ({current.ratingCount} buyers)
                </span>
                <span className="text-slate-700">•</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {current.stock} Keys In Stock
                </span>
              </div>
            </div>

            {/* Middle Section: Title, Subtitle, Bullet Features */}
            <div className="my-6 space-y-4 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg">
                  {current.iconSvg}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-sans leading-tight">
                    {current.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                    {current.subtitle}
                  </p>
                </div>
              </div>

              {/* 4 Feature Checklist Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {current.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-200 bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-xs"
                  >
                    <span
                      className="font-black text-sm shrink-0"
                      style={{ color: current.accentColor }}
                    >
                      ✓
                    </span>
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: Pricing & Actions */}
            <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              {/* Pricing Display */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  ${current.price.toFixed(2)}
                </span>
                <span className="text-sm sm:text-base text-slate-400 line-through font-mono">
                  ${current.comparePrice.toFixed(2)}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-lg text-xs font-black text-black"
                  style={{ backgroundColor: current.accentColor }}
                >
                  SAVE {current.discount.replace("-", "")}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onWhatsAppOrder(current)}
                  className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer text-black hover:opacity-95"
                  style={{
                    backgroundColor: current.accentColor,
                    boxShadow: `0 8px 25px ${current.glowColor}`,
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Instant Buy</span>
                  <span>→</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                >
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Add to Cart</span>
                </button>

                <Link
                  href={`/products/${current.slug}`}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-300 hover:text-white transition"
                  title="View full product page"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar Deck: Interactive Carousel Navigation (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-2.5">
            {FEATURED_SLIDES.map((slide, idx) => {
              const isActive = currentIndex === idx;
              return (
                <div
                  key={slide.id}
                  onClick={() => handleSelectSlide(idx)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                    isActive
                      ? "bg-white border-slate-300 shadow-md scale-[1.01]"
                      : "bg-white/70 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  {/* Live Progress Bar when active */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 rounded-t-2xl overflow-hidden">
                      <div
                        className="h-full transition-all duration-75"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: slide.accentColor,
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {/* Slide Mini Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: isActive ? `${slide.accentColor}15` : "#f8f9fa",
                        borderColor: isActive ? `${slide.accentColor}40` : "#e9ecef",
                      }}
                    >
                      <div className="scale-75">{slide.iconSvg}</div>
                    </div>

                    {/* Slide Titles & Category */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {slide.category}
                        </span>
                        <span
                          className="text-[10px] font-extrabold px-1.5 py-0.2 rounded"
                          style={{
                            backgroundColor: `${slide.accentColor}20`,
                            color: slide.accentColor === "#1ed760" ? "#0f7634" : slide.accentColor,
                          }}
                        >
                          {slide.discount}
                        </span>
                      </div>
                      <h4
                        className={`text-xs sm:text-sm font-black truncate transition-colors ${
                          isActive ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {slide.title}
                      </h4>
                    </div>

                    {/* Slide Price Tag */}
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                        ${slide.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Controls: Previous / Next & Status indicator */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span>Auto-playing deals</span>
                <span className="text-slate-400">({isPaused ? "Paused on hover" : "6s timer"})</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
                  title="Previous slide"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
                  title="Next slide"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Trust Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-slate-200/80">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">0-2m Automated Delivery</h4>
              <p className="text-[11px] text-slate-500">Delivered directly to Vault & WhatsApp</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Replacement Guarantee</h4>
              <p className="text-[11px] text-slate-500">100% full warranty on all keys</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">256-Bit SSL Checkout</h4>
              <p className="text-[11px] text-slate-500">Secure payments via Stripe & PayPal</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">24/7 Priority Support</h4>
              <p className="text-[11px] text-slate-500">Live automated desk & WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
