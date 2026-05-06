import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface StudentInfo {
  name: string;
  rollNo: string;
  department: string;
  section: string;
  year: string;
  email: string;
}

export interface TestResult {
  subject: string;
  subjectKey: string;
  score: number;
  total: number;
  date: string;
  studentName: string;
  rollNo: string;
  department: string;
  section: string;
  year: string;
}

export interface Remark {
  date: string;
  note: string;
  subject: string;
  studentName: string;
  rollNo: string;
}

interface StudentContextType {
  student: StudentInfo | null;
  setStudent: (s: StudentInfo) => void;
  results: TestResult[];
  saveResult: (r: TestResult) => Promise<void>;
  remarks: Remark[];
  saveRemark: (r: Remark) => Promise<void>;
  logout: () => void;
}

const StudentContext = createContext<StudentContextType | null>(null);
const STUDENT_KEY = "student_session";
const LOCAL_RESULTS_KEY = "local_test_results";
const LOCAL_REMARKS_KEY = "local_remarks";

// Save to localStorage as backup
const saveLocalResult = (r: TestResult) => {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_RESULTS_KEY) || "[]");
    existing.push(r);
    localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(existing));
  } catch {}
};

const saveLocalRemark = (r: Remark) => {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_REMARKS_KEY) || "[]");
    existing.push(r);
    localStorage.setItem(LOCAL_REMARKS_KEY, JSON.stringify(existing));
  } catch {}
};

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudentState] = useState<StudentInfo | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(STUDENT_KEY) || "null"); } catch { return null; }
  });

  const [results, setResults] = useState<TestResult[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_RESULTS_KEY) || "[]"); } catch { return []; }
  });

  const [remarks, setRemarks] = useState<Remark[]>(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_REMARKS_KEY) || "[]"); } catch { return []; }
  });

  const setStudent = useCallback((s: StudentInfo) => {
    setStudentState(s);
    sessionStorage.setItem(STUDENT_KEY, JSON.stringify(s));
  }, []);

  const saveResult = useCallback(async (r: TestResult) => {
    // 1. Try to save to Supabase first
    const { error } = await supabase.from("student_test_results").insert({
      student_name: r.studentName,
      roll_no: r.rollNo,
      department: r.department,
      section: r.section,
      year: r.year,
      subject: r.subject,
      subject_key: r.subjectKey,
      score: r.score,
      total: r.total,
      date: r.date,
    });

    if (error) {
      console.error("Supabase save error:", error.message, error.code);
      // If table doesn't exist, save locally and throw
      if (error.code === "PGRST204" || error.message.includes("schema cache") || error.message.includes("does not exist")) {
        setResults(prev => [...prev, r]);
        saveLocalResult(r);
        throw new Error("DATABASE_NOT_SETUP");
      }
      // For other errors, still save locally as backup
      setResults(prev => [...prev, r]);
      saveLocalResult(r);
      throw new Error(error.message);
    }
    
    // 2. Success - update local state (don't save to localStorage since it's in Supabase)
    setResults(prev => [...prev, r]);
  }, []);

  const saveRemark = useCallback(async (r: Remark) => {
    setRemarks(prev => [...prev, r]);
    saveLocalRemark(r);

    const { error } = await supabase.from("student_remarks").insert({
      student_name: r.studentName,
      roll_no: r.rollNo,
      subject: r.subject,
      note: r.note,
      date: r.date,
    });

    if (error) {
      console.error("Supabase remark error:", error.message);
      // Don't throw for remarks — never block the student
    }
  }, []);

  const logout = useCallback(() => {
    setStudentState(null);
    sessionStorage.removeItem(STUDENT_KEY);
  }, []);

  return (
    <StudentContext.Provider value={{ student, setStudent, results, saveResult, remarks, saveRemark, logout }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be used within StudentProvider");
  return ctx;
};
