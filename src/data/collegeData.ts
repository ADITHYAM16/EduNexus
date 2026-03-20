// College Management System data models and mock data

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  marks: Record<string, number>; // subjectId -> marks
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  assignedStaffId: string;
  assignedStaffName: string;
}

export interface Section {
  id: string;
  name: string;
  subjects: Subject[];
  students: Student[];
}

export interface AcademicYear {
  id: string;
  name: string;
  sections: Section[];
}

export interface Department {
  id: string;
  name: string;
  years: AcademicYear[];
}

const studentNames = [
  "Aarav Mehta", "Diya Sharma", "Rohan Gupta", "Sneha Patel", "Karthik Iyer",
  "Priya Nair", "Arjun Reddy", "Meera Das", "Varun Singh", "Anjali Kumar",
  "Rahul Joshi", "Kavya Rao", "Siddharth Menon", "Pooja Verma", "Aditya Chauhan",
  "Neha Agarwal", "Vikram Bhat", "Divya Pillai", "Suresh Pandey", "Lakshmi Rajan",
];

function generateStudents(count: number, startIdx: number, subjects: Subject[]): Student[] {
  return Array.from({ length: count }, (_, i) => {
    const marks: Record<string, number> = {};
    subjects.forEach(s => { marks[s.id] = Math.floor(Math.random() * 41) + 60; });
    return {
      id: `stu-${startIdx + i}`,
      name: studentNames[(startIdx + i) % studentNames.length],
      rollNo: `CS${String(startIdx + i + 1).padStart(3, "0")}`,
      email: `student${startIdx + i + 1}@college.edu`,
      marks,
    };
  });
}

const csSubjects: Record<string, { name: string; code: string }[]> = {
  "1st Year": [
    { name: "Programming in C", code: "CS101" },
    { name: "Mathematics I", code: "MA101" },
    { name: "Digital Logic", code: "CS102" },
  ],
  "2nd Year": [
    { name: "Data Structures", code: "CS201" },
    { name: "Operating Systems", code: "CS202" },
    { name: "Database Systems", code: "CS203" },
  ],
  "3rd Year": [
    { name: "Computer Networks", code: "CS301" },
    { name: "Software Engineering", code: "CS302" },
    { name: "Machine Learning", code: "CS303" },
  ],
  "4th Year": [
    { name: "Cloud Computing", code: "CS401" },
    { name: "Cyber Security", code: "CS402" },
    { name: "Project Work", code: "CS403" },
  ],
};

const staffPool = [
  { id: "staff-1", name: "Prof. Anita Sharma" },
  { id: "staff-2", name: "Prof. Vikram Patel" },
  { id: "staff-3", name: "Prof. Meera Iyer" },
  { id: "staff-4", name: "Prof. Arjun Nair" },
  { id: "staff-5", name: "Prof. Priya Das" },
  { id: "staff-6", name: "Prof. Suresh Reddy" },
];

function buildDefaultDepartment(): Department {
  let studentIdx = 0;
  let subjectIdx = 0;

  const years: AcademicYear[] = ["1st Year", "2nd Year", "3rd Year", "4th Year"].map((yearName, yi) => {
    const sectionNames = ["A", "B"];
    const subs = csSubjects[yearName];

    const sections: Section[] = sectionNames.map((secName, si) => {
      const subjects: Subject[] = subs.map((sub, subi) => {
        const staff = staffPool[(subjectIdx++) % staffPool.length];
        return { id: `sub-${yi}-${si}-${subi}`, name: sub.name, code: sub.code, assignedStaffId: staff.id, assignedStaffName: staff.name };
      });
      const students = generateStudents(8, studentIdx, subjects);
      studentIdx += 8;
      return { id: `sec-${yi}-${si}`, name: secName, subjects, students };
    });

    return { id: `year-${yi}`, name: yearName, sections };
  });

  return { id: "dept-1", name: "Computer Science", years };
}

export const defaultDepartments: Department[] = [buildDefaultDepartment()];
