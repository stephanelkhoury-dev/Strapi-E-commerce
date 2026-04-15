"use client";

import { useState, FormEvent } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", honeypot: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Honeypot check — bots fill this hidden field
    if (form.honeypot) return;

    setLoading(true);
    setError("");

    try {
      // In production, send to a backend API or email service
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
    } catch {
      setError("Could not send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center p-8 rounded-xl border border-border bg-white dark:bg-gray-900">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" aria-hidden="true" />
        <h3 className="text-lg font-bold mb-2">Message Sent!</h3>
        <p className="text-muted">Thank you for reaching out. We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border border-border bg-white dark:bg-gray-900">
      <h2 className="text-xl font-bold">Send a Message</h2>

      {/* Honeypot — hidden from real users, catches bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="hp-field">Leave empty</label>
        <input
          id="hp-field"
          type="text"
          value={form.honeypot}
          onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium mb-1">Name</label>
        <input
          id="contact-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5"
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium mb-1">Email</label>
        <input
          id="contact-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium mb-1">Subject</label>
        <input
          id="contact-subject"
          type="text"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium mb-1">Message</label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full rounded-lg border border-border px-4 py-2.5 resize-y"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        Send Message
      </button>
    </form>
  );
}
