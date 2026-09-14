"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NOTIFICATIONS = [
  { user: "Marcus (DE)", product: "Steam Random Diamond Key", time: "2m ago", img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&q=80" },
  { user: "Dazy (IN)", product: "Netflix (LIFETIME UHD)", time: "4m ago", img: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&q=80" },
  { user: "Ghost_99 (US)", product: "GTA V Modded Account [Rank 250]", time: "7m ago", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80" },
  { user: "Sophia (UK)", product: "Canva Pro [1 Year Access]", time: "11m ago", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&q=80" },
  { user: "David (FR)", product: "ChatGPT Plus & Canvas", time: "14m ago", img: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=300&q=80" },
];

export function SalesTicker() {
  const pathname = usePathname();
  const [current, setCurrent] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname === "/login") return;
    // Initial delay
    const initialTimer = setTimeout(() => {
      triggerNotification(0);
    }, 4000);

    const interval = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * NOTIFICATIONS.length);
      triggerNotification(nextIndex);
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const triggerNotification = (index: number) => {
    setCurrent(index);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  if (pathname === "/login" || current === null || !visible) return null;

  const item = NOTIFICATIONS[current];

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-xs animate-slideUp">
      <div className="p-3 rounded-2xl bg-[#0e1324]/90 backdrop-blur-md border border-indigo-500/30 shadow-2xl shadow-indigo-950/40 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
          <Image src={item.img} alt={item.product} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Purchase
            </span>
            <span>{item.time}</span>
          </div>
          <p className="text-xs font-bold text-white truncate">{item.product}</p>
          <p className="text-[10px] text-slate-400 truncate">by {item.user}</p>
        </div>
      </div>
    </div>
  );
}
