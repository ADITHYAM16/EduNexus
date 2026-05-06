// Test Supabase Connection
// Run this in browser console to test if Supabase is working

import { supabase } from './src/lib/supabase';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  
  // Test 1: Check if students table exists and has data
  console.log('\n📋 Test 1: Fetching students...');
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .limit(5);
  
  if (studentsError) {
    console.error('❌ Error fetching students:', studentsError);
  } else {
    console.log('✅ Students fetched successfully:', students?.length, 'records');
    console.log('Sample:', students?.[0]);
  }
  
  // Test 2: Try to insert a test result
  console.log('\n📝 Test 2: Inserting test result...');
  const testResult = {
    student_name: 'ADHITHIYA V',
    roll_no: '124UAD003',
    department: 'Artificial Intelligence & Data Science',
    section: 'B',
    year: 'II Year',
    subject: 'Java Programming',
    subject_key: 'java',
    score: 8,
    total: 10,
    date: new Date().toISOString(),
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('student_test_results')
    .insert(testResult)
    .select();
  
  if (insertError) {
    console.error('❌ Error inserting test result:', insertError);
    console.error('Error details:', {
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
      code: insertError.code
    });
  } else {
    console.log('✅ Test result inserted successfully:', insertData);
  }
  
  // Test 3: Fetch test results
  console.log('\n📊 Test 3: Fetching test results...');
  const { data: results, error: resultsError } = await supabase
    .from('student_test_results')
    .select('*')
    .eq('roll_no', '124UAD003');
  
  if (resultsError) {
    console.error('❌ Error fetching test results:', resultsError);
  } else {
    console.log('✅ Test results fetched successfully:', results?.length, 'records');
    console.log('Results:', results);
  }
  
  // Test 4: Check RLS policies
  console.log('\n🔒 Test 4: Checking RLS policies...');
  console.log('If you see errors above, RLS policies might be blocking access.');
  console.log('Run the SQL setup script in Supabase SQL Editor to fix this.');
  
  console.log('\n✨ Test complete!');
}

// Run the test
testSupabaseConnection().catch(console.error);
