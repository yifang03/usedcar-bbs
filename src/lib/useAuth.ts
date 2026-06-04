"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: number;
  email: string;
  nickname: string;
  avatar: string | null;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.ok) {
        setUser(json.data);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.ok) {
      if (typeof window !== "undefined") localStorage.setItem("token", json.data.token);
      setUser(json.data.user);
    }
    return json;
  };

  const register = async (email: string, password: string, nickname: string, verificationCode: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, nickname, verificationCode }),
    });
    const json = await res.json();
    if (json.ok) {
      if (typeof window !== "undefined") localStorage.setItem("token", json.data.token);
      setUser(json.data.user);
    }
    return json;
  };

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    setUser(null);
  };

  return { user, loading, login, register, logout, fetchUser };
}
