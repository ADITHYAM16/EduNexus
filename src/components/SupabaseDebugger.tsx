import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * SupabaseDebugger Component
 * 
 * Add this to any page to test Supabase connection:
 * import SupabaseDebugger from '@/components/SupabaseDebugger';
 * <SupabaseDebugger />
 */
const SupabaseDebugger: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : '🔍';
    setLogs(prev => [...prev, `${prefix} ${message}`]);
  };

  const runTests = async () => {
    setLogs([]);
    setTesting(true);
    addLog('Starting Supabase connection tests...');

    try {
      // Test 1: Fetch students
      addLog('Test 1: Fetching students...');
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .limit(5);

      if (studentsError) {
        addLog(`Students fetch failed: ${studentsError.message}`, 'error');
        addLog(`Error code: ${studentsError.code}`, 'error');
      } else {
        addLog(`Students fetched: ${students?.length || 0} records`, 'success');
        if (students && students.length > 0) {
          addLog(`Sample: ${students[0].roll_no} - ${students[0].name}`, 'info');
        }
      }

      // Test 2: Insert test result
      addLog('Test 2: Inserting test result...');
      const testResult = {
        student_name: 'TEST STUDENT',
        roll_no: '124UAD003',
        department: 'Artificial Intelligence & Data Science',
        section: 'B',
        year: 'II Year',
        subject: 'Java Programming',
        subject_key: 'java',
        score: 9,
        total: 10,
        date: new Date().toISOString(),
      };

      const { data: insertData, error: insertError } = await supabase
        .from('student_test_results')
        .insert(testResult)
        .select();

      if (insertError) {
        addLog(`Insert failed: ${insertError.message}`, 'error');
        addLog(`Error details: ${JSON.stringify(insertError.details)}`, 'error');
        addLog(`Hint: ${insertError.hint}`, 'error');
      } else {
        addLog('Test result inserted successfully!', 'success');
        addLog(`Inserted ID: ${insertData?.[0]?.id}`, 'info');
      }

      // Test 3: Fetch test results
      addLog('Test 3: Fetching test results...');
      const { data: results, error: resultsError } = await supabase
        .from('student_test_results')
        .select('*')
        .eq('roll_no', '124UAD003')
        .limit(5);

      if (resultsError) {
        addLog(`Results fetch failed: ${resultsError.message}`, 'error');
      } else {
        addLog(`Test results fetched: ${results?.length || 0} records`, 'success');
      }

      // Test 4: Check remarks table
      addLog('Test 4: Checking remarks table...');
      const { data: remarks, error: remarksError } = await supabase
        .from('student_remarks')
        .select('*')
        .limit(1);

      if (remarksError) {
        addLog(`Remarks fetch failed: ${remarksError.message}`, 'error');
      } else {
        addLog('Remarks table accessible', 'success');
      }

      addLog('All tests completed!', 'success');
    } catch (error: any) {
      addLog(`Unexpected error: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-white dark:bg-gray-900 border-2 border-purple-500 rounded-lg shadow-2xl">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          🔧 Supabase Debugger
        </h3>
        <button
          onClick={runTests}
          disabled={testing}
          className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Run Tests'}
        </button>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">
            Click "Run Tests" to check Supabase connection
          </p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`text-xs font-mono p-2 rounded ${
                  log.startsWith('✅')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : log.startsWith('❌')
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseDebugger;
