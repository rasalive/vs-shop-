"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function AdminTicketsPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Staff response & notes
  const [staffReply, setStaffReply] = useState("");
  const [staffNotes, setStaffNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
        if (selectedTicket) {
          const fresh = data.tickets.find((t: any) => t.id === selectedTicket.id);
          if (fresh) {
            setSelectedTicket(fresh);
            setStaffNotes(fresh.staffNotes || "");
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const selectTicket = (t: any) => {
    setSelectedTicket(t);
    setStaffNotes(t.staffNotes || "");
    setStaffReply("");
  };

  const handleUpdate = async (status?: string) => {
    if (!selectedTicket) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: status || selectedTicket.status,
          staffNotes,
          replyMessage: staffReply.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Ticket updated successfully!", "success");
        setStaffReply("");
        await fetchTickets();
      } else {
        showToast(data.error || "Failed to update ticket", "error");
      }
    } catch {
      showToast("Error updating ticket", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎫</span>
          <span>Support Desk Queue</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Respond to customer queries, resolve replacement requests, and add internal staff notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Incoming Queue ({tickets.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading tickets...</div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              const isUnanswered = t.status === "OPEN" || t.status === "CUSTOMER_REPLY";

              return (
                <button
                  key={t.id}
                  onClick={() => selectTicket(t)}
                  className={`w-full text-left p-4 rounded-2xl border transition space-y-2 ${
                    isSelected
                      ? "bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/20"
                      : "bg-[#0e1324] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      #{t.ticketNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isUnanswered && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === "ANSWERED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : isUnanswered
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{t.subject}</h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{t.user?.name || "Customer"}</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Ticket Thread & Actions */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      #{selectedTicket.ticketNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      Customer: {selectedTicket.user?.name} ({selectedTicket.user?.email})
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdate("RESOLVED")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                  >
                    ✓ Resolve
                  </button>
                  <button
                    onClick={() => handleUpdate("CLOSED")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Messages stream */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedTicket.messages?.map((msg: any) => {
                  const isStaff = msg.isStaff;
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        isStaff
                          ? "bg-indigo-950/40 border-indigo-500/30 ml-4"
                          : "bg-slate-900/80 border-slate-800 mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${
                            isStaff ? "text-indigo-300" : "text-white"
                          }`}
                        >
                          {isStaff ? "🎧 Staff Response" : selectedTicket.user?.name || "Customer"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Internal Staff Notes (Private) */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wider">
                  🔒 Internal Staff Note (Customer cannot see this)
                </span>
                <input
                  type="text"
                  placeholder="e.g. Verified order payment on Stripe - replacement issued"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-white placeholder-slate-500 text-xs focus:outline-none"
                />
              </div>

              {/* Staff Reply Box */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <textarea
                  rows={3}
                  placeholder="Send staff response to customer..."
                  value={staffReply}
                  onChange={(e) => setStaffReply(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleUpdate("ANSWERED")}
                    disabled={updating}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition"
                  >
                    {updating ? "Submitting..." : "Send Staff Reply"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#0e1324] border border-slate-800 text-center text-xs text-slate-400">
              Select a ticket from the queue to view and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
