"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !localStorage.getItem("admin_token") &&
      !localStorage.getItem("admin")
    ) {
      router.push("/");
    } else {
      router.push("/dashboard");
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://api.astrokama.com/api/v1/admin/login",
        {
          email,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Save JWT & Admin data
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));

      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow"
      >
        <h2 className="text-2xl font-semibold mb-6">Admin Login</h2>

        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <label className="block mb-3">
          <span className="text-sm">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            type="email"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </label>

        <button
          disabled={loading}
          className="w-full py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
