# Supabase Setup Guide for Smart Staff Insight

## Step 1: Run the SQL Setup Script

1. Go to your Supabase project dashboard: https://fpqexmfnptqaopletydb.supabase.co
2. Click on the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase_students_setup.sql`
5. Click **Run** to execute the script

This will:
- Create the `students` table with all 60 students (Section B, AI & Data Science)
- Create the `student_test_results` table for storing test marks
- Create the `student_remarks` table for storing malpractice remarks
- Set up proper indexes for performance
- Configure Row Level Security (RLS) policies to allow all operations

## Step 2: Verify Tables Were Created

1. In Supabase dashboard, click **Table Editor** in the left sidebar
2. You should see three tables:
   - `students` (60 rows)
   - `student_test_results` (initially empty)
   - `student_remarks` (initially empty)

## Step 3: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the student portal and login with any roll number:
   - Example: `124UAD003` (ADHITHIYA V)
   - Example: `124UAD020` (BRINDHA RAMESH)
   - Example: `124UAD166` (VASAVI M)

3. Take a test (Java, Python, or DBMS)
4. After completing the test, the marks should be saved to Supabase
5. Check the `student_test_results` table in Supabase to verify the data was saved

## Step 4: View Results in Staff Portal

1. Login to the staff portal
2. Navigate to **Weekly Test** section
3. Select **Section B**
4. You should see all students who have completed tests with their scores

## Troubleshooting

### Error: "Failed to save test result"

**Possible causes:**
1. RLS policies not configured correctly
2. Supabase URL or API key incorrect in `.env`
3. Tables not created properly

**Solutions:**
1. Re-run the SQL setup script in Supabase SQL Editor
2. Verify `.env` file has correct credentials:
   ```
   VITE_SUPABASE_URL=https://fpqexmfnptqaopletydb.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Check browser console (F12) for detailed error messages
4. Verify RLS policies in Supabase:
   - Go to **Authentication** > **Policies**
   - Each table should have "Allow all operations" policy

### Error: "Roll number not found"

**Solution:**
- Make sure the SQL script was executed successfully
- Check the `students` table has 60 rows
- Verify the roll number format (e.g., `124UAD003`)

### Data not showing in Staff Portal

**Solution:**
1. Click the **Refresh** button in the Staff Weekly Test page
2. Verify the student's department matches the staff's department
3. Check the section filter is set to "B"

## Student List (Section B - AI & Data Science)

All 60 students are pre-loaded in the database:

| Roll No | Name |
|---------|------|
| 124UAD003 | ADHITHIYA V |
| 124UAD004 | ADITHYA M |
| 124UAD005 | AKASH V |
| 124UAD009 | ARCHANA S J |
| 124UAD012 | ARUL SANJAI R |
| 124UAD013 | ARUL V |
| 124UAD017 | BALAMURUGAN R |
| 124UAD018 | BHUPATHI PRASANTH RAJU |
| 124UAD019 | BHUVANESHWARAN M |
| 124UAD020 | BRINDHA RAMESH |
| 124UAD022 | CHARAN KUMAR N |
| 124UAD024 | DEEPAK L |
| 124UAD026 | DEEPIKSHA C |
| 124UAD028 | DEVAPRASATH K |
| 124UAD029 | DEVARAJ P |
| 124UAD030 | DEVASHRI R P |
| 124UAD039 | DIVYADHARSINI S |
| 124UAD043 | ELAVARASAN P |
| 124UAD047 | GANESHWAR K |
| 124UAD048 | GORANTLA SAI CHARAN |
| 124UAD051 | GURUNATHAN V |
| 124UAD052 | HARIRAM R |
| 124UAD053 | HARISH S |
| 124UAD055 | HEMASHRE V |
| 124UAD059 | JAYASURIYA J |
| 124UAD061 | JEEVANANDHAN P |
| 124UAD064 | KALAIMATHI V |
| 124UAD068 | KAMALESH S |
| 124UAD069 | KANISH KUMAR K |
| 124UAD074 | KEERTHANA E |
| 124UAD075 | KEERTHIVARMAA G |
| 124UAD077 | KISHAN G |
| 124UAD080 | KISHORE M |
| 124UAD085 | LEKHA SHREE S |
| 124UAD086 | LOGANATHAN K |
| 124UAD088 | MADHAN PRASANTH M |
| 124UAD089 | MADHANKUMAR P |
| 124UAD098 | MEENA G |
| 124UAD103 | NANDHAKUMAR M |
| 124UAD108 | NAVEENKUMAR S |
| 124UAD109 | NITHISHWARAN S K |
| 124UAD110 | NUSUM BHAVITHA REDDY |
| 124UAD113 | POOJA R |
| 124UAD118 | PRAKASH M |
| 124UAD120 | PRAVEEN K Y |
| 124UAD122 | PRAWIN M |
| 124UAD123 | PREMA A |
| 124UAD127 | RAGURAM P |
| 124UAD128 | RAMYA B |
| 124UAD130 | RANJITH KUMAR R |
| 124UAD134 | ROSHINI B |
| 124UAD138 | SADHIYA U |
| 124UAD140 | SANJAYNARAYAN V |
| 124UAD144 | SASIDHARAN M |
| 124UAD150 | SREE AADHITHYA N |
| 124UAD154 | SUBASH S |
| 124UAD156 | SURENDHAR R |
| 124UAD160 | TAMILARASAN J |
| 124UAD163 | THIVYAA K S |
| 124UAD166 | VASAVI M |

## Features

### For Students:
- Login with roll number
- Take MCQ tests (Java, Python, DBMS)
- View test scores and history
- Automatic malpractice detection (tab switching)

### For Staff:
- View all students in Section B
- See test results for each student
- View best scores per subject
- See all test attempts history
- View malpractice remarks
- Real-time updates when students complete tests

## Database Schema

### students
- `id` (UUID, Primary Key)
- `roll_no` (TEXT, Unique)
- `name` (TEXT)
- `department` (TEXT)
- `section` (TEXT)
- `year` (TEXT)
- `email` (TEXT)
- `created_at` (TIMESTAMP)

### student_test_results
- `id` (UUID, Primary Key)
- `student_name` (TEXT)
- `roll_no` (TEXT)
- `department` (TEXT)
- `section` (TEXT)
- `year` (TEXT)
- `subject` (TEXT)
- `subject_key` (TEXT)
- `score` (INTEGER)
- `total` (INTEGER)
- `date` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### student_remarks
- `id` (UUID, Primary Key)
- `student_name` (TEXT)
- `roll_no` (TEXT)
- `subject` (TEXT)
- `note` (TEXT)
- `date` (TIMESTAMP)
- `created_at` (TIMESTAMP)
