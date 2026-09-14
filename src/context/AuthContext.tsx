"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/lib/types";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<AuthResult>;
  fastLogin: (phone: string, name?: string, email?: string) => Promise<AuthResult>;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchDemoUser: (role: "ADMIN" | "CUSTOMER" | "SUPPORT") => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password?: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "Vortex123!" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid login credentials." };
    } catch {
      return { success: false, error: "Network connection error. Please try again." };
    }
  };

  const fastLogin = async (phone: string, name?: string, email?: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/fast-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Fast login failed." };
    } catch {
      return { success: false, error: "Network error during fast login." };
    }
  };

  const register = async (name: string, email: string, password?: string, phone?: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || "Vortex123!", phone }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed." };
    } catch {
      return { success: false, error: "Network error during registration." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    }
  };

  const switchDemoUser = async (role: "ADMIN" | "CUSTOMER" | "SUPPORT"): Promise<AuthResult> => {
    let email = "customer@vortex.io";
    let pass = "VortexCustomer2026!";
    if (role === "ADMIN") {
      email = "admin@vortex.io";
      pass = "VortexAdmin2026!";
    }
    if (role === "SUPPORT") {
      email = "support@vortex.io";
      pass = "VortexAdmin2026!";
    }

    return await login(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        fastLogin,
        register,
        logout,
        refreshUser,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
