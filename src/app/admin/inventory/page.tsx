"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";

export default function AdminInventoryPage() {
  const { showToast } = useToast();

  const [stockList, setStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk import state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [keysContent, setKeysContent] = useState("");
  const [notes, setNotes] = useState("");
  const [importing, setImporting] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (res.ok) {
        setStockList(data.stock || []);
        if (data.stock && data.stock.length > 0 && !selectedProductId) {
          setSelectedProductId(data.stock[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !keysContent.trim()) {
      showToast("Please select a product and enter keys to import", "error");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          content: keysContent.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Keys imported successfully!", "success");
        setKeysContent("");
        setNotes("");
        await fetchInventory();
      } else {
        showToast(data.error || "Failed to import keys", "error");
      }
    } catch {
      showToast("Network error during inventory import", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📥</span>
          <span>Bulk Inventory Management & Provisioning</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Monitor real-time digital stock levels and import credentials in bulk (lines or CSV).
        </p>
      </div>

      {/* Stock Status Table */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Current Stock Breakdown
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading stock data...</div>
        ) : stockList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No digital products with instant key provisioning found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Available Stock</th>
                  <th className="pb-3 font-semibold">Sold Keys</th>
                  <th className="pb-3 font-semibold">Reserved</th>
                  <th className="pb-3 font-semibold">Total Keys</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockList.map((item) => {
                  const isLow = item.available <= 2;
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                          <Image
                            src={item.coverImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold text-white">{item.title}</span>
                      </td>
                      <td className="py-3 font-mono font-bold text-emerald-400">
                        {item.available} available
                      </td>
                      <td className="py-3 font-mono text-slate-400">{item.sold} sold</td>
                      <td className="py-3 font-mono text-slate-400">{item.reserved}</td>
                      <td className="py-3 font-mono font-bold text-white">{item.total}</td>
                      <td className="py-3 text-right">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Key Import Tool */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-indigo-500/30 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
            ⚡
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Bulk Key & Credentials Import Engine
            </h3>
            <p className="text-xs text-slate-400">
              Paste keys line-by-line (e.g. email:password or Steam keys). Each line creates 1 available inventory item.
            </p>
          </div>
        </div>

        <form onSubmit={handleBulkImport} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Target Product <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                {stockList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.available} currently available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Redeem on Steam client or login with mail access"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Keys / Credentials List (1 per line) <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={6}
              required
              value={keysContent}
              onChange={(e) => setKeysContent(e.target.value)}
              placeholder={`STEAM-DIAMOND-KEY-9941-XYZ\nSTEAM-DIAMOND-KEY-9942-ABC\nuser_vip@gmail.com:StrongPassword2026`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:border-indigo-500 focus:outline-none resize-y"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {keysContent.split(/\r?\n/).filter((l) => l.trim().length > 0).length} valid keys detected in buffer
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={importing || !keysContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {importing ? "Importing Keys..." : "Upload Keys to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
