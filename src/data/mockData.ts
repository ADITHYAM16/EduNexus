// Mock data for the entire application

export const mockStaffList = [
  { id: "staff-1", name: "Prof. Anita Sharma", email: "anita@college.edu", subject: "Data Structures", attendance: 92, syllabus: 78, tasksCompleted: 12, tasksPending: 3 },
  { id: "staff-2", name: "Prof. Vikram Patel", email: "vikram@college.edu", subject: "Operating Systems", attendance: 68, syllabus: 55, tasksCompleted: 8, tasksPending: 7 },
  { id: "staff-3", name: "Prof. Meera Iyer", email: "meera@college.edu", subject: "Database Systems", attendance: 95, syllabus: 90, tasksCompleted: 15, tasksPending: 1 },
  { id: "staff-4", name: "Prof. Arjun Nair", email: "arjun@college.edu", subject: "Computer Networks", attendance: 74, syllabus: 62, tasksCompleted: 10, tasksPending: 5 },
  { id: "staff-5", name: "Prof. Priya Das", email: "priya@college.edu", subject: "Software Engineering", attendance: 88, syllabus: 82, tasksCompleted: 14, tasksPending: 2 },
  { id: "staff-6", name: "Prof. Suresh Reddy", email: "suresh@college.edu", subject: "Machine Learning", attendance: 81, syllabus: 70, tasksCompleted: 11, tasksPending: 4 },
];

export const mockAttendanceHistory = [
  { date: "2026-03-01", status: "present" },
  { date: "2026-03-02", status: "present" },
  { date: "2026-03-03", status: "absent" },
  { date: "2026-03-04", status: "present" },
  { date: "2026-03-05", status: "present" },
];

export const mockWeeklyAttendance = [
  { week: "Jan", percentage: 88 },
  { week: "Feb", percentage: 85 },
  { week: "Mar", percentage: 90 },
  { week: "Apr", percentage: 92 },
  { week: "May", percentage: 87 },
  { week: "Jun", percentage: 78 },
  { week: "Jul", percentage: 82 },
  { week: "Aug", percentage: 91 },
  { week: "Sep", percentage: 95 },
  { week: "Oct", percentage: 89 },
  { week: "Nov", percentage: 93 },
  { week: "Dec", percentage: 96 },
];

export const mockSubjectProgress = [
  { subject: "Data Structures", unit: "Unit 1", topicsTotal: 8, topicsCompleted: 8, percentage: 100 },
  { subject: "Data Structures", unit: "Unit 2", topicsTotal: 10, topicsCompleted: 7, percentage: 70 },
  { subject: "Data Structures", unit: "Unit 3", topicsTotal: 6, topicsCompleted: 3, percentage: 50 },
  { subject: "Data Structures", unit: "Unit 4", topicsTotal: 9, topicsCompleted: 0, percentage: 0 },
  { subject: "Data Structures", unit: "Unit 5", topicsTotal: 7, topicsCompleted: 0, percentage: 0 },
];

// Multi-subject unit progress per staff (for expanded view)
export const mockStaffSubjectProgress: Record<string, { subject: string; units: boolean[] }[]> = {
  "staff-1": [
    { subject: "Data Structures", units: [true, true, true, false, false] },
    { subject: "Algorithms", units: [true, true, false, false, false] },
    { subject: "Discrete Math", units: [true, true, true, true, false] },
  ],
  "staff-2": [
    { subject: "Operating Systems", units: [true, true, false, false, false] },
    { subject: "System Programming", units: [true, false, false, false, false] },
  ],
  "staff-3": [
    { subject: "Database Systems", units: [true, true, true, true, false] },
    { subject: "SQL & NoSQL", units: [true, true, true, true, true] },
    { subject: "Data Warehousing", units: [true, true, true, false, false] },
  ],
  "staff-4": [
    { subject: "Computer Networks", units: [true, true, true, false, false] },
    { subject: "Network Security", units: [true, true, false, false, false] },
  ],
  "staff-5": [
    { subject: "Software Engineering", units: [true, true, true, true, false] },
    { subject: "Agile Methods", units: [true, true, true, false, false] },
    { subject: "Testing", units: [true, true, false, false, false] },
  ],
  "staff-6": [
    { subject: "Machine Learning", units: [true, true, false, false, false] },
    { subject: "Deep Learning", units: [true, true, true, false, false] },
    { subject: "Data Analytics", units: [true, true, true, true, false] },
    { subject: "NLP", units: [true, false, false, false, false] },
  ],
};

