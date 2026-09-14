"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function DigitalVaultPage() {
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [revealed, setRevealed] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPurchases() {
      try {
        const res = await fetch("/api/user/purchases");
        const data = await res.json();
        setPurchases(data.purchases || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPurchases();
  }, []);

  const toggleReveal = (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyKey = (keySecret: string, id: string) => {
    navigator.clipboard.writeText(keySecret);
    setCopiedId(id);
    showToast("Key copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const downloadKeyTxt = (purchase: any) => {
    const textContent = `VORTEX DIGITAL VAULT RECEIPT\n--------------------------------\nProduct: ${purchase.product.title}\nOrder Ref: #${purchase.order?.orderNumber || "DIRECT"}\nDate: ${new Date(purchase.createdAt).toLocaleString()}\n\nCREDENTIALS / SECRET KEY:\n${purchase.keySecret}\n\nInstructions:\n${purchase.notes || "No special instructions"}\n\nSupport: https://vortex.io/support\nWhatsApp: +1234567890`;

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Vortex_${purchase.product.slug}_${purchase.id.slice(-6)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded credentials text file!", "success");
  };

  const filteredPurchases = purchases.filter((p) =>
    p.product?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Vault Header & Search */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🔑</span>
            <span>Digital Key Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted storage of all your purchased gaming accounts and keys.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Vault Items List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your vault keys...</div>
      ) : filteredPurchases.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto text-xl">
            🔒
          </div>
          <h3 className="text-sm font-bold text-white">No Digital Keys In Your Vault Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once you place an order, your accounts, keys, and setup guides will appear here instantly.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold mt-2"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPurchases.map((purchase) => {
            const isShown = revealed[purchase.id];
            return (
              <div
                key={purchase.id}
                className="p-5 rounded-3xl bg-[#0e1324] border border-slate-800 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <Image
                        src={purchase.product.coverImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"}
                        alt={purchase.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{purchase.product.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        Purchased on {new Date(purchase.createdAt).toLocaleDateString()} • Order #{purchase.order?.orderNumber || "DIRECT"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReveal(purchase.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
                    >
                      {isShown ? "Hide Key" : "Reveal Key"}
                    </button>
                    <button
                      onClick={() => copyKey(purchase.keySecret, purchase.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      {copiedId === purchase.id ? "✓ Copied" : "📋 Copy"}
                    </button>
                    <button
                      onClick={() => downloadKeyTxt(purchase)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                      title="Download text file"
                    >
                      📥
                    </button>
                  </div>
                </div>

                {/* Key Secret Display Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-300 break-all select-all">
                    {isShown
                      ? purchase.keySecret
                      : "••••••••••••••••••••••••••••••••••••••••"}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-2 shrink-0 font-mono">
                    {isShown ? "DECRYPTED" : "ENCRYPTED"}
                  </span>
                </div>

                {/* Instructions / Notes */}
                {purchase.notes && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-slate-200 block mb-0.5">Instructions:</span>
                    <p className="text-[11px] text-slate-400">{purchase.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
