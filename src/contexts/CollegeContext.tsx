import React, { createContext, useContext, useState, useCallback } from "react";
import { Department, AcademicYear, Section, Subject, Student, defaultDepartments } from "@/data/collegeData";

interface CollegeContextType {
  departments: Department[];
  addDepartment: (name: string) => void;
  addSection: (deptId: string, yearId: string, sectionName: string) => void;
  addSubject: (deptId: string, yearId: string, sectionId: string, subject: Omit<Subject, "id">) => void;
  addYear: (deptId: string, yearName: string) => void;
  addStudent: (deptId: string, yearId: string, sectionId: string, student: Omit<Student, "id" | "marks">) => void;
  updateStudentMark: (deptId: string, yearId: string, sectionId: string, studentId: string, subjectId: string, mark: number) => void;
  getStaffAssignments: (staffId: string) => { dept: Department; year: AcademicYear; section: Section; subject: Subject }[];
}

const CollegeContext = createContext<CollegeContextType | null>(null);

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(defaultDepartments);

  const addDepartment = useCallback((name: string) => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name,
      years: ["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y, i) => ({
        id: `year-${Date.now()}-${i}`,
        name: y,
        sections: [],
      })),
    };
    setDepartments(prev => [...prev, newDept]);
  }, []);

  const addSection = useCallback((deptId: string, yearId: string, sectionName: string) => {
    setDepartments(prev => prev.map(d => d.id !== deptId ? d : {
      ...d,
      years: d.years.map(y => y.id !== yearId ? y : {
        ...y,
        sections: [...y.sections, { id: `sec-${Date.now()}`, name: sectionName, subjects: [], students: [] }],
      }),
    }));
  }, []);

  const addSubject = useCallback((deptId: string, yearId: string, sectionId: string, subject: Omit<Subject, "id">) => {
    setDepartments(prev => prev.map(d => d.id !== deptId ? d : {
      ...d,
      years: d.years.map(y => y.id !== yearId ? y : {
        ...y,
        sections: y.sections.map(s => s.id !== sectionId ? s : {
          ...s,
          subjects: [...s.subjects, { ...subject, id: `sub-${Date.now()}` }],
        }),
      }),
    }));
  }, []);

  const addYear = useCallback((deptId: string, yearName: string) => {
    setDepartments(prev => prev.map(d => d.id !== deptId ? d : {
      ...d,
      years: [...d.years, { id: `year-${Date.now()}`, name: yearName, sections: [] }],
    }));
  }, []);

  const addStudent = useCallback((deptId: string, yearId: string, sectionId: string, student: Omit<Student, "id" | "marks">) => {
    setDepartments(prev => prev.map(d => d.id !== deptId ? d : {
      ...d,
      years: d.years.map(y => y.id !== yearId ? y : {
        ...y,
        sections: y.sections.map(sec => sec.id !== sectionId ? sec : {
          ...sec,
          students: [...sec.students, { ...student, id: `stu-${Date.now()}`, marks: {} }],
        }),
      }),
    }));
  }, []);

  const updateStudentMark = useCallback((deptId: string, yearId: string, sectionId: string, studentId: string, subjectId: string, mark: number) => {
    setDepartments(prev => prev.map(d => d.id !== deptId ? d : {
      ...d,
      years: d.years.map(y => y.id !== yearId ? y : {
        ...y,
        sections: y.sections.map(sec => sec.id !== sectionId ? sec : {
          ...sec,
          students: sec.students.map(stu => stu.id !== studentId ? stu : {
            ...stu,
            marks: { ...stu.marks, [subjectId]: mark },
          }),
        }),
      }),
    }));
  }, []);

  const getStaffAssignments = useCallback((staffId: string) => {
    const results: { dept: Department; year: AcademicYear; section: Section; subject: Subject }[] = [];
    departments.forEach(dept => {
      dept.years.forEach(year => {
        year.sections.forEach(section => {
          section.subjects.forEach(subject => {
            if (subject.assignedStaffId === staffId) {
              results.push({ dept, year, section, subject });
            }
          });
        });
      });
    });
    return results;
  }, [departments]);

  return (
    <CollegeContext.Provider value={{ departments, addDepartment, addSection, addSubject, addYear, addStudent, updateStudentMark, getStaffAssignments }}>
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const ctx = useContext(CollegeContext);
  if (!ctx) throw new Error("useCollege must be used within CollegeProvider");
  return ctx;
};
