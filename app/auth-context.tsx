"use client";

import { createContext, useContext, useState } from "react";

type Role = "admin" | "viewer" | null;

type AuthContextType = {
  role: Role;
  adminKey: string | null;
  setAdmin: (key: string) => void;
  setViewer: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [adminKey, setAdminKey] = useState<string | null>(null);

  const setAdmin = (key: string) => {
    setRole("admin");
    setAdminKey(key);
  };

  const setViewer = () => {
    setRole("viewer");
    setAdminKey(null);
  };

  const logout = () => {
    setRole(null);
    setAdminKey(null);
  };

  return (
    <AuthContext.Provider value={{ role, adminKey, setAdmin, setViewer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
