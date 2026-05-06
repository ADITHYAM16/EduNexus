-- ============================================================
-- STUDENT MARKS TABLE SETUP
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS student_marks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  year TEXT NOT NULL,
  section TEXT NOT NULL,
  subject TEXT NOT NULL,
  ciat1 INTEGER,
  ciat2 INTEGER,
  assignment1 INTEGER,
  assignment2 INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_name, year, section, subject)
);

CREATE INDEX IF NOT EXISTS idx_student_marks_year_section ON student_marks(year, section);
CREATE INDEX IF NOT EXISTS idx_student_marks_student ON student_marks(student_name);

ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations" ON student_marks;
CREATE POLICY "Allow all operations" ON student_marks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

SELECT 'student_marks table ready' AS status;
