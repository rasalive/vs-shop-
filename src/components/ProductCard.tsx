"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  coverImage?: string;
  category?: { name: string; slug: string };
  badge?: string | null;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  deliveryTime?: string;
  description?: string;
  onBuy?: (product: any) => void;
  onWhatsAppBuy?: (product: any) => void;
}

function getTagline(title: string, slug: string, description?: string): string {
  const t = (title + " " + slug).toLowerCase();
  if (t.includes("canva")) return "Design without limits. All Pro tools unlocked.";
  if (t.includes("crunchyroll")) return "Your next anime adventure awaits in HD.";
  if (t.includes("netflix")) return "Ultra HD 4K screen with private profile PIN.";
  if (t.includes("spotify")) return "The music you love, ad-free & offline.";
  if (t.includes("chatgpt")) return "Supercharge your productivity with GPT-4o & Canvas.";
  if (t.includes("gta")) return "Rank 250 + $500M bank balance on clean account.";
  if (t.includes("steam")) return "AAA guaranteed permanent game key.";
  if (description) {
    const firstSentence = description.split(".")[0];
    if (firstSentence && firstSentence.length <= 70) return firstSentence + ".";
  }
  return "Premium subscription with instant digital delivery.";
}

function getWellCaption(title: string, slug: string): string {
  const t = (title + " " + slug).toLowerCase();
  if (t.includes("spotify")) return "PREMIUM INDIVIDUAL";
  if (t.includes("netflix")) return "4K UHD PRIVATE PIN";
  if (t.includes("canva")) return "OFFICIAL PRO LICENSE";
  if (t.includes("crunchyroll")) return "MEGA FAN HD";
  if (t.includes("chatgpt")) return "GPT-4O + CANVAS";
  if (t.includes("gta")) return "PC VERIFIED ACCOUNT";
  if (t.includes("steam")) return "GLOBAL STEAM KEY";
  return "DIGITAL LICENSE";
}

function getFeaturesForProduct(title: string, slug: string, features?: string[]): string[] {
  if (features && features.length > 0) return features;
  const t = (title + " " + slug).toLowerCase();
  if (t.includes("spotify")) {
    return ["Ad-free music listening", "Download to listen offline", "High audio quality"];
  }
  if (t.includes("netflix")) {
    return ["Ultra HD 4K Streaming", "Private profile with PIN", "Works on Smart TVs & Phones"];
  }
  if (t.includes("canva")) {
    return ["All Pro Templates & Assets", "Brand Kit & Magic Resize", "100GB Cloud Storage"];
  }
  if (t.includes("chatgpt")) {
    return ["Full GPT-4o & Canvas Access", "DALL-E 3 Image Generation", "Voice & Code Interpreter"];
  }
  if (t.includes("crunchyroll")) {
    return ["Ad-free Anime in 1080p Full HD", "Simulcast fresh from Japan", "Offline viewing enabled"];
  }
  if (t.includes("steam")) {
    return ["Guaranteed AAA Title Key", "Global Region Free Activation", "Permanent Steam Library"];
  }
  if (t.includes("gta")) {
    return ["Rank 250 + $500M in Bank", "All Vehicles & Weapons Unlocked", "Safe Anti-Ban Protection"];
  }
  return ["Instant Digital Delivery", "Renewable Warranty Support", "24/7 Priority Assistance"];
}

function renderBrandIcon(title: string, slug: string, coverImage?: string) {
  const t = (title + " " + slug).toLowerCase();

  // Canva Pro
  if (t.includes("canva")) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#00c4cc] via-[#5b4cf5] to-[#7d2ae8] zyvoo-3d-plate flex items-center justify-center shadow-lg p-2">
        <span className="text-white font-black text-xl sm:text-2xl tracking-tighter italic font-serif select-none">
          Canva
        </span>
      </div>
    );
  }

  // Crunchyroll
  if (t.includes("crunchyroll")) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#ff6400] zyvoo-3d-plate flex items-center justify-center shadow-lg p-2.5">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 fill-white" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="white" />
          <path
            d="M13 16.93c-2.72-.4-4.79-2.6-4.93-5.35.25.13.52.22.81.27 1.9.33 3.63-.82 4.12-2.58.49 1.76 2.22 2.91 4.12 2.58.29-.05.56-.14.81-.27-.14 2.75-2.21 4.95-4.93 5.35z"
            fill="#ff6400"
          />
        </svg>
      </div>
    );
  }

  // Netflix
  if (t.includes("netflix")) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#141414] zyvoo-3d-plate flex items-center justify-center shadow-lg">
        <span className="text-[#E50914] font-black text-4xl sm:text-5xl tracking-tighter font-sans select-none">
          N
        </span>
      </div>
    );
  }

  // Spotify
  if (t.includes("spotify")) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#121212] zyvoo-3d-plate flex items-center justify-center shadow-lg p-3">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 fill-[#1ED760]" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.485 17.31c-.218.358-.684.472-1.042.254-2.855-1.745-6.45-2.14-10.686-1.172-.41.094-.817-.16-.91-.57-.094-.41.16-.817.57-.91 4.636-1.06 8.604-.613 11.814 1.356.358.218.472.684.254 1.042zm1.464-3.256c-.274.446-.86.588-1.306.314-3.268-2.008-8.25-2.59-12.114-1.416-.502.152-1.033-.134-1.185-.636-.152-.502.134-1.033.636-1.185 4.414-1.34 9.914-.688 13.655 1.616.446.274.588.86.314 1.306zm.126-3.395c-3.92-2.327-10.38-2.542-14.127-1.404-.6.182-1.238-.16-1.42-.76-.182-.6.16-1.238.76-1.42 4.305-1.306 11.442-1.055 15.952 1.623.539.32.716 1.02.396 1.56-.32.539-1.02.716-1.56.396z"/>
        </svg>
      </div>
    );
  }

  // ChatGPT
  if (t.includes("chatgpt")) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#10a37f] zyvoo-3d-plate flex items-center justify-center p-3 shadow-lg">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 fill-white" viewBox="0 0 24 24">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1635a.0804.0804 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.402-.6863zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813l-.0048 6.7219z"/>
        </svg>
      </div>
    );
  }

  // Steam / Diamond Keys
  if (t.includes("steam") || t.includes("diamond") || t.includes("key")) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#171a21] to-[#1b2838] zyvoo-3d-plate flex items-center justify-center shadow-lg text-amber-400 font-bold text-2xl sm:text-3xl">
        💎
      </div>
    );
  }

  // GTA / Gaming Accounts
  if (t.includes("gta") || t.includes("account") || t.includes("modded")) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1a1c29] to-[#2e1065] zyvoo-3d-plate flex items-center justify-center shadow-lg text-purple-300 font-bold text-2xl sm:text-3xl">
        🎮
      </div>
    );
  }

  // Custom Image fallback
  if (coverImage) {
    return (
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden zyvoo-3d-plate shadow-md">
        <Image src={coverImage} alt={title} fill className="object-cover" />
      </div>
    );
  }

  // Generic fallback
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white zyvoo-3d-plate flex items-center justify-center text-3xl font-bold text-[#5842f5] shadow-md">
      ✦
    </div>
  );
}

