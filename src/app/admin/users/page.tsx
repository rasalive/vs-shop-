"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Wallet adjustment modal
  const [adjustModalUser, setAdjustModalUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleModeration = async (userId: string, action: string, extra?: any) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...extra }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Action completed successfully!", "success");
        await fetchUsers();
      } else {
        showToast(data.error || "Action failed", "error");
      }
    } catch {
      showToast("Error during user moderation", "error");
    }
  };

  const handleAdjustWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser || !adjustAmount) return;

    await handleModeration(adjustModalUser.id, "ADJUST_WALLET", {
      walletAdjustment: adjustAmount,
    });

    setAdjustModalUser(null);
    setAdjustAmount("");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👥</span>
            <span>User Management & Moderation Desk</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Oversee customers, enforce security (Ban/Suspend/Mute), and manage wallet balances.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search email, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Wallet</th>
                  <th className="pb-3 font-semibold">Orders</th>
                  <th className="pb-3 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isBanned = u.status === "BANNED";
                  const isSuspended = u.status === "SUSPENDED";

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 text-slate-300">
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                        {u.phone && (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            WA: {u.phone}
                          </span>
                        )}
                      </td>

                      <td className="py-3">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleModeration(u.id, "CHANGE_ROLE", { role: e.target.value })
                          }
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-indigo-300 focus:outline-none"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="SUPPORT">SUPPORT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : u.status === "BANNED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3 font-mono font-bold text-white">
                        ${u.walletBalance.toFixed(2)}
                      </td>

                      <td className="py-3 text-slate-400 font-mono">
                        {u._count.orders} orders
                      </td>

                      <td className="py-3 text-right space-x-1">
                        {/* Adjust Wallet */}
                        <button
                          onClick={() => setAdjustModalUser(u)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition"
                          title="Adjust balance"
                        >
                          💰 Adjust
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => handleModeration(u.id, "RESET_PASSWORD")}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition"
                          title="Reset to default password"
                        >
                          🔑 Reset
                        </button>

                        {/* Ban / Unban */}
                        {isBanned ? (
                          <button
                            onClick={() => handleModeration(u.id, "UNBAN")}
                            className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white text-[10px] font-bold transition border border-emerald-500/30"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleModeration(u.id, "BAN")}
                            className="px-2 py-1 rounded bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-[10px] font-bold transition border border-rose-500/30"
                          >
                            Ban
                          </button>
                        )}

                        {/* Suspend Toggle */}
                        {!isBanned && (
                          <button
                            onClick={() =>
                              handleModeration(u.id, isSuspended ? "ACTIVATE" : "SUSPEND")
                            }
                            className="px-2 py-1 rounded bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white text-[10px] font-bold transition border border-amber-500/30"
                          >
                            {isSuspended ? "Resume" : "Suspend"}
                          </button>
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

      {/* Adjust Wallet Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0e1324] border border-slate-700 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">
              Adjust Wallet for {adjustModalUser.name}
            </h3>
            <p className="text-xs text-slate-400">
              Current balance: ${adjustModalUser.walletBalance.toFixed(2)}
            </p>

            <form onSubmit={handleAdjustWalletSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Adjustment Amount (Use negative for deduction, e.g. -10)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 25.00 or -15.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
