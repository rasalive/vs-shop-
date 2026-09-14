"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export default function TicketsPage() {
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New ticket form
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("GENERAL");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  // Reply form
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/user/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicketDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/user/tickets/${id}`);
      const data = await res.json();
      if (res.ok && data.ticket) {
        setSelectedTicket(data.ticket);
      }
    } catch {
      showToast("Failed to load ticket conversation", "error");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/user/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, department, priority, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Support ticket opened successfully!", "success");
        setIsModalOpen(false);
        setSubject("");
        setMessage("");
        await fetchTickets();
        if (data.ticket) {
          openTicketDetail(data.ticket.id);
        }
      } else {
        showToast(data.error || "Failed to create ticket", "error");
      }
    } catch {
      showToast("Error creating ticket", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setReplying(true);
    try {
      const res = await fetch(`/api/user/tickets/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReplyText("");
        await openTicketDetail(selectedTicket.id);
        await fetchTickets();
        showToast("Reply sent to support desk", "success");
      } else {
        showToast(data.error || "Failed to post reply", "error");
      }
    } catch {
      showToast("Error posting reply", "error");
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎫</span>
            <span>Support Ticket Desk</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            24/7 dedicated assistance for replacements, queries, and order help.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          <span>+</span>
          <span>Open New Support Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Your Active Tickets ({tickets.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#0e1324] border border-slate-800 text-center text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300">No Support Tickets</p>
              <p>Everything running smoothly! Need help? Open a new ticket anytime.</p>
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => openTicketDetail(t.id)}
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === "ANSWERED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : t.status === "OPEN"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{t.subject}</h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{t.department}</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Ticket Conversation Thread */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="p-6 rounded-3xl bg-[#0e1324] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      #{selectedTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedTicket.department}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedTicket.status === "ANSWERED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  }`}
                >
                  {selectedTicket.status}
                </span>
              </div>

              {/* Messages stream */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
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
                            isStaff ? "text-indigo-300" : "text-slate-300"
                          }`}
                        >
                          {isStaff ? "🎧 Vortex Support Staff" : msg.user?.name || "You"}
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

              {/* Reply box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 space-y-2">
                <textarea
                  rows={3}
                  required
                  placeholder="Type your reply to our support team..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition"
                  >
                    {replying ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#0e1324] border border-slate-800 text-center text-xs text-slate-400">
              Select a ticket from the left to view the support conversation.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1324] border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue with Steam Key Activation"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="GENERAL">General Inquiry</option>
                    <option value="ORDER_ISSUE">Order / Key Issue</option>
                    <option value="REPLACEMENT">Warranty Replacement</option>
                    <option value="BILLING">Billing & Payments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Explain Your Issue
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide all details, order numbers, or error messages..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {creating ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