export function ProductCard({
  id,
  title,
  slug,
  price,
  comparePrice,
  coverImage,
  category,
  badge,
  stock = 10,
  rating = 5.0,
  reviewCount = 120,
  features = [],
  deliveryTime = "Instant (0-2m)",
  description,
  onBuy,
  onWhatsAppBuy,
}: ProductCardProps) {
  const tagline = getTagline(title, slug, description);
  const wellCaption = getWellCaption(title, slug);
  const productFeatures = getFeaturesForProduct(title, slug, features);

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productPayload = { id, title, slug, price, comparePrice, coverImage, stock };
    if (onBuy) {
      onBuy(productPayload);
    } else if (onWhatsAppBuy) {
      onWhatsAppBuy(productPayload);
    } else {
      window.location.href = `/products/${slug}?action=buy`;
    }
  };

  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;

  return (
    <div className="zyvoo-clay-card w-full p-4 sm:p-5 md:p-6 rounded-[28px] transition-all duration-300 group">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        {/* Left Side: 3D Recessed Well + Title, Badges & Feature Checklist */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
          {/* Deep Recessed 3D Well Socket with Brand Icon Plate & Subcaption */}
          <Link
            href={`/products/${slug}`}
            className="zyvoo-3d-well w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex flex-col items-center justify-center p-2.5 shrink-0 transition-transform group-hover:scale-[1.02]"
          >
            {renderBrandIcon(title, slug, coverImage)}
            <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase mt-1.5 text-center line-clamp-1">
              {wellCaption}
            </span>
          </Link>

          {/* Middle: Details & Features */}
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Category & Star Rating */}
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <span className="text-xs font-bold text-[#5842f5]">
                  {category.name}
                </span>
              )}
              <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                ★ {rating.toFixed(1)}{" "}
                <span className="text-slate-400 font-normal">({reviewCount})</span>
              </span>
              {badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-[#5842f5] border border-purple-200 shadow-sm">
                  {badge}
                </span>
              )}
              <span className="text-[11px] font-bold text-emerald-600">
                • In Stock ({stock})
              </span>
            </div>

            {/* Product Title */}
            <Link
              href={`/products/${slug}`}
              className="block group-hover:text-[#5842f5] transition"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug flex items-center gap-2">
                <span className="line-clamp-1">{title}</span>
                <span className="text-slate-400 text-sm font-normal group-hover:text-[#5842f5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0">
                  ↗
                </span>
              </h3>
            </Link>

            {/* Subtitle / Tagline */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-1">
              {tagline}
            </p>

            {/* Zyvoo Feature Checkmarks List (matching Zyvoo screenshot) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              {productFeatures.slice(0, 3).map((feat, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <span className="text-[#5842f5] font-bold">✓</span>
                  <span className="line-clamp-1">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Big Price & Prominent Purple "Buy Now →" Button */}
        <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/80 shrink-0">
          {/* Price Column */}
          <div className="text-left lg:text-right shrink-0">
            <div className="flex items-baseline gap-1 lg:justify-end">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                ${price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            {comparePrice && comparePrice > price && (
              <div className="flex items-center gap-1.5 lg:justify-end">
                <span className="text-xs font-mono text-slate-400 line-through">
                  ${comparePrice.toFixed(2)}
                </span>
                {discount && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                    -{discount}%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Single Zyvoo Purple "Buy Now →" Button */}
          <button
            onClick={handleBuyClick}
            className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#5842f5] hover:bg-[#4732e0] text-white font-extrabold text-sm shadow-[0_8px_25px_rgba(88,66,245,0.38)] flex items-center gap-2 transition transform hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            title="Instant Buy"
          >
            <svg
              className="w-4 h-4 text-white shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span>Buy Now</span>
            <span className="text-base font-bold">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
