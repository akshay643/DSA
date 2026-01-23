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
    
    const code = savedCode || question.starterCode[language];
    
    try {
      if (language === 'javascript') {
        // Capture console.log output
        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args: any[]) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        };
        
        console.error = (...args: any[]) => {
          logs.push('Error: ' + args.map(arg => String(arg)).join(' '));
        };
        
        // Execute the code
        const result = eval(code);
        
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        
        // Show output
        let outputText = logs.join('\n');
        if (result !== undefined && logs.length === 0) {
          outputText = String(result);
        }
        setOutput(outputText || 'Code executed successfully (no output)');
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
        
        // Use Piston API for Java execution (free, no auth required)
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
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
    
    const code = savedCode || question.starterCode[language];
    
    try {
      if (language === 'javascript') {
        let results: string[] = [];
        let allPassed = true;
        let totalTime = 0;
        
        for (let i = 0; i < question.testCases.length; i++) {
          const testCase = question.testCases[i];
          
          try {
            // Prepare the function
            const startTime = performance.now();
            const func = eval(`(${code.trim()})`);
            const result = func(...Object.values(testCase.input));
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(3);
            totalTime += parseFloat(executionTime);
            
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
      } else if (language === 'python') {
        setOutput('Loading Python environment and running tests...\n\n');
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
        
        for (let i = 0; i < question.testCases.length; i++) {
          const testCase = question.testCases[i];
          
          try {
            const startTime = performance.now();
            
            // Build test code
            const inputValues = Object.values(testCase.input);
            const inputArgs = inputValues.map(v => JSON.stringify(v)).join(', ');
            const testCode = `${code}\n\nimport json\nresult = ${functionName}(${inputArgs})\nprint(json.dumps(result))`;
            
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
            
            // Build test code
            const inputValues = Object.values(testCase.input);
            const javaInputs = inputValues.map(v => {
              if (Array.isArray(v)) {
                return `new int[]{${v.join(',')}}`;
              } else if (typeof v === 'string') {
                return `"${v}"`;
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
            
            // Use Piston API for Java execution
            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
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
      setOutput(`Test Error: ${error.message}`);
    } finally {
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
          <button
            onClick={runTests}
            disabled={isRunning || !question.testCases}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            title="Run all test cases and check complexity"
          >
            <Check className="w-4 h-4" />
            {isRunning ? 'Testing...' : 'Run Tests'}
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
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
