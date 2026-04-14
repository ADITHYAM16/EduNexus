import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  subject: string;
  password_hash?: string;
}

interface StaffContextType {
  staffList: StaffMember[];
  loading: boolean;
  fetchStaff: () => Promise<void>;
  addStaff: (staff: Omit<StaffMember, "id">) => Promise<{ success: boolean; error?: string }>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<{ success: boolean; error?: string }>;
  deleteStaff: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const StaffContext = createContext<StaffContextType | null>(null);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("staff")
      .select("id, name, email, role, department, subject")
      .order("name");
    setStaffList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const addStaff = useCallback(async (staff: Omit<StaffMember, "id">) => {
    const { error } = await supabase.from("staff").insert(staff);
    if (error) return { success: false, error: error.message };
    await fetchStaff();
    return { success: true };
  }, [fetchStaff]);

  const updateStaff = useCallback(async (id: string, updates: Partial<StaffMember>) => {
    const { error } = await supabase.from("staff").update(updates).eq("id", id);
    if (error) return { success: false, error: error.message };
    await fetchStaff();
    return { success: true };
  }, [fetchStaff]);

  const deleteStaff = useCallback(async (id: string) => {
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    await fetchStaff();
    return { success: true };
  }, [fetchStaff]);

  return (
    <StaffContext.Provider value={{ staffList, loading, fetchStaff, addStaff, updateStaff, deleteStaff }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
};
