"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { ChevronRight, Loader2 } from "lucide-react";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, setAuth, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      setForm({ username: user.username || "", email: user.email || "" });
    }
  }, [user, isAuthenticated, router]);

  async function handleProfileUpdate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${STRAPI_URL}/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: form.username, email: form.email }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error.message || "Update failed.");
      } else {
        setAuth(token!, { ...user!, ...data });
        setMessage("Profile updated successfully.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwMessage("Passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          password: passwordForm.newPassword,
          passwordConfirmation: passwordForm.confirmPassword,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setPwMessage(data.error.message || "Password change failed.");
      } else {
        setPwMessage("Password changed successfully.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setPwMessage("Something went wrong.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Link href="/account" className="hover:text-primary">Account</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span>Profile</span>
      </div>

      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

      {/* Profile form */}
      <form onSubmit={handleProfileUpdate} className="space-y-4 mb-10">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
          <input
            id="username"
            type="text"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5"
          />
        </div>
        {message && (
          <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>{message}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          Save Changes
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={handlePasswordChange} className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5"
            autoComplete="current-password"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">New Password</label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={6}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            required
            minLength={6}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full rounded-lg border border-border px-4 py-2.5"
            autoComplete="new-password"
          />
        </div>
        {pwMessage && (
          <p className={`text-sm ${pwMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>{pwMessage}</p>
        )}
        <button
          type="submit"
          disabled={pwLoading}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {pwLoading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          Change Password
        </button>
      </form>
    </div>
  );
}
