"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { login, fastLogin, switchDemoUser } = useAuth();
  const { showToast } = useToast();

  // Active tab: 'email' | 'whatsapp'
  const [activeTab, setActiveTab] = useState<"email" | "whatsapp">("email");

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // WhatsApp form state
  const [phone, setPhone] = useState("+91 ");
  const [customerName, setCustomerName] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isWaLoading, setIsWaLoading] = useState(false);

  // Social loading state
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("vortex_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSuccessfulAuth = (userEmail: string, role?: string) => {
    if (rememberMe && userEmail) {
      try {
        localStorage.setItem("vortex_remembered_email", userEmail);
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem("vortex_remembered_email");
      } catch {
        // ignore
      }
    }

    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (role === "ADMIN" || userEmail.toLowerCase().includes("admin")) {
      router.push("/admin/orders");
    } else {
      router.push("/dashboard");
    }
  };

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      return "Please enter your email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return "Please enter a valid email address (e.g. alex@example.com).";
    }
    return "";
  };

  // Handle standard email + password login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emErr = validateEmail(email);
    if (emErr) {
      setEmailError(emErr);
      return;
    }
    setEmailError("");

    if (!password) {
      setPasswordError("Please enter your password.");
      return;
    }
    setPasswordError("");

    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        showToast("Signed in successfully! Welcome back.", "success");
        handleSuccessfulAuth(email.trim());
      } else {
        showToast(result.error || "Invalid credentials. Please check and try again.", "error");
      }
    } catch {
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle WhatsApp 1-Click Fast Login
  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      setPhoneError("Please enter a valid phone number with country code (e.g. +91 9876543210).");
      return;
    }
    setPhoneError("");
    setIsWaLoading(true);

    try {
      const result = await fastLogin(cleanPhone, customerName.trim() || undefined);
      if (result.success) {
        showToast("Fast Login successful! Welcome to Vortex.", "success");
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push("/dashboard");
        }
      } else {
        showToast(result.error || "Failed to log in with WhatsApp.", "error");
      }
    } catch {
      showToast("An error occurred during WhatsApp login.", "error");
    } finally {
      setIsWaLoading(false);
    }
  };

  // Handle simulated Social OAuth
  const handleOAuth = async (provider: "Google" | "Apple" | "GitHub") => {
    setOauthLoading(provider);
    showToast(`Connecting to ${provider}...`, "info");

    try {
      const emailDomain =
        provider === "Apple"
          ? "icloud.com"
          : provider === "Google"
          ? "gmail.com"
          : "github.com";
      const oauthEmail = `${provider.toLowerCase()}.user@${emailDomain}`;
      const result = await login(oauthEmail);

      if (result.success) {
        showToast(`Signed in with ${provider} successfully!`, "success");
        handleSuccessfulAuth(oauthEmail);
      } else {
        showToast(result.error || `Failed to authenticate with ${provider}.`, "error");
      }
    } catch {
      showToast(`Failed to connect with ${provider}.`, "error");
    } finally {
      setOauthLoading(null);
    }
  };

  // Handle 1-click Demo switch
  const handleDemoLogin = async (role: "ADMIN" | "CUSTOMER" | "SUPPORT") => {
    setIsLoading(true);
    showToast(`Logging in as ${role} demo user...`, "info");
    try {
      const result = await switchDemoUser(role);
      if (result.success) {
        showToast(`Logged in as ${role}!`, "success");
        if (role === "ADMIN" || role === "SUPPORT") {
          router.push("/admin/orders");
        } else {
          router.push("/dashboard");
        }
      } else {
        showToast(result.error || "Demo login failed.", "error");
      }
    } catch {
      showToast("Failed to switch demo account.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick autofill demo credentials into form
  const fillDemoCredentials = (role: "ADMIN" | "CUSTOMER" | "SUPPORT") => {
    setActiveTab("email");
    if (role === "ADMIN") {
      setEmail("admin@vortex.io");
      setPassword("VortexAdmin2026!");
    } else if (role === "SUPPORT") {
      setEmail("support@vortex.io");
      setPassword("VortexAdmin2026!");
    } else {
      setEmail("customer@vortex.io");
      setPassword("VortexCustomer2026!");
    }
    setEmailError("");
    setPasswordError("");
    showToast(`Autofilled ${role} credentials into form. Click 'Sign in'!`, "info");
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-[350px] h-[350px] bg-gradient-to-br from-cyan-600/10 to-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Header Navigation */}
      <div className="w-full max-w-[460px] mb-5 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-full backdrop-blur-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to store</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[460px] bg-[#0e1424]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.1)] p-6 sm:p-9 z-10 transition-all">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 mx-auto mb-2 border border-indigo-400/30">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a9 9 0 0 1 9 9c0 1.25-.26 2.45-.73 3.53M12 3a9 9 0 0 0-7.79 4.5M12 3v9M20.27 15.53A9 9 0 0 1 12 21c-1.3 0-2.53-.28-3.64-.78M20.27 15.53l-7.79-3.53M8.36 20.22A9 9 0 0 1 3 12c0-1.6.42-3.1 1.21-4.5M8.36 20.22 12 12" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-white font-sans">
            Welcome Back to Vortex
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
            Access your digital game keys, instant downloads, wallet balance & orders
          </p>
        </div>

        {/* Tab Switcher: Email vs WhatsApp Fast Login */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "email"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Email & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "whatsapp"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.073-1.127-.065-.268-.087-.618-.205-1.066-.401-1.9-.83-3.13-2.766-3.225-2.893-.095-.127-.775-1.03-.775-1.964 0-.934.488-1.392.663-1.583.174-.19.38-.238.507-.238.127 0 .254.002.365.007.118.005.278-.045.435.334.163.397.556 1.357.604 1.455.048.098.08.213.016.339-.064.128-.096.208-.19.318-.096.11-.202.247-.288.332-.096.095-.197.198-.085.39.112.19.497.82 1.066 1.328.735.656 1.354.859 1.545.955.191.096.302.08.414-.048.111-.127.476-.556.603-.746.127-.19.254-.159.428-.095.174.064 1.11.524 1.3.619.19.096.317.143.365.223.048.079.048.46-.096.865z" />
            </svg>
            <span>WhatsApp Fast Login</span>
          </button>
        </div>

        {/* TAB 1: Email + Password Form */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="alex@example.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border ${
                    emailError
                      ? "border-red-500 focus:border-red-400 focus:ring-red-500/20"
                      : "border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20"
                  } text-white placeholder:text-slate-500 text-sm transition outline-none focus:ring-2`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border ${
                    passwordError
                      ? "border-red-500 focus:border-red-400 focus:ring-red-500/20"
                      : "border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/20"
                  } text-white placeholder:text-slate-500 text-sm transition outline-none focus:ring-2`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <span>Remember my email</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 text-white text-sm font-bold transition-all duration-150 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: WhatsApp Fast Login Form */}
        {activeTab === "whatsapp" && (
          <form onSubmit={handleWhatsAppSubmit} noValidate className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span>
                <strong>1-Click Instant Login:</strong> No password needed! Log in with your phone to track orders & delivery.
              </span>
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                htmlFor="phone-input"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                WhatsApp Phone Number <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 font-bold text-xs">
                  💬
                </div>
                <input
                  id="phone-input"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border ${
                    phoneError
                      ? "border-red-500 focus:border-red-400 focus:ring-red-500/20"
                      : "border-slate-700/80 focus:border-emerald-500 focus:ring-emerald-500/20"
                  } text-white placeholder:text-slate-500 text-sm font-mono transition outline-none focus:ring-2`}
                />
              </div>
              {phoneError && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            {/* Customer Name Field */}
            <div>
              <label
                htmlFor="name-input"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Your Name <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                id="name-input"
                name="name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-emerald-500/20 text-white placeholder:text-slate-500 text-sm transition outline-none focus:ring-2"
              />
            </div>

            {/* WhatsApp Submit Button */}
            <button
              type="submit"
              disabled={isWaLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white text-sm font-bold transition-all duration-150 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isWaLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Verifying WhatsApp Login...</span>
                </>
              ) : (
                <>
                  <span>Instant WhatsApp Sign In</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative bg-[#0e1424] px-3 text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
            OR CONTINUE WITH
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleOAuth("Google")}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition duration-150 cursor-pointer disabled:opacity-50 gap-2"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.41 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="hidden sm:inline">Google</span>
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => handleOAuth("GitHub")}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition duration-150 cursor-pointer disabled:opacity-50 gap-2"
          >
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleOAuth("Apple")}
            disabled={oauthLoading !== null}
            className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition duration-150 cursor-pointer disabled:opacity-50 gap-2"
          >
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.67-.82 1.12-1.96.99-3.11-1 .04-2.17.67-2.86 1.49-.6.7-1.13 1.83-.99 2.95 1.12.09 2.21-.57 2.86-1.33z" />
            </svg>
            <span className="hidden sm:inline">Apple</span>
          </button>
        </div>

        {/* Sign up navigation */}
        <div className="text-center text-xs text-slate-400 mt-6 pt-5 border-t border-slate-800/80">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition"
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* Quick 1-Click Demo Accounts Bar */}
      <div className="w-full max-w-[460px] mt-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🚀</span> Instant Demo Logins
          </span>
          <span className="text-[10px] text-slate-500">1-Click instant access</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin("ADMIN")}
            disabled={isLoading}
            className="py-1.5 px-2 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 text-[11px] font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
          >
            <span>👑 Admin</span>
            <span className="text-[9px] text-indigo-400/80 font-normal">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("CUSTOMER")}
            disabled={isLoading}
            className="py-1.5 px-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 text-[11px] font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
          >
            <span>🎮 Customer</span>
            <span className="text-[9px] text-purple-400/80 font-normal">Keys & Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("SUPPORT")}
            disabled={isLoading}
            className="py-1.5 px-2 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 text-[11px] font-bold transition cursor-pointer flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
          >
            <span>🎧 Support</span>
            <span className="text-[9px] text-cyan-400/80 font-normal">Ticket Desk</span>
          </button>
        </div>

        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => fillDemoCredentials("CUSTOMER")}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition underline cursor-pointer"
          >
            Or click here to autofill test credentials into the form
          </button>
        </div>
      </div>

      {/* Terms & Privacy */}
      <p className="mt-5 text-center text-[11px] text-slate-500 max-w-sm mx-auto z-10">
        By continuing, you agree to Vortex&apos;s{" "}
        <Link href="/terms" className="text-slate-400 hover:text-white underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-slate-400 hover:text-white underline">
          Privacy Policy
        </Link>
        .
      </p>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0e1424] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl">
              🔑
            </div>
            <h3 className="text-lg font-bold text-white">Reset Your Password</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For instant security without waiting for an email, you can:
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <span>Use the <strong>WhatsApp Fast Login</strong> tab to sign in immediately using your WhatsApp number.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Or message our 24/7 automated support WhatsApp (+91 9876543210) for instant OTP recovery.</span>
              </li>
            </ul>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setActiveTab("whatsapp");
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Use WhatsApp Login
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white text-sm">
          <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mr-3" />
          <span>Loading Vortex Sign In...</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
