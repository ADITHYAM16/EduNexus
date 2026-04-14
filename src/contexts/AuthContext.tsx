import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "ROLE_HOD" | "ROLE_ASST_PROF" | "ROLE_STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  subject?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = "portal_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from("staff")
      .select("id, name, email, role, department, subject, password_hash")
      .eq("email", trimmedEmail)
      .single();

    if (error || !data) return { success: false, error: "No account found with this email." };
    if (data.password_hash !== password) return { success: false, error: "Incorrect password. Please try again." };

    const userData: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      department: data.department,
      subject: data.subject,
    };
    setUser(userData);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, error: "Full name is required." };
    if (password.length < 6) return { success: false, error: "Password must be at least 6 characters." };

    // Check if email already exists
    const { data: existing } = await supabase
      .from("staff")
      .select("id")
      .eq("email", trimmedEmail)
      .single();

    if (existing) return { success: false, error: "An account with this email already exists." };

    const { error } = await supabase.from("staff").insert({
      name: trimmedName,
      email: trimmedEmail,
      password_hash: password,
      role: "ROLE_STAFF",
      department: "Computer Science",
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (newPassword.length < 6) return { success: false, error: "Password must be at least 6 characters." };

    const { error } = await supabase
      .from("staff")
      .update({ password_hash: newPassword })
      .eq("email", trimmedEmail);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, resetPassword, isAuthenticated: !!user, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
