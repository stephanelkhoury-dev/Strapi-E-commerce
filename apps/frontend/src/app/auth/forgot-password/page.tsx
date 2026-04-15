"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error.message || "Could not process request.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-muted mb-6">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent password reset instructions.
        </p>
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
      <p className="text-center text-muted mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2.5"
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          Send Reset Link
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
