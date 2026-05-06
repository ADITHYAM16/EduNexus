-- ============================================================
-- SMART STAFF INSIGHT - COMPLETE DATABASE SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- 1. CREATE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT DEFAULT 'Artificial Intelligence & Data Science',
  section TEXT DEFAULT 'B',
  year TEXT DEFAULT 'II Year',
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  department TEXT NOT NULL,
  section TEXT NOT NULL,
  year TEXT NOT NULL,
  subject TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_remarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  roll_no TEXT NOT NULL,
  subject TEXT NOT NULL,
  note TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_test_results_roll_no ON student_test_results(roll_no);
CREATE INDEX IF NOT EXISTS idx_test_results_section ON student_test_results(section);
CREATE INDEX IF NOT EXISTS idx_test_results_department ON student_test_results(department);
CREATE INDEX IF NOT EXISTS idx_remarks_roll_no ON student_remarks(roll_no);

-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_remarks ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Allow read access to all users" ON students;
DROP POLICY IF EXISTS "Allow read access to all users" ON student_test_results;
DROP POLICY IF EXISTS "Allow read access to all users" ON student_remarks;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON student_test_results;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON student_remarks;
DROP POLICY IF EXISTS "Allow all operations" ON students;
DROP POLICY IF EXISTS "Allow all operations" ON student_test_results;
DROP POLICY IF EXISTS "Allow all operations" ON student_remarks;

-- Create open policies (allow everything for anon key)
CREATE POLICY "Allow all operations" ON students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON student_test_results FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON student_remarks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. INSERT STUDENTS (safe upsert - won't fail if already exists)
-- ============================================================

INSERT INTO students (roll_no, name, department, section, year) VALUES
('124UAD003', 'ADHITHIYA V', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD004', 'ADITHYA M', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD005', 'AKASH V', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD009', 'ARCHANA S J', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD012', 'ARUL SANJAI R', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD013', 'ARUL V', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD017', 'BALAMURUGAN R', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD018', 'BHUPATHI PRASANTH RAJU', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD019', 'BHUVANESHWARAN M', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD020', 'BRINDHA RAMESH', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD022', 'CHARAN KUMAR N', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD024', 'DEEPAK L', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD026', 'DEEPIKSHA C', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD028', 'DEVAPRASATH K', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD029', 'DEVARAJ P', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD030', 'DEVASHRI R P', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD039', 'DIVYADHARSINI S', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD043', 'ELAVARASAN P', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD047', 'GANESHWAR K', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD048', 'GORANTLA SAI CHARAN', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD051', 'GURUNATHAN V', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD052', 'HARIRAM R', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD053', 'HARISH S', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD055', 'HEMASHRE V', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD059', 'JAYASURIYA J', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD061', 'JEEVANANDHAN P', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD064', 'KALAIMATHI V', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD068', 'KAMALESH S', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD069', 'KANISH KUMAR K', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD074', 'KEERTHANA E', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD075', 'KEERTHIVARMAA G', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD077', 'KISHAN G', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD080', 'KISHORE M', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD085', 'LEKHA SHREE S', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD086', 'LOGANATHAN K', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD088', 'MADHAN PRASANTH M', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD089', 'MADHANKUMAR P', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD098', 'MEENA G', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD103', 'NANDHAKUMAR M', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD108', 'NAVEENKUMAR S', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD109', 'NITHISHWARAN S K', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD110', 'NUSUM BHAVITHA REDDY', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD113', 'POOJA R', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD118', 'PRAKASH M', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD120', 'PRAVEEN K Y', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD122', 'PRAWIN M', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD123', 'PREMA A', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD127', 'RAGURAM P', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD128', 'RAMYA B', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD130', 'RANJITH KUMAR R', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD134', 'ROSHINI B', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD138', 'SADHIYA U', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD140', 'SANJAYNARAYAN V', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD144', 'SASIDHARAN M', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD150', 'SREE AADHITHYA N', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD154', 'SUBASH S', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD156', 'SURENDHAR R', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD160', 'TAMILARASAN J', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD163', 'THIVYAA K S', 'Artificial Intelligence & Data Science', 'B', 'II Year'),
('124UAD166', 'VASAVI M', 'Artificial Intelligence & Data Science', 'B', 'II Year')
ON CONFLICT (roll_no) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  section = EXCLUDED.section,
  year = EXCLUDED.year;

-- 5. VERIFY (optional - shows row counts)
-- ============================================================
SELECT 'students' AS table_name, COUNT(*) AS row_count FROM students
UNION ALL
SELECT 'student_test_results', COUNT(*) FROM student_test_results
UNION ALL
SELECT 'student_remarks', COUNT(*) FROM student_remarks;
