"use client";

import React, { useState } from "react";
import { useToast } from "@/context-and-provider";

export default function AdminContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      showToast("Message sent successfully", "success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Contact form submit error", err);
      showToast("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden rounded-3xl">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-linear-to-br from-cyan-100 via-sky-50 to-white px-8 py-10">
            <h2 className="text-3xl font-bold text-slate-950">Get in touch</h2>
            <p className="mt-4 max-w-md text-slate-600">
              Questions about workspace setup, monitoring policy, reporting, or admin operations? The Tickr team is here to help.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Email</h3>
                <p className="mt-1 text-sm text-slate-900">support@tickrapp.com</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Phone</h3>
                <p className="mt-1 text-sm text-slate-900">+977 (000) 000-0000</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Support Hours</h3>
                <p className="mt-1 text-sm text-slate-900">Mon-Fri, 10:00 AM-6:00 PM (NPT)</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-10">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Your name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="admin-input mt-2" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input mt-2" placeholder="Your email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="admin-input mt-2" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="admin-textarea mt-2 min-h-32" placeholder="Type your message..." />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button type="submit" disabled={isSending} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300">
                  {isSending ? "Sending..." : "Send message"}
                </button>
                <div className="text-sm text-slate-500">
                  Or email us directly at{" "}
                  <a href="mailto:support@tickrapp.com" className="text-cyan-700 hover:text-cyan-800">
                    support@tickrapp.com
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
