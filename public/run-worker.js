// Web Worker for safe JavaScript code execution
self.onmessage = function(e) {
  const { code } = e.data;
  
  try {
    // Capture console.log output
    const logs = [];
    const console = {
      log: (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      },
      error: (...args) => {
        logs.push('Error: ' + args.map(arg => String(arg)).join(' '));
      }
    };
    
    // Execute the code
    const result = eval(code);
    
    // Send success result
    let outputText = logs.join('\n');
    if (result !== undefined && logs.length === 0) {
      outputText = String(result);
    }
    
    self.postMessage({
      success: true,
      output: outputText || 'Code executed successfully (no output)'
    });
  } catch (error) {
    // Send error result
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};
