'use client';

import { Question } from '@/types';
import { Check, Clock, X, PlayCircle, StopCircle, Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface QuestionCardProps {
  question: Question;
  isCompleted: boolean;
  savedCode: string;
  savedNotes: string;
  onCodeChange: (code: string) => void;
  onNotesChange: (notes: string) => void;
  onToggleComplete: () => void;
  language: 'javascript' | 'python' | 'java';
  timeSpent: number;
  onTimeUpdate: (seconds: number) => void;
}

export default function QuestionCard({
  question,
  isCompleted,
  savedCode,
  savedNotes,
  onCodeChange,
  onNotesChange,
  onToggleComplete,
  language,
  timeSpent,
  onTimeUpdate,
}: QuestionCardProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeSpent);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const pyodideRef = useRef<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [outputHeight, setOutputHeight] = useState(200);
  const [notesHeight, setNotesHeight] = useState(128);
  const abortControllerRef = useRef<AbortController | null>(null);
  const executionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getLanguageMode = () => {
    if (language === 'javascript') return 'javascript';
    if (language === 'python') return 'python';
    return 'java';
  };

  const loadPyodide = async () => {
    if (pyodideRef.current) return pyodideRef.current;
    if (isPyodideLoading) return null;
    
    setIsPyodideLoading(true);
    try {
      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });
      pyodideRef.current = pyodide;
      return pyodide;
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      return null;
    } finally {
      setIsPyodideLoading(false);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    // Set timeout (10 seconds for code execution)
    const codeTimeout = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setOutput(prev => prev + '\n\n⏱️ Execution timed out (5 seconds). Your code may have an infinite loop.\n\nTips:\n- Check for infinite loops\n- Optimize your algorithm');
        setIsRunning(false);
      }
    }, 5000);
    
    const code = savedCode || question.starterCode[language];
    
    try {
      if (language === 'javascript') {
        // Use Web Worker to run code in separate thread (prevents page freeze)
        const workerPromise = new Promise((resolve, reject) => {
          const worker = new Worker('/run-worker.js');
          let completed = false;
          
          const timeout = setTimeout(() => {
            if (!completed) {
              completed = true;
              worker.terminate();
              reject(new Error('Execution timed out (10 seconds)'));
            }
          }, 10000);
          
          worker.onmessage = (e) => {
            if (!completed) {
              completed = true;
              clearTimeout(timeout);
              worker.terminate();
              resolve(e.data);
            }
          };
          
          worker.onerror = (error) => {
            if (!completed) {
              completed = true;
              clearTimeout(timeout);
              worker.terminate();
              reject(error);
            }
          };
          
          // Check for abort
          if (abortControllerRef.current?.signal.aborted) {
            completed = true;
            clearTimeout(timeout);
            worker.terminate();
            reject(new Error('Execution cancelled'));
            return;
          }
          
          // Send code to worker
          worker.postMessage({ code });
        });
        
        const result = await workerPromise as { success: boolean; output?: string; error?: string };
        
        if (result.success) {
          setOutput(result.output || '');
        } else {
          setOutput(`Error: ${result.error || 'Unknown error'}`);
        }
        
        clearTimeout(codeTimeout);
      } else if (language === 'python') {
        setOutput('Loading Python environment...');
        const pyodide = await loadPyodide();
        
        if (!pyodide) {
          setOutput('Failed to load Python environment. Please refresh and try again.');
          return;
        }

        // Capture stdout
        const outputs: string[] = [];
        pyodide.setStdout({ 
          batched: (text: string) => {
            outputs.push(text);
          }
        });

        // Run the code
        await pyodide.runPythonAsync(code);
        
        const result = outputs.join('');
        setOutput(result || 'Code executed successfully (no output)');
      } else if (language === 'java') {
        setOutput('Compiling and running Java code...');
        
        // Wrap Java code in a class if it's not already wrapped
        let javaCode = code.trim();
        if (!javaCode.includes('class ') && !javaCode.includes('public static void main')) {
          // If it's just a method, wrap it in a Main class with a main method to call it
          javaCode = `public class Main {
    ${code}
    
    public static void main(String[] args) {
        // Add your test code here to call the method above
        System.out.println("Method defined successfully. Add test calls in main method.");
    }
}`;
        }
        
        // Use Piston API for Java execution with timeout
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortControllerRef.current?.signal,
          body: JSON.stringify({
            language: 'java',
            version: '15.0.2',
            files: [{
              content: javaCode
            }]
          })
        });
        
        const result = await response.json();
        
        if (result.run) {
          const output = result.run.output || result.run.stdout || '';
          const error = result.run.stderr || '';
          setOutput(output + (error ? '\n' + error : '') || 'Code executed (no output)');
        } else {
          setOutput('Execution failed. Please check your code syntax.');
        }
        
        clearTimeout(codeTimeout);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setOutput(prev => prev + '\n\n⚠️ Code execution was cancelled.');
      } else {
        setOutput(`Error: ${error.message}`);
      }
    } finally {
      clearTimeout(codeTimeout);
      abortControllerRef.current = null;
      setIsRunning(false);
    }
  };

  const runTests = async () => {
    if (!question.testCases || question.testCases.length === 0) {
      setOutput('⚠️ No test cases available for this problem.');
      return;
    }

    setIsRunning(true);
    setOutput('Running tests...\n\n');
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    // Set overall timeout (30 seconds max for all tests)
    const overallTimeout = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setOutput(prev => prev + '\n\n⏱️ Execution timed out (30 seconds). Your code may have an infinite loop or be too slow.\n\nTips:\n- Check for infinite loops\n- Optimize your algorithm\n- Review the time complexity requirements');
        setIsRunning(false);
      }
    }, 30000);
    
    const code = savedCode || question.starterCode[language];
    
    try {
      if (language === 'javascript') {
        let results: string[] = [];
        let allPassed = true;
        let totalTime = 0;
        const MAX_TEST_TIME = 5000; // 5 seconds per test case
        
        // Use Web Worker to run tests in separate thread (prevents page freeze)
        const workerPromises: Promise<any>[] = [];
        
        for (let i = 0; i < question.testCases.length; i++) {
          const testCase = question.testCases[i];
          
          const workerPromise = new Promise((resolve, reject) => {
            const worker = new Worker('/test-worker.js');
            let timeoutId: NodeJS.Timeout;
            let completed = false;
            
            // Set timeout for this test
            timeoutId = setTimeout(() => {
              if (!completed) {
                completed = true;
                worker.terminate();
                reject(new Error('Test case timed out (5 seconds limit)'));
              }
            }, MAX_TEST_TIME);
            
            worker.onmessage = (e) => {
              if (!completed) {
                completed = true;
                clearTimeout(timeoutId);
                worker.terminate();
                resolve(e.data);
              }
            };
            
            worker.onerror = (error) => {
              if (!completed) {
                completed = true;
                clearTimeout(timeoutId);
                worker.terminate();
                reject(error);
              }
            };
            
            // Check for abort
            if (abortControllerRef.current?.signal.aborted) {
              completed = true;
              clearTimeout(timeoutId);
              worker.terminate();
              reject(new Error('Execution cancelled'));
              return;
            }
            
            // Send test to worker
            worker.postMessage({
              code,
              testCase,
              testIndex: i
            });
          });
          
          workerPromises.push(workerPromise);
        }
        
        // Wait for all tests to complete
        const workerResults = await Promise.allSettled(workerPromises);
        
        // Process results
        for (let i = 0; i < workerResults.length; i++) {
          const result = workerResults[i];
          const testCase = question.testCases[i];
          
          try {
            if (result.status === 'fulfilled' && (result.value as any).success) {
              const data = result.value as any;
              totalTime += parseFloat(data.executionTime);
              
              const expected = JSON.stringify(data.expected);
              const actual = JSON.stringify(data.result);
              const passed = expected === actual;
              
              if (!passed) allPassed = false;
              
              results.push(
                `Test ${i + 1}: ${passed ? '✅ PASSED' : '❌ FAILED'}\n` +
                `Input: ${JSON.stringify(data.input)}\n` +
                `Expected: ${expected}\n` +
                `Got: ${actual}\n` +
                `Time: ${data.executionTime}ms\n`
              );
            } else if (result.status === 'fulfilled' && !(result.value as any).success) {
              allPassed = false;
              const value = result.value as any;
              results.push(
                `Test ${i + 1}: ❌ ERROR\n` +
                `Input: ${JSON.stringify(value.input)}\n` +
                `Error: ${value.error}\n`
              );
            } else if (result.status === 'rejected') {
              allPassed = false;
              results.push(
                `Test ${i + 1}: ❌ ERROR\n` +
                `Input: ${JSON.stringify(testCase.input)}\n` +
                `Error: ${result.reason?.message || 'Unknown error'}\n`
              );
            }
          } catch (error: any) {
            // This catch is just for safety
            allPassed = false;
            results.push(
              `Test ${i + 1}: ❌ ERROR\n` +
              `Input: ${JSON.stringify(testCase.input)}\n` +
              `Error: ${error.message}\n`
            );
          }
        }
        
        const avgTime = (totalTime / question.testCases.length).toFixed(3);
        
        results.unshift(
          `📊 Test Results: ${allPassed ? '✅ All Passed' : '❌ Some Failed'}\n` +
          `Tests: ${question.testCases.length}\n` +
          `Avg Time: ${avgTime}ms\n` +
          `Total Time: ${totalTime.toFixed(3)}ms\n\n` +
          `Expected Complexity:\n` +
          `⏱️  Time: ${question.timeComplexity}\n` +
          `💾 Space: ${question.spaceComplexity}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        );
        
        setOutput(results.join('\n'));
      } else if (language === 'python') {
        setOutput('Loading Python environment and running tests...\n\n');
        
        // Check for abort
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        const pyodide = await loadPyodide();
        
        if (!pyodide) {
          setOutput('Failed to load Python environment. Please refresh and try again.');
          return;
        }

        let results: string[] = [];
        let allPassed = true;
        let totalTime = 0;
        
        // Extract function name from code
        const functionMatch = code.match(/def\s+(\w+)\s*\(/);
        const functionName = functionMatch ? functionMatch[1] : null;
        
        if (!functionName) {
          setOutput('❌ Could not find function definition in your code.\nMake sure your code contains a function definition like: def function_name(...)');
          setIsRunning(false);
          return;
        }
        
        // Extract only the function definition (ignore test code, comments after function)
        let functionCode = code;
        const lines = code.split('\n');
        let functionLines: string[] = [];
        let inFunction = false;
        let functionIndent = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();
          
          // Start of function
          if (trimmed.startsWith('def ') && trimmed.includes(functionName)) {
            inFunction = true;
            functionIndent = line.length - line.trimStart().length;
            functionLines.push(line);
            continue;
          }
          
          if (inFunction) {
            // Empty lines or comments within function
            if (trimmed === '' || trimmed.startsWith('#')) {
              functionLines.push(line);
              continue;
            }
            
            // Check if we're still inside the function (indentation level)
            const currentIndent = line.length - line.trimStart().length;
            if (currentIndent > functionIndent || trimmed === '') {
              functionLines.push(line);
            } else {
              // We've exited the function
              break;
            }
          }
        }
        
        functionCode = functionLines.join('\n');
        
        for (let i = 0; i < question.testCases.length; i++) {
          const testCase = question.testCases[i];
          
          // Check if execution was aborted
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }
          
          try {
            const startTime = performance.now();
            
            // Build test code - convert inputs to Python format
            const inputValues = Object.values(testCase.input);
            const inputArgs = inputValues.map(v => {
              if (Array.isArray(v)) {
                // Handle arrays - convert to Python list notation
                return JSON.stringify(v);
              } else if (typeof v === 'string') {
                // Handle strings - use proper Python string notation
                return JSON.stringify(v);
              } else if (typeof v === 'number') {
                return v.toString();
              } else if (typeof v === 'boolean') {
                return v ? 'True' : 'False';
              } else if (v === null) {
                return 'None';
              } else {
                // Handle objects/dicts
                return JSON.stringify(v).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None');
              }
            }).join(', ');
            const testCode = `${functionCode}\n\nimport json\nresult = ${functionName}(${inputArgs})\nprint(json.dumps(result))`;
            
            // Capture output
            const outputs: string[] = [];
            pyodide.setStdout({ 
              batched: (text: string) => {
                outputs.push(text);
              }
            });
            
            await pyodide.runPythonAsync(testCode);
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(3);
            totalTime += parseFloat(executionTime);
            
            // Parse result
            const output = outputs.join('').trim();
            const result = output ? JSON.parse(output) : null;
            
            // Compare result
            const expected = JSON.stringify(testCase.output);
            const actual = JSON.stringify(result);
            const passed = expected === actual;
            
            if (!passed) allPassed = false;
            
            results.push(
              `Test ${i + 1}: ${passed ? '✅ PASSED' : '❌ FAILED'}\n` +
              `Input: ${JSON.stringify(testCase.input)}\n` +
              `Expected: ${expected}\n` +
              `Got: ${actual}\n` +
              `Time: ${executionTime}ms\n`
            );
          } catch (error: any) {
            allPassed = false;
            results.push(
              `Test ${i + 1}: ❌ ERROR\n` +
              `Input: ${JSON.stringify(testCase.input)}\n` +
              `Error: ${error.message}\n`
            );
          }
        }
        
        const avgTime = (totalTime / question.testCases.length).toFixed(3);
        
        results.unshift(
          `📊 Test Results: ${allPassed ? '✅ All Passed' : '❌ Some Failed'}\n` +
          `Tests: ${question.testCases.length}\n` +
          `Avg Time: ${avgTime}ms\n` +
          `Total Time: ${totalTime.toFixed(3)}ms\n\n` +
          `Expected Complexity:\n` +
          `⏱️  Time: ${question.timeComplexity}\n` +
          `💾 Space: ${question.spaceComplexity}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        );
        
        setOutput(results.join('\n'));
      } else if (language === 'java') {
        setOutput('Running Java tests (this may take a moment)...\n\n');
        
        let results: string[] = [];
        let allPassed = true;
        let totalTime = 0;
        
        // Extract method name from code
        const methodMatch = code.match(/public\s+\w+\s+(\w+)\s*\(/);
        const methodName = methodMatch ? methodMatch[1] : null;
        
        if (!methodName) {
          setOutput('❌ Could not find public method definition in your code.\nMake sure your code contains a method like: public ReturnType methodName(...)');
          setIsRunning(false);
          return;
        }
        
        for (let i = 0; i < question.testCases.length; i++) {
          const testCase = question.testCases[i];
          
          try {
            const startTime = performance.now();
            
            // Build test code - convert inputs to Java format
            const inputValues = Object.values(testCase.input);
            const javaInputs = inputValues.map(v => {
              if (Array.isArray(v)) {
                // Check if it's an array of strings or numbers
                if (v.length > 0 && typeof v[0] === 'string') {
                  return `new String[]{${v.map(s => `"${s}"`).join(',')}}`;
                } else {
                  return `new int[]{${v.join(',')}}`;
                }
              } else if (typeof v === 'string') {
                return `"${v}"`;
              } else if (typeof v === 'boolean') {
                return v ? 'true' : 'false';
              } else if (v === null) {
                return 'null';
              }
              return v;
            }).join(', ');
            
            const testCode = `
import java.util.*;
import com.google.gson.Gson;

public class Solution {
    ${code}
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        Object result = sol.${methodName}(${javaInputs});
        Gson gson = new Gson();
        System.out.println(gson.toJson(result));
    }
}`;
            
            // Use Piston API for Java execution with timeout
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: abortControllerRef.current?.signal,
              body: JSON.stringify({
                language: 'java',
                version: '15.0.2',
                files: [{
                  content: testCode
                }]
              })
            });
            
            const apiResult = await response.json();
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(3);
            totalTime += parseFloat(executionTime);
            
            if (apiResult.run && !apiResult.run.stderr) {
              const output = (apiResult.run.output || apiResult.run.stdout || '').trim();
              const result = output ? JSON.parse(output) : null;
              
              // Compare result
              const expected = JSON.stringify(testCase.output);
              const actual = JSON.stringify(result);
              const passed = expected === actual;
              
              if (!passed) allPassed = false;
              
              results.push(
                `Test ${i + 1}: ${passed ? '✅ PASSED' : '❌ FAILED'}\n` +
                `Input: ${JSON.stringify(testCase.input)}\n` +
                `Expected: ${expected}\n` +
                `Got: ${actual}\n` +
                `Time: ${executionTime}ms\n`
              );
            } else {
              allPassed = false;
              const error = apiResult.run?.stderr || apiResult.message || 'Unknown error';
              results.push(
                `Test ${i + 1}: ❌ ERROR\n` +
                `Input: ${JSON.stringify(testCase.input)}\n` +
                `Error: ${error}\n`
              );
            }
          } catch (error: any) {
            allPassed = false;
            results.push(
              `Test ${i + 1}: ❌ ERROR\n` +
              `Input: ${JSON.stringify(testCase.input)}\n` +
              `Error: ${error.message}\n`
            );
          }
        }
        
        const avgTime = (totalTime / question.testCases.length).toFixed(3);
        
        results.unshift(
          `📊 Test Results: ${allPassed ? '✅ All Passed' : '❌ Some Failed'}\n` +
          `Tests: ${question.testCases.length}\n` +
          `Avg Time: ${avgTime}ms (includes network latency)\n` +
          `Total Time: ${totalTime.toFixed(3)}ms\n\n` +
          `Expected Complexity:\n` +
          `⏱️  Time: ${question.timeComplexity}\n` +
          `💾 Space: ${question.spaceComplexity}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        );
        
        setOutput(results.join('\n'));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setOutput(prev => prev + '\n\n⚠️ Test execution was cancelled.');
      } else {
        setOutput(`Test Error: ${error.message}`);
      }
    } finally {
      clearTimeout(overallTimeout);
      abortControllerRef.current = null;
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Editor Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${
              isTimerRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isTimerRunning ? (
              <>
                <StopCircle className="w-4 h-4" /> Stop
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" /> Start
              </>
            )}
          </button>
          <span className="text-sm text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTime(currentTime)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => {
                if (abortControllerRef.current) {
                  abortControllerRef.current.abort();
                  setIsRunning(false);
                  setOutput(prev => prev + '\n\n⚠️ Test execution cancelled by user.');
                }
              }}
              className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse"
              title="Cancel test execution"
            >
              <StopCircle className="w-4 h-4" />
              Cancel
            </button>
          ) : (
            <>
              <button
                onClick={runTests}
                disabled={isRunning || !question.testCases}
                className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                title="Run all test cases and check complexity"
              >
                <Check className="w-4 h-4" />
                Run Tests
              </button>
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Run Code
              </button>
            </>
          )}
          <button
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${
              isCompleted
                ? 'bg-gray-600 hover:bg-gray-500 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isCompleted ? (
              <>
                <X className="w-4 h-4" /> Unmark
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Complete
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={getLanguageMode()}
            value={savedCode || question.starterCode[language]}
            onChange={(value) => onCodeChange(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>

        {/* Output Console */}
        {output && showOutput && (
          <div 
            className="border-t border-gray-700 bg-gray-950 flex flex-col"
            style={{ height: `${outputHeight}px` }}
          >
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-300">Output</span>
                  <button
                    onClick={() => setOutputHeight(prev => Math.min(prev + 50, 600))}
                    className="text-xs text-gray-400 hover:text-gray-200 px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700"
                  >
                    ↕ Expand
                  </button>
                  <button
                    onClick={() => setOutputHeight(prev => Math.max(prev - 50, 100))}
                    className="text-xs text-gray-400 hover:text-gray-200 px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700"
                  >
                    ↕ Shrink
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOutput('')}
                    className="text-xs text-gray-400 hover:text-gray-200"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowOutput(false)}
                    className="text-xs text-gray-400 hover:text-gray-200"
                  >
                    ✕ Hide
                  </button>
                </div>
              </div>
            </div>
            <pre className="p-4 text-sm text-gray-100 font-mono overflow-auto flex-1">
              {output}
            </pre>
          </div>
        )}

        {/* Show Output Button when hidden */}
        {output && !showOutput && (
          <div className="border-t border-gray-700 bg-gray-900 px-4 py-2">
            <button
              onClick={() => setShowOutput(true)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              ↑ Show Output
            </button>
          </div>
        )}

        {/* Notes Section */}
        {showNotes && (
          <div 
            className="border-t border-gray-700 bg-gray-800 flex flex-col"
            style={{ height: `${notesHeight}px` }}
          >
            <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400">Notes</span>
                <button
                  onClick={() => setNotesHeight(prev => Math.min(prev + 50, 500))}
                  className="text-xs text-gray-400 hover:text-gray-200 px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600"
                >
                  ↕ Expand
                </button>
                <button
                  onClick={() => setNotesHeight(prev => Math.max(prev - 50, 80))}
                  className="text-xs text-gray-400 hover:text-gray-200 px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600"
                >
                  ↕ Shrink
                </button>
              </div>
              <button
                onClick={() => setShowNotes(false)}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                ✕ Hide
              </button>
            </div>
            <textarea
              value={savedNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add your notes, approach, or learnings here..."
              className="flex-1 p-4 text-sm bg-gray-800 text-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}

        {/* Show Notes Button when hidden */}
        {!showNotes && (
          <div className="border-t border-gray-700 bg-gray-800 px-4 py-2">
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              ↑ Show Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
