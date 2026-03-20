import React, { createContext, useContext, useState, useCallback } from "react";
import { mockStaffList } from "@/data/mockData";

export type StaffMember = typeof mockStaffList[0];

interface StaffContextType {
  staffList: StaffMember[];
  addStaff: (staff: Omit<StaffMember, "tasksCompleted" | "tasksPending" | "syllabus">) => void;
  deleteStaff: (id: string) => void;
}

const StaffContext = createContext<StaffContextType | null>(null);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(mockStaffList);

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
