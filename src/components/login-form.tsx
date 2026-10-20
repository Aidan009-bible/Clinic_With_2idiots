"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");

        const formData = new FormData(event.currentTarget);
        const username = String(formData.get("username") ?? "");
        const password = String(formData.get("password") ?? "");

        startTransition(async () => {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          const result = (await response.json()) as {
            error?: string;
            redirectTo?: string;
          };

          if (!response.ok) {
            setError(result.error ?? "Login failed.");
            return;
          }

          router.push(result.redirectTo ?? "/");
          router.refresh();
        });
      }}
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#0b2a5b]" htmlFor="username">
          Username
        </label>
        <input
          className="w-full rounded-[14px] border border-[#d8e4ec] bg-white px-4 py-3 text-sm text-[#071b33] outline-none transition placeholder:text-[#8ca0b4] focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
          id="username"
          name="username"
          placeholder="Enter username"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#0b2a5b]" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            className="w-full rounded-[14px] border border-[#d8e4ec] bg-white px-4 py-3 pr-14 text-sm text-[#071b33] outline-none transition placeholder:text-[#8ca0b4] focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            required
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-3 my-auto flex h-9 w-9 items-center justify-center rounded-full text-[#61758a] transition hover:bg-[#f7fafc] hover:text-[#071b33] focus:outline-none focus:ring-4 focus:ring-[#e7f0ff]"
            onClick={(event) => {
              event.preventDefault();
              setShowPassword((value) => !value);
            }}
            type="button"
          >
            {showPassword ? (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3l18 18"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M10.58 10.58a2 2 0 102.84 2.84"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M9.88 5.09A10.94 10.94 0 0112 4.91c5 0 8.27 4.2 9.19 5.6a1 1 0 010 1.1 18.6 18.6 0 01-4.33 4.73"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M6.61 6.61A18.68 18.68 0 002.81 10.5a1 1 0 000 1.1c.92 1.4 4.19 5.6 9.19 5.6a10.8 10.8 0 004.1-.78"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.81 12.6a1 1 0 010-1.1C3.73 10.1 7 5.9 12 5.9s8.27 4.2 9.19 5.6a1 1 0 010 1.1c-.92 1.4-4.19 5.6-9.19 5.6s-8.27-4.2-9.19-5.6z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      {error ? (
        <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
      ) : null}
      <button
        className="min-h-11 w-full rounded-xl bg-[#0b2a5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#08234c] focus:outline-none focus:ring-4 focus:ring-[#d8e8ff] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Signing in..." : "Sign in to dashboard"}
      </button>
    </form>
  );
}
