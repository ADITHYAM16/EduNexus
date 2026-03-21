import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "ROLE_HOD" | "ROLE_ASST_PROF" | "ROLE_STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "portal_registered_users";
const SESSION_KEY = "portal_user";
const HOD_EMAIL = "hod@mahendra.info";

const getStoredUsers = (): Record<string, StoredUser> => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStoredUsers = (users: Record<string, StoredUser>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const signup = useCallback((name: string, email: string, password: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName) return { success: false, error: "Full name is required." };
    if (!trimmedEmail.endsWith("@mahendra.info")) {
      return { success: false, error: "Only @mahendra.info email addresses are allowed." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const users = getStoredUsers();
    if (users[trimmedEmail]) {
      return { success: false, error: "An account with this email already exists." };
    }

    const isHod = trimmedEmail === HOD_EMAIL;
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: isHod ? "ROLE_HOD" : "ROLE_STAFF",
      department: "Artificial Intelligence & Data Science",
      password,
    };

    users[trimmedEmail] = newUser;
    saveStoredUsers(users);
    return { success: true };
  }, []);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.endsWith("@mahendra.info")) {
      return { success: false, error: "Only @mahendra.info email addresses are allowed." };
    }

    const users = getStoredUsers();
    const found = users[trimmedEmail];

    if (!found) {
      return { success: false, error: "No account found. Please sign up first." };
    }
    if (found.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const { password: _, ...userData } = found;
    setUser(userData);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
