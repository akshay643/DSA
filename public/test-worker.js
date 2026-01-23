// Web Worker for safe JavaScript test execution
self.onmessage = function(e) {
  const { code, testCase, testIndex } = e.data;
  
  try {
    // Extract and execute the function
    let func;
    const functionMatch = code.match(/function\s+(\w+)\s*\(/);
    const arrowMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=/);
    
    if (functionMatch) {
      // Regular function declaration
      const functionName = functionMatch[1];
      let braceCount = 0;
      let functionStart = code.indexOf('function');
      let inFunction = false;
      let functionCode = code;
      
      for (let i = functionStart; i < code.length; i++) {
        if (code[i] === '{') {
          braceCount++;
          inFunction = true;
        } else if (code[i] === '}') {
          braceCount--;
          if (inFunction && braceCount === 0) {
            functionCode = code.substring(functionStart, i + 1);
            break;
          }
        }
      }
      
      const wrappedCode = `(function() { ${functionCode}; return ${functionName}; })()`;
      func = eval(wrappedCode);
    } else if (arrowMatch) {
      // Arrow function
      const lines = code.split('\n');
      const funcLines = [];
      let started = false;
      let braceCount = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (!started && (trimmed === '' || trimmed.startsWith('//'))) {
          continue;
        }
        
        if (!started && (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var '))) {
          started = true;
          funcLines.push(line);
          
          for (const char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
          
          if (line.includes('=>') && braceCount === 0) {
            break;
          }
          continue;
        }
        
        if (started) {
          funcLines.push(line);
          
          for (const char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
          
          if (braceCount === 0) {
            break;
          }
        }
      }
      
      const functionCode = funcLines.join('\n');
      const funcName = arrowMatch[1];
      eval(functionCode);
      func = eval(funcName);
    } else {
      func = eval(`(${code.trim()})`);
    }
    
    // Execute with inputs
    const startTime = performance.now();
    const inputArgs = Object.values(testCase.input);
    const result = func(...inputArgs);
    const endTime = performance.now();
    
    // Send success result
    self.postMessage({
      success: true,
      testIndex,
      result,
      executionTime: (endTime - startTime).toFixed(3),
      expected: testCase.output,
      input: testCase.input
    });
  } catch (error) {
    // Send error result
    self.postMessage({
      success: false,
      testIndex,
      error: error.message,
      input: testCase.input
    });
  }
};