// Unit-level syllabus progress per staff
export const mockStaffUnitProgress: Record<string, { unit: string; completed: boolean }[]> = {
  "staff-1": [
    { unit: "Unit 1", completed: true },
    { unit: "Unit 2", completed: true },
    { unit: "Unit 3", completed: true },
    { unit: "Unit 4", completed: false },
    { unit: "Unit 5", completed: false },
  ],
  "staff-2": [
    { unit: "Unit 1", completed: true },
    { unit: "Unit 2", completed: true },
    { unit: "Unit 3", completed: false },
    { unit: "Unit 4", completed: false },
    { unit: "Unit 5", completed: false },
  ],
  "staff-3": [
    { unit: "Unit 1", completed: true },
    { unit: "Unit 2", completed: true },
    { unit: "Unit 3", completed: true },
    { unit: "Unit 4", completed: true },
    { unit: "Unit 5", completed: false },
  ],
  "staff-4": [
    { unit: "Unit 1", completed: true },
    { unit: "Unit 2", completed: true },
    { unit: "Unit 3", completed: true },
    { unit: "Unit 4", completed: false },
    { unit: "Unit 5", completed: false },
  ],
  "staff-5": [
    { unit: "Unit 1", completed: true },
    { unit: "Unit 2", completed: true },
    { unit: "Unit 3", completed: true },
    { unit: "Unit 4", completed: true },
    { unit: "Unit 5", completed: false },
  ],
  "staff-6": [
    { unit: "Unit 1", completed: true },
    { unit: "Unit 2", completed: true },
    { unit: "Unit 3", completed: true },
    { unit: "Unit 4", completed: false },
    { unit: "Unit 5", completed: false },
  ],
};

export const mockMessages = [
  { id: "m1", from: "Dr. Rajesh Kumar (HOD)", to: "All Staff", subject: "Faculty Meeting", body: "Please attend the faculty meeting on Friday at 3 PM.", date: "2026-03-04", type: "announcement" as const },
  { id: "m2", from: "Dr. Rajesh Kumar (HOD)", to: "Prof. Anita Sharma", subject: "Syllabus Review", body: "Please complete Unit 3 syllabus before next week.", date: "2026-03-03", type: "personal" as const },
  { id: "m3", from: "Dr. Rajesh Kumar (HOD)", to: "All Staff", subject: "Exam Schedule", body: "Internal exam schedule has been updated. Please check.", date: "2026-03-01", type: "announcement" as const },
];

export const mockDepartmentStats = {
  totalStaff: 6,
  avgAttendance: 83,
  avgSyllabus: 73,
  totalSubjects: 6,
};

export const mockMonthlyAttendance = [
  { month: "Oct", hod: 96, dept: 82 },
  { month: "Nov", hod: 94, dept: 85 },
  { month: "Dec", hod: 92, dept: 79 },
  { month: "Jan", hod: 98, dept: 88 },
  { month: "Feb", hod: 95, dept: 83 },
  { month: "Mar", hod: 97, dept: 86 },
];

