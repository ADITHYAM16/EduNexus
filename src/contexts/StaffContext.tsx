import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockStaffList } from "@/data/mockData";

export type StaffMember = typeof mockStaffList[0];

const USERS_KEY = "portal_registered_users";

function getRegisteredStaff(): StaffMember[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const users: Record<string, { id: string; name: string; email: string; role: string; department: string; password: string }> = JSON.parse(raw);
    return Object.values(users)
      .filter(u => u.role !== "ROLE_HOD")
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        subject: "",
        attendance: 0,
        syllabus: 0,
        tasksCompleted: 0,
        tasksPending: 0,
      }));
  } catch {
    return [];
  }
}

export type StaffMember = typeof mockStaffList[0];

interface StaffContextType {
  staffList: StaffMember[];
  addStaff: (staff: Omit<StaffMember, "tasksCompleted" | "tasksPending" | "syllabus">) => void;
  deleteStaff: (id: string) => void;
}

const StaffContext = createContext<StaffContextType | null>(null);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const registered = getRegisteredStaff();
    return registered.length > 0 ? registered : mockStaffList;
  });

  // Re-sync when localStorage changes (e.g. new signup)
  useEffect(() => {
    const sync = () => {
      const registered = getRegisteredStaff();
      if (registered.length > 0) setStaffList(registered);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const addStaff = useCallback((staff: Omit<StaffMember, "tasksCompleted" | "tasksPending" | "syllabus">) => {
    setStaffList(prev => [...prev, { ...staff, tasksCompleted: 0, tasksPending: 0, syllabus: 0 }]);
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <StaffContext.Provider value={{ staffList, addStaff, deleteStaff }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
};
