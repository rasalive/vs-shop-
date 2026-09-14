"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadWallet() {
      try {
        const res = await fetch("/api/user/wallet");
        const data = await res.json();
        if (res.ok) {
          setBalance(data.balance);
          setTransactions(data.transactions || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadWallet();
  }, []);

  const handleDeposit = async (amount: number) => {
    if (amount <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: "Direct Top-Up" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBalance(data.balance);
        await refreshUser();
        showToast(data.message, "success");
        // Reload transactions
        const walletRes = await fetch("/api/user/wallet");
        const walletData = await walletRes.json();
        setTransactions(walletData.transactions || []);
      } else {
        showToast(data.error || "Failed to add funds", "error");
      }
    } catch {
      showToast("Network error during top-up", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-[#0e1324] to-purple-950/40 border border-indigo-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-1">
            Vortex Stored Wallet Balance
          </span>
          <div className="text-4xl sm:text-5xl font-black font-mono text-white">
            ${balance.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Use your wallet balance for instant 1-click zero-fee checkout on any digital key.
          </p>
        </div>

        {/* Quick Top-Up Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Instant Balance Top-Up:
          </span>
          <div className="flex flex-wrap gap-2">
            {[10, 25, 50, 100].map((amt) => (
              <button
                key={amt}
                disabled={loading}
                onClick={() => handleDeposit(amt)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 hover:bg-indigo-600/20 text-xs font-bold font-mono text-white transition active:scale-95 disabled:opacity-50"
              >
                +${amt}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex gap-2 pt-2">
            <input
              type="number"
              min="1"
              placeholder="Custom $"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:border-indigo-500 focus:outline-none"
            />
            <button
              disabled={loading || !customAmount}
              onClick={() => {
                const amt = parseFloat(customAmount);
                if (amt > 0) handleDeposit(amt);
                setCustomAmount("");
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              Add Funds
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Transaction Activity Ledger
        </h3>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        isPositive
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {isPositive ? "+" : "−"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{tx.description || tx.type}</h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold text-sm ${
                      isPositive ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    ${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
