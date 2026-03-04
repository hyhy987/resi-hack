"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserData } from "@/types";

interface AuthContextType {
  currentUser: UserData | null;
  allUsers: UserData[];
  switchUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  allUsers: [],
  switchUser: async () => {},
  refreshUser: async () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuth = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setCurrentUser(data.currentUser);
    setAllUsers(data.allUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAuth();
  }, [fetchAuth]);

  const switchUser = async (userId: string) => {
    await fetch("/api/auth/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    await fetchAuth();
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, allUsers, switchUser, refreshUser: fetchAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