export function getAIInsights(attendance: number, syllabus: number) {
  const insights: { type: "success" | "warning" | "danger" | "info"; message: string }[] = [];

  if (attendance >= 90) insights.push({ type: "success", message: `Excellent attendance at ${attendance}%. Keep it up!` });
  else if (attendance >= 75) insights.push({ type: "info", message: `Your attendance is ${attendance}%. Aim for 90%+ for optimal performance.` });
  else insights.push({ type: "danger", message: `Attendance is ${attendance}%, below the 75% minimum. Immediate improvement needed.` });

  if (syllabus >= 80) insights.push({ type: "success", message: `Syllabus completion at ${syllabus}% is on track.` });
  else if (syllabus >= 60) insights.push({ type: "warning", message: `Syllabus completion is ${syllabus}%. Complete ${Math.ceil((80 - syllabus) / 10)} more topics this week.` });
  else insights.push({ type: "danger", message: `Syllabus completion critically low at ${syllabus}%. Urgent action required.` });

  if (attendance >= 85 && syllabus >= 75) insights.push({ type: "success", message: "Overall performance is strong. You're a top performer this semester." });
  else insights.push({ type: "info", message: "Focus on consistent attendance and steady syllabus progress for better results." });

  return insights;
}

export function getDepartmentAIInsights(staff: typeof mockStaffList) {
  const insights: { type: "success" | "warning" | "danger" | "info"; message: string; staffName?: string }[] = [];

  staff.forEach((s) => {
    if (s.attendance < 75) insights.push({ type: "danger", message: `${s.name} attendance dropped below 75% (${s.attendance}%)`, staffName: s.name });
    if (s.syllabus >= 85) insights.push({ type: "success", message: `${s.name} has completed ${s.syllabus}% of syllabus — excellent progress`, staffName: s.name });
    if (s.syllabus < 60) insights.push({ type: "warning", message: `${s.name} has pending syllabus topics (${s.syllabus}% complete)`, staffName: s.name });
  });

  const avgAtt = Math.round(staff.reduce((a, s) => a + s.attendance, 0) / staff.length);
  if (avgAtt >= 85) insights.push({ type: "success", message: `Department average attendance is strong at ${avgAtt}%` });
  else insights.push({ type: "info", message: `Department average attendance is ${avgAtt}%. Target: 85%+` });

  return insights;
}

export const studentRoster: Record<string, string[]> = {
  "II Year|B": [
    "ADHITHIYA V", "ADITHYA M", "AKASH V", "ARCHANA S J", "ARUL SANJAI R",
    "ARUL V", "BALAMURUGAN R", "BHUVANESHWARAN M", "BRINDHA RAMESH", "CHARAN KUMAR N",
    "DEEPAK L", "DEEPIKSHA C", "DEVAPRASATH K", "DEVARAJ P", "DEVASHRI R P",
    "DIVYADHARSINI S", "ELAVARASAN P", "GANESHWAR K", "GORANTLA SAI CHARAN", "GURUNATHAN V",
    "HARIRAM R", "HARISH S", "HEMASHRE V", "JAYASURIYA J", "JEEVANANDHAN P",
    "KALAIMATHI V", "KAMALESH S", "KANISH KUMAR K", "KEERTHANA E", "KEERTHIVARMAA G",
    "KISHAN G", "KISHORE M", "LEKHA SHREE S", "LOGANATHAN K", "MADHAN PRASANTH M",
    "MADHANKUMAR P", "MEENA G", "NANDHAKUMAR M", "NAVEENKUMAR S", "NITHISHWARAN S K",
    "NUSUM BHAVITHA REDDY", "POOJA R", "PRAKASH M", "PRAVEEN K Y", "PRAWIN M",
    "PREMA A", "RAGURAM P", "RAMYA B", "RANJITH KUMAR R", "ROSHINI B",
    "SADHIYA U", "SANJAYNARAYAN V", "SASIDHARAN M", "SREE AADHITHYA N", "SUBASH S",
    "SURENDHAR R", "TAMILARASAN J", "THIVYAA K S", "VASAVI M",
  ],
};
