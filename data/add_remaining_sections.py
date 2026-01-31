#!/usr/bin/env python3
"""
Add remaining sections (7-15) to the JavaScript Full Stack Interview Guide
"""

import json

# Read current file
with open('interviews/javascript-fullstack.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Current sections: {len(data['sections'])}")

# Define all remaining sections with Q&A
remaining_sections = [
    # Section 7: JavaScript - Event Loop
    {
        "id": "section-7",
        "title": "JavaScript - Event Loop",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. Explain the JavaScript Event Loop?"
            },
            {
                "type": "description",
                "content": "Event Loop enables async JavaScript. Call Stack executes synchronous code. Web APIs handle async operations (setTimeout, fetch). Callback Queue holds callbacks. Event Loop checks if Call Stack is empty, then moves callbacks from Queue to Stack. This allows non-blocking I/O."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Event Loop Example",
                "code": "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');\n// Output: 1, 4, 3, 2\n// Sync code → Microtasks (Promise) → Macrotasks (setTimeout)"
            },
            {
                "type": "interview-tip",
                "tip": "Event Loop Key Points",
                "explanation": "1. JavaScript is single-threaded\n2. Event Loop coordinates Call Stack, Web APIs, and Queues\n3. Microtasks (Promises) run before macrotasks (setTimeout)\n4. Each iteration: sync code → all microtasks → one macrotask"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. What is the difference between microtasks and macrotasks?"
            },
            {
                "type": "description",
                "content": "Microtasks (Promise callbacks, queueMicrotask) have higher priority and execute after current script but before next macrotask. Macrotasks (setTimeout, setInterval, I/O) execute one per event loop cycle. Order: Call Stack → Microtask Queue → Macrotask Queue."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Microtasks vs Macrotasks",
                "code": "setTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('promise'));\n// Output: promise, timeout\n// ALL microtasks complete before ANY macrotask"
            },
            {
                "type": "interview-tip",
                "tip": "Microtask vs Macrotask",
                "explanation": "MICROTASKS: Promise callbacks, queueMicrotask()\nMACROTASKS: setTimeout, setInterval, I/O\nKey: All microtasks execute before next macrotask\nMicrotasks can starve macrotasks if endless"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. Explain Node.js Event Loop phases?"
            },
            {
                "type": "description",
                "content": "Node.js Event Loop has phases: 1) Timers (setTimeout/setInterval), 2) Pending callbacks (I/O), 3) Idle/Prepare, 4) Poll (retrieve I/O events), 5) Check (setImmediate), 6) Close callbacks. Process.nextTick() and Promise callbacks run between phases in microtask queue."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Node.js Event Loop",
                "code": "// Inside I/O cycle:\nfs.readFile(__filename, () => {\n  setTimeout(() => console.log('timeout'), 0);\n  setImmediate(() => console.log('immediate'));\n});\n// Output: immediate, timeout\n// After poll → check (setImmediate) → next iteration timers"
            },
            {
                "type": "interview-tip",
                "tip": "Node.js Event Loop Phases",
                "explanation": "PHASES: Timers → Pending → Poll → Check → Close\nprocess.nextTick() runs before entering next phase\nsetImmediate after I/O runs before setTimeout\nRecursive setImmediate allows I/O (non-blocking)\nRecursive nextTick blocks event loop (dangerous!)"
            }
        ]
    },
    # Section 8: TypeScript
    {
        "id": "section-8",
        "title": "TypeScript",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. What are TypeScript generics and why use them?"
            },
            {
                "type": "description",
                "content": "Generics allow creating reusable components that work with multiple types while maintaining type safety. Syntax: function identity<T>(arg: T): T { return arg; }. Benefits: type safety, code reusability, better IDE support. Use for arrays, promises, functions, and classes."
            },
            {
                "type": "code",
                "language": "typescript",
                "title": "TypeScript Generics",
                "code": "// Generic function\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\nconst num = identity<number>(42);\nconst str = identity<string>('hello');\n\n// Generic interface\ninterface Box<T> {\n  value: T;\n}\n\nconst numBox: Box<number> = { value: 42 };\nconst strBox: Box<string> = { value: 'hello' };"
            },
            {
                "type": "interview-tip",
                "tip": "Generics Key Points",
                "explanation": "1. Type variables: <T>, <K, V>, <T extends BaseType>\n2. Use for arrays, promises, API responses\n3. Constraints: <T extends SomeType>\n4. Default types: <T = string>\n5. Benefits: Type safety + Reusability"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. Explain TypeScript utility types: Partial, Omit, ReturnType?"
            },
            {
                "type": "description",
                "content": "Partial<T> makes all properties optional. Omit<T, K> removes specified properties. ReturnType<T> extracts function return type. Example: type User = {name: string; age: number}; type PartialUser = Partial<User>; type NoAge = Omit<User, 'age'>; type Result = ReturnType<typeof func>;"
            },
            {
                "type": "code",
                "language": "typescript",
                "title": "Utility Types",
                "code": "type User = { name: string; age: number; email: string };\n\n// Partial - all optional\ntype PartialUser = Partial<User>;\nconst user1: PartialUser = { name: 'Alice' }; // OK\n\n// Omit - remove properties\ntype UserWithoutEmail = Omit<User, 'email'>;\n\n// ReturnType - extract return type\nfunction getUser() { return { name: 'Alice', age: 25 }; }\ntype UserType = ReturnType<typeof getUser>;\n\n// Pick - select properties\ntype UserNameAge = Pick<User, 'name' | 'age'>;"
            },
            {
                "type": "interview-tip",
                "tip": "Common Utility Types",
                "explanation": "Partial<T>: All optional\nRequired<T>: All required\nReadonly<T>: All readonly\nPick<T, K>: Select properties\nOmit<T, K>: Remove properties\nReturnType<T>: Extract return type\nParameters<T>: Extract parameter types"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. What are type guards in TypeScript?"
            },
            {
                "type": "description",
                "content": "Type guards narrow down types within conditional blocks. Built-in: typeof, instanceof. Custom: user-defined type predicates. Example: function isString(x: any): x is string { return typeof x === 'string'; }. TypeScript narrows type after guard check."
            },
            {
                "type": "code",
                "language": "typescript",
                "title": "Type Guards",
                "code": "// typeof guard\nfunction print(x: string | number) {\n  if (typeof x === 'string') {\n    console.log(x.toUpperCase()); // x is string\n  } else {\n    console.log(x.toFixed(2)); // x is number\n  }\n}\n\n// Custom type guard\nfunction isString(x: any): x is string {\n  return typeof x === 'string';\n}\n\nif (isString(value)) {\n  console.log(value.toUpperCase()); // Type narrowed\n}"
            },
            {
                "type": "interview-tip",
                "tip": "Type Guards Summary",
                "explanation": "BUILT-IN:\n- typeof: for primitives\n- instanceof: for classes\n- in: for property check\n\nCUSTOM:\n- Type predicates: x is Type\n- Used in if/switch statements\n- TypeScript narrows type automatically"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q4. Explain the 'infer' keyword in TypeScript?"
            },
            {
                "type": "description",
                "content": "infer introduces a type variable within conditional types to capture and use types. Example: type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never; This extracts return type from function signature. Useful for advanced type manipulations."
            },
            {
                "type": "code",
                "language": "typescript",
                "title": "Infer Keyword",
                "code": "// Extract return type\ntype ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\n\nfunction getUser() {\n  return { name: 'Alice', age: 25 };\n}\n\ntype User = ReturnType<typeof getUser>; // { name: string; age: number }\n\n// Extract array element type\ntype Flatten<T> = T extends Array<infer U> ? U : T;\n\ntype Num = Flatten<number[]>; // number\ntype Str = Flatten<string>; // string"
            },
            {
                "type": "interview-tip",
                "tip": "Infer Usage",
                "explanation": "1. Used in conditional types only\n2. Extracts types from generic parameters\n3. Common uses: ReturnType, Parameters, ElementType\n4. Syntax: T extends SomeType<infer U> ? U : never\n5. Advanced type-level programming"
            }
        ]
    },
    # Section 9: Web Security
    {
        "id": "section-9",
        "title": "Web Security",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. What is CORS and why is it important?"
            },
            {
                "type": "description",
                "content": "CORS (Cross-Origin Resource Sharing) is a security mechanism that allows controlled access to resources from different origins. Browser blocks cross-origin requests by default. Server must send Access-Control-Allow-Origin header. Prevents malicious sites from accessing user data from other sites."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "CORS Example",
                "code": "// Server-side (Node.js/Express)\napp.use((req, res, next) => {\n  res.header('Access-Control-Allow-Origin', '*');\n  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');\n  res.header('Access-Control-Allow-Headers', 'Content-Type');\n  next();\n});\n\n// Specific origin\nres.header('Access-Control-Allow-Origin', 'https://example.com');\n\n// With credentials\nres.header('Access-Control-Allow-Credentials', 'true');"
            },
            {
                "type": "interview-tip",
                "tip": "CORS Key Points",
                "explanation": "1. Browser security feature, not server-side\n2. Preflight requests for complex requests (OPTIONS)\n3. Simple requests: GET, POST with simple headers\n4. Credentials require explicit Allow-Credentials header\n5. '*' wildcard not allowed with credentials\n6. Set on server, enforced by browser"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. Explain XSS (Cross-Site Scripting) attacks and prevention?"
            },
            {
                "type": "description",
                "content": "XSS injects malicious scripts into trusted websites. Types: Stored, Reflected, DOM-based. Prevention: sanitize user input, use Content Security Policy, escape output, use textContent instead of innerHTML, validate on server, use frameworks with built-in protection."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "XSS Prevention",
                "code": "// BAD - Vulnerable to XSS\ndiv.innerHTML = userInput; // Can execute scripts!\n\n// GOOD - Safe\ndiv.textContent = userInput; // Treats as text\n\n// Sanitization\nfunction sanitize(input) {\n  const div = document.createElement('div');\n  div.textContent = input;\n  return div.innerHTML;\n}\n\n// CSP Header\nContent-Security-Policy: default-src 'self'; script-src 'self'\n\n// React auto-escapes\n<div>{userInput}</div> // Safe in React"
            },
            {
                "type": "interview-tip",
                "tip": "XSS Prevention",
                "explanation": "TYPES:\n1. Stored: Saved in database\n2. Reflected: In URL parameters\n3. DOM-based: Client-side only\n\nPREVENTION:\n- Sanitize input\n- Escape output\n- Use textContent, not innerHTML\n- Content Security Policy\n- HTTPOnly cookies\n- Framework protection (React, Angular)"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. What is CSRF (Cross-Site Request Forgery) and how to prevent it?"
            },
            {
                "type": "description",
                "content": "CSRF tricks users into executing unwanted actions on authenticated sites. Prevention: use CSRF tokens, SameSite cookie attribute, verify origin/referer headers, require re-authentication for sensitive actions, use custom headers for API requests."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "CSRF Prevention",
                "code": "// CSRF Token (server generates)\nconst token = generateSecureToken();\n\n// Include in form\n<input type=\"hidden\" name=\"csrf_token\" value={token} />\n\n// Verify on server\nif (req.body.csrf_token !== req.session.csrf_token) {\n  throw new Error('Invalid CSRF token');\n}\n\n// SameSite cookie\nres.cookie('session', value, { sameSite: 'strict' });\n\n// Custom header for AJAX\nfetch('/api/data', {\n  headers: { 'X-Requested-With': 'XMLHttpRequest' }\n});"
            },
            {
                "type": "interview-tip",
                "tip": "CSRF Prevention",
                "explanation": "METHODS:\n1. CSRF tokens (synchronizer token pattern)\n2. SameSite cookies (Strict/Lax)\n3. Verify Origin/Referer headers\n4. Double-submit cookie pattern\n5. Custom request headers\n6. Re-authentication for sensitive ops\n\nBEST: Combine multiple methods"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q4. Explain JWT (JSON Web Token) authentication?"
            },
            {
                "type": "description",
                "content": "JWT is a compact token format for securely transmitting information. Structure: Header.Payload.Signature (base64 encoded). Server signs token with secret. Client includes in Authorization header. Stateless authentication. Pros: scalable, works across domains. Cons: can't revoke before expiry, size larger than session ID."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "JWT Example",
                "code": "// Server: Generate JWT\nconst jwt = require('jsonwebtoken');\nconst token = jwt.sign(\n  { userId: 123, role: 'admin' },\n  process.env.SECRET_KEY,\n  { expiresIn: '1h' }\n);\n\n// Client: Send token\nfetch('/api/data', {\n  headers: {\n    'Authorization': `Bearer ${token}`\n  }\n});\n\n// Server: Verify token\nconst decoded = jwt.verify(token, process.env.SECRET_KEY);\nconsole.log(decoded.userId); // 123"
            },
            {
                "type": "interview-tip",
                "tip": "JWT Key Points",
                "explanation": "STRUCTURE:\nHeader.Payload.Signature (base64)\n\nPROS:\n- Stateless (no server storage)\n- Scalable\n- Cross-domain\n- Self-contained\n\nCONS:\n- Can't revoke before expiry\n- Larger than session ID\n- Exposed if XSS vulnerable\n\nBEST PRACTICES:\n- Short expiry time\n- Refresh tokens\n- HTTPOnly cookies for storage\n- Verify signature\n- Don't store sensitive data"
            }
        ]
    },
    # Section 10: Node.js
    {
        "id": "section-10",
        "title": "Node.js",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. Explain the difference between require() and import?"
            },
            {
                "type": "description",
                "content": "require() is CommonJS, synchronous, can be called conditionally, returns module.exports. import is ES6 modules, asynchronous, must be at top level, allows named imports. Node.js supports both but import requires .mjs extension or \"type\": \"module\" in package.json."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "require vs import",
                "code": "// CommonJS - require()\nconst express = require('express');\nconst { Router } = require('express');\n\n// Can be conditional\nif (condition) {\n  const module = require('./module');\n}\n\n// ES6 Modules - import\nimport express from 'express';\nimport { Router } from 'express';\nimport * as utils from './utils.js';\n\n// Must be at top level (not in if block)\n// import is hoisted"
            },
            {
                "type": "interview-tip",
                "tip": "require vs import",
                "explanation": "REQUIRE (CommonJS):\n- Synchronous\n- Dynamic (can be conditional)\n- Returns module.exports\n- Runtime\n- Default in Node.js\n\nIMPORT (ES Modules):\n- Asynchronous\n- Static (top level only)\n- Named + default imports\n- Compile-time\n- Needs .mjs or type: module\n\nBEST: Use import for new projects"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. What is the Node.js Event Loop and how does it differ from browser?"
            },
            {
                "type": "description",
                "content": "Node.js Event Loop handles async I/O operations. Phases: timers, pending callbacks, poll, check, close. Uses libuv for cross-platform async I/O. Browser event loop simpler: microtasks, macrotasks, rendering. Node.js optimized for server I/O, browser for user interactions and rendering."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Node.js vs Browser Event Loop",
                "code": "// Node.js specific\nprocess.nextTick(() => console.log('nextTick'));\nsetImmediate(() => console.log('setImmediate'));\n\n// Browser doesn't have:\n// - process.nextTick()\n// - setImmediate()\n\n// Browser has:\n// - requestAnimationFrame()\n// - requestIdleCallback()\n\n// Both have:\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('promise'));"
            },
            {
                "type": "interview-tip",
                "tip": "Node vs Browser Event Loop",
                "explanation": "NODE.JS:\n- Multiple phases (timers, poll, check, etc.)\n- process.nextTick(), setImmediate()\n- Optimized for I/O\n- libuv for async\n\nBROWSER:\n- Simpler (macrotasks, microtasks, render)\n- requestAnimationFrame(), requestIdleCallback()\n- Optimized for UI\n- Web APIs for async\n\nBOTH:\n- Single-threaded\n- setTimeout, Promises"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. Explain streams in Node.js and their types?"
            },
            {
                "type": "description",
                "content": "Streams handle reading/writing data in chunks, efficient for large data. Types: Readable (read data), Writable (write data), Duplex (both), Transform (modify data). Benefits: memory efficient, time efficient. Example: fs.createReadStream().pipe(response)."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Node.js Streams",
                "code": "const fs = require('fs');\n\n// Readable stream\nconst readStream = fs.createReadStream('large-file.txt');\nreadStream.on('data', (chunk) => {\n  console.log('Received chunk:', chunk.length);\n});\n\n// Writable stream\nconst writeStream = fs.createWriteStream('output.txt');\nwriteStream.write('Hello ');\nwriteStream.end('World!');\n\n// Pipe (readable to writable)\nreadStream.pipe(writeStream);\n\n// Transform stream\nconst { Transform } = require('stream');\nconst upperCase = new Transform({\n  transform(chunk, encoding, callback) {\n    callback(null, chunk.toString().toUpperCase());\n  }\n});\n\nreadStream.pipe(upperCase).pipe(writeStream);"
            },
            {
                "type": "interview-tip",
                "tip": "Streams Summary",
                "explanation": "TYPES:\n1. Readable: fs.createReadStream(), HTTP request\n2. Writable: fs.createWriteStream(), HTTP response\n3. Duplex: TCP socket (both directions)\n4. Transform: zlib, crypto (modify data)\n\nBENEFITS:\n- Memory efficient (chunks, not whole file)\n- Time efficient (start processing immediately)\n- Composable (pipe)\n\nUSE CASES:\n- Large files\n- Network I/O\n- Data transformation"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q4. What is the difference between fork() and spawn() in child processes?"
            },
            {
                "type": "description",
                "content": "spawn() launches a new process for any command, returns stdout/stderr streams. fork() is special case of spawn() for Node.js processes, enables IPC (Inter-Process Communication) via send()/on('message'). Use fork() for Node scripts, spawn() for any command."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "fork vs spawn",
                "code": "const { spawn, fork } = require('child_process');\n\n// spawn - for any command\nconst ls = spawn('ls', ['-lh', '/usr']);\nls.stdout.on('data', (data) => {\n  console.log(`Output: ${data}`);\n});\n\n// fork - for Node.js scripts (with IPC)\nconst child = fork('worker.js');\nchild.send({ task: 'process-data', data: [1,2,3] });\nchild.on('message', (result) => {\n  console.log('Result from child:', result);\n});\n\n// worker.js\nprocess.on('message', (msg) => {\n  const result = msg.data.reduce((a,b) => a+b, 0);\n  process.send({ result });\n});"
            },
            {
                "type": "interview-tip",
                "tip": "fork vs spawn",
                "explanation": "SPAWN:\n- Any command (ls, python, etc.)\n- Returns streams (stdout, stderr)\n- No built-in IPC\n- More generic\n\nFORK:\n- Node.js scripts only\n- Built-in IPC (send/on('message'))\n- Specialized spawn for Node\n- Communication-friendly\n\nOTHERS:\n- exec(): buffers output\n- execFile(): like exec but for files\n\nUSE:\n- fork() for Node worker processes\n- spawn() for shell commands"
            }
        ]
    },
    # Section 11: Angular
    {
        "id": "section-11",
        "title": "Angular",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. Explain Angular Change Detection strategies?"
            },
            {
                "type": "description",
                "content": "Default: checks entire component tree on events. OnPush: checks only when @Input reference changes or events occur within component. Benefits: performance improvement. Use ChangeDetectorRef to manually trigger. NgZone tracks async operations. markForCheck() marks path to root for checking."
            },
            {
                "type": "code",
                "language": "typescript",
                "title": "Change Detection Strategies",
                "code": "// Default strategy - checks on every event\n@Component({\n  selector: 'app-default',\n  template: `<div>{{ data.value }}</div>`\n})\nexport class DefaultComponent {}\n\n// OnPush strategy - checks only on @Input changes\n@Component({\n  selector: 'app-optimized',\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `<div>{{ data.value }}</div>`\n})\nexport class OptimizedComponent {\n  @Input() data: any;\n  \n  constructor(private cdr: ChangeDetectorRef) {}\n  \n  updateManually() {\n    this.cdr.markForCheck(); // Mark for check\n    this.cdr.detectChanges(); // Run immediately\n  }\n}"
            },
            {
                "type": "interview-tip",
                "tip": "Change Detection",
                "explanation": "DEFAULT:\n- Checks entire tree\n- On every event\n- Simple but slower\n\nONPUSH:\n- Checks only on @Input reference change\n- Or component events\n- Better performance\n- Use with immutable data\n\nMANUAL:\n- markForCheck(): schedule check\n- detectChanges(): run immediately\n- detach(): stop checking\n- reattach(): resume checking"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. What is the difference between template-driven and reactive forms?"
            },
            {
                "type": "description",
                "content": "Template-driven: logic in template, uses ngModel, async, easier for simple forms. Reactive: logic in component class, uses FormControl/FormGroup, synchronous, better for complex forms, more testable, better validation control."
            },
            {
                "type": "code",
                "language": "typescript",
                "title": "Forms Comparison",
                "code": "// Template-driven form\n@Component({\n  template: `\n    <form #form=\"ngForm\" (ngSubmit)=\"onSubmit(form)\">\n      <input name=\"name\" [(ngModel)]=\"user.name\" required>\n      <button [disabled]=\"!form.valid\">Submit</button>\n    </form>\n  `\n})\nexport class TemplateFormComponent {\n  user = { name: '' };\n  onSubmit(form: NgForm) {\n    console.log(form.value);\n  }\n}\n\n// Reactive form\n@Component({\n  template: `\n    <form [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\">\n      <input formControlName=\"name\">\n      <button [disabled]=\"!form.valid\">Submit</button>\n    </form>\n  `\n})\nexport class ReactiveFormComponent {\n  form = new FormGroup({\n    name: new FormControl('', Validators.required)\n  });\n  \n  onSubmit() {\n    console.log(this.form.value);\n  }\n}"
            },
            {
                "type": "interview-tip",
                "tip": "Forms Comparison",
                "explanation": "TEMPLATE-DRIVEN:\n- Logic in template\n- ngModel, #form\n- Async (forms module)\n- Simple forms\n- Less testable\n\nREACTIVE:\n- Logic in component\n- FormControl, FormGroup\n- Synchronous\n- Complex forms\n- More testable\n- Better validation\n- Programmatic control\n\nBEST: Reactive for most cases"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. Explain RxJS operators: map, switchMap, mergeMap, concatMap?"
            },
            {
                "type": "description",
                "content": "map: transforms emitted values. switchMap: cancels previous inner observable, use for search/autocomplete. mergeMap: runs inner observables concurrently, maintains order not guaranteed. concatMap: queues inner observables, maintains order. Choose based on whether you need cancellation, concurrency, or ordering."
            },
            {
                "type": "code",
                "language": "typescript",
                "title": "RxJS Operators",
                "code": "// map - transform values\nof(1, 2, 3).pipe(\n  map(x => x * 2)\n).subscribe(x => console.log(x)); // 2, 4, 6\n\n// switchMap - cancel previous\nsearchBox.valueChanges.pipe(\n  switchMap(term => this.api.search(term))\n).subscribe(results => {...});\n// Cancels previous search if new input\n\n// mergeMap - concurrent\nof(1, 2, 3).pipe(\n  mergeMap(x => this.api.getData(x))\n).subscribe(result => {...});\n// All requests run concurrently\n\n// concatMap - sequential\nof(1, 2, 3).pipe(\n  concatMap(x => this.api.saveData(x))\n).subscribe(result => {...});\n// Waits for each to complete before next"
            },
            {
                "type": "interview-tip",
                "tip": "RxJS Operators Summary",
                "explanation": "MAP:\n- Transforms values\n- Synchronous\n\nSWITCHMAP:\n- Cancels previous\n- Use: search, autocomplete\n- Latest value wins\n\nMERGEMAP:\n- Concurrent\n- No cancellation\n- Order not guaranteed\n\nCONCATMAP:\n- Sequential queue\n- Order maintained\n- Use: sequential operations\n\nCHOOSE:\n- Need cancel? switchMap\n- Need order? concatMap\n- Need speed? mergeMap"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q4. What is Dependency Injection in Angular?"
            },
            {
                "type": "description",
                "content": "DI is a design pattern where dependencies are provided to a class rather than created by it. Angular's DI system: @Injectable() marks service, providers array registers, constructor injection receives. Benefits: testability, loose coupling, code reuse. Hierarchical injector tree from root to component."
            },
            {
                "type": "code",
                "language": "typescript",
                "title": "Dependency Injection",
                "code": "// Service with @Injectable\n@Injectable({ providedIn: 'root' })\nexport class DataService {\n  getData() { return [1, 2, 3]; }\n}\n\n// Component injects service\n@Component({\n  selector: 'app-my-component',\n  template: `<div>{{ data }}</div>`\n})\nexport class MyComponent {\n  data: number[];\n  \n  // Constructor injection\n  constructor(private dataService: DataService) {\n    this.data = dataService.getData();\n  }\n}\n\n// Module-level provider\n@NgModule({\n  providers: [\n    { provide: API_URL, useValue: 'https://api.example.com' }\n  ]\n})\nexport class AppModule {}"
            },
            {
                "type": "interview-tip",
                "tip": "Dependency Injection",
                "explanation": "BENEFITS:\n1. Testability (mock dependencies)\n2. Loose coupling\n3. Code reuse\n4. Configuration management\n\nPROVIDERS:\n- providedIn: 'root' (singleton)\n- providers: [] in module/component\n- useClass, useValue, useFactory\n\nINJECTOR TREE:\n- Root injector\n- Module injectors\n- Component injectors\n\nLIFETIME:\n- Root: app lifetime\n- Module: lazy-loaded lifetime\n- Component: component lifetime"
            }
        ]
    },
    # Section 12: Testing
    {
        "id": "section-12",
        "title": "Testing",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. Explain the Testing Pyramid?"
            },
            {
                "type": "description",
                "content": "Testing Pyramid shows test distribution: base is Unit tests (most, fast, isolated), middle is Integration tests (moderate, test interactions), top is E2E tests (few, slow, test full system). More unit tests provide fast feedback, fewer E2E reduce maintenance and execution time."
            },
            {
                "type": "code",
                "language": "text",
                "title": "Testing Pyramid",
                "code": "       /\\        E2E Tests (Few, Slow, Expensive)\n      /  \\       - Test full user flows\n     /    \\      - Browser automation\n    /------\\     Integration Tests (Some, Medium)\n   / INTEGR \\    - Test component interactions\n  /----------\\   - API + DB tests\n /   UNIT     \\  Unit Tests (Many, Fast, Cheap)\n/--------------\\ - Test individual functions\n                 - Isolated, mocked dependencies"
            },
            {
                "type": "interview-tip",
                "tip": "Testing Pyramid",
                "explanation": "UNIT TESTS (70%):\n- Fast, isolated\n- Test functions/methods\n- Mock dependencies\n- High coverage\n\nINTEGRATION (20%):\n- Test interactions\n- API + DB\n- Component integration\n\nE2E (10%):\n- Full user flows\n- Slow, expensive\n- Critical paths only\n\nBENEFITS:\n- Fast feedback (unit)\n- Confidence (E2E)\n- Balance cost/value"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. What is the difference between unit, integration, and E2E testing?"
            },
            {
                "type": "description",
                "content": "Unit: test individual functions/components in isolation, fast, mocked dependencies. Integration: test interaction between components/modules, moderate speed. E2E: test entire application flow from user perspective, slow, most realistic. Each serves different purpose in quality assurance."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Test Types Examples",
                "code": "// Unit test - isolated function\ndescribe('calculateTotal', () => {\n  it('should sum prices', () => {\n    expect(calculateTotal([10, 20, 30])).toBe(60);\n  });\n});\n\n// Integration test - component + service\ndescribe('UserComponent + UserService', () => {\n  it('should load user data', async () => {\n    const component = new UserComponent(userService);\n    await component.loadUser(123);\n    expect(component.user.name).toBe('Alice');\n  });\n});\n\n// E2E test - full user flow\ntest('user can complete checkout', async () => {\n  await page.goto('/shop');\n  await page.click('.add-to-cart');\n  await page.click('.checkout');\n  await page.fill('#card-number', '4111111111111111');\n  await page.click('.submit-order');\n  await expect(page.locator('.success')).toBeVisible();\n});"
            },
            {
                "type": "interview-tip",
                "tip": "Test Types Comparison",
                "explanation": "UNIT:\n- Scope: Single function/class\n- Speed: Fast (milliseconds)\n- Dependencies: Mocked\n- Isolation: High\n- Tools: Jest, Mocha\n\nINTEGRATION:\n- Scope: Multiple components\n- Speed: Medium (seconds)\n- Dependencies: Real or partial mocks\n- Isolation: Medium\n- Tools: Jest + testing-library\n\nE2E:\n- Scope: Full application\n- Speed: Slow (minutes)\n- Dependencies: Real (browser, DB)\n- Isolation: Low\n- Tools: Cypress, Playwright, Selenium"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. Explain test doubles: mock, stub, spy, fake?"
            },
            {
                "type": "description",
                "content": "Stub: provides predetermined responses. Mock: verifies interactions, expectations set beforehand. Spy: wraps real object, records interactions. Fake: working implementation but simplified. Use based on whether you're testing behavior (mock) or state (stub), or need partial functionality (spy)."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Test Doubles",
                "code": "// Stub - returns predefined values\nconst userServiceStub = {\n  getUser: () => ({ id: 1, name: 'Alice' })\n};\n\n// Mock - verifies interactions\nconst mockService = jest.fn();\nmockService.getUser = jest.fn().mockResolvedValue({ id: 1 });\nexpect(mockService.getUser).toHaveBeenCalledWith(123);\n\n// Spy - wraps real object\nconst spy = jest.spyOn(userService, 'getUser');\nawait component.loadUser(123);\nexpect(spy).toHaveBeenCalledTimes(1);\nspy.mockRestore();\n\n// Fake - simplified working implementation\nclass FakeDatabase {\n  private data = new Map();\n  save(key, value) { this.data.set(key, value); }\n  get(key) { return this.data.get(key); }\n}"
            },
            {
                "type": "interview-tip",
                "tip": "Test Doubles Summary",
                "explanation": "STUB:\n- Returns fixed values\n- State verification\n- Simple, predictable\n\nMOCK:\n- Behavior verification\n- Expectations set before\n- Verifies calls, arguments\n\nSPY:\n- Wraps real object\n- Records calls\n- Can call through or mock\n\nFAKE:\n- Working implementation\n- Simplified (in-memory DB)\n- Not production-ready\n\nDUMMY:\n- Placeholder\n- Never used\n- Fill parameters"
            }
        ]
    },
    # Section 13: CI/CD & DevOps
    {
        "id": "section-13",
        "title": "CI/CD & DevOps",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. What is the difference between CI and CD?"
            },
            {
                "type": "description",
                "content": "CI (Continuous Integration): automatically build and test code on each commit, detect integration issues early. CD (Continuous Delivery): automated deployment to staging, manual production release. CD (Continuous Deployment): fully automated deployment to production. CI focuses on quality, CD on deployment."
            },
            {
                "type": "code",
                "language": "yaml",
                "title": "CI/CD Pipeline Example",
                "code": "# .github/workflows/ci-cd.yml\nname: CI/CD Pipeline\n\non: [push, pull_request]\n\njobs:\n  # Continuous Integration\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - run: npm install\n      - run: npm test\n      - run: npm run lint\n  \n  # Continuous Deployment\n  deploy:\n    needs: test\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm run build\n      - run: npm run deploy"
            },
            {
                "type": "interview-tip",
                "tip": "CI vs CD",
                "explanation": "CI (Continuous Integration):\n- Merge code frequently\n- Auto build + test\n- Fast feedback\n- Catch bugs early\n\nCD (Continuous Delivery):\n- Auto deploy to staging\n- Manual prod deploy\n- Release-ready always\n\nCD (Continuous Deployment):\n- Auto deploy to prod\n- No manual gate\n- Full automation\n\nBENEFITS:\n- Faster releases\n- Lower risk\n- Better quality\n- Team efficiency"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. Explain different deployment strategies?"
            },
            {
                "type": "description",
                "content": "Blue-Green: two identical environments, switch traffic. Canary: gradual rollout to subset of users. Rolling: update instances incrementally. A/B Testing: route users to different versions. Feature Flags: control feature availability. Choose based on risk tolerance, rollback needs, and testing requirements."
            },
            {
                "type": "code",
                "language": "text",
                "title": "Deployment Strategies",
                "code": "BLUE-GREEN:\n  Blue (old) ← 100% traffic\n  Green (new) ← 0% traffic\n  → Switch → Green gets 100%\n  → Quick rollback to Blue if issues\n\nCANARY:\n  v1.0 ← 90% traffic\n  v2.0 ← 10% traffic (canary)\n  → Gradually increase v2.0\n  → Monitor metrics\n  → Rollback if errors spike\n\nROLLING:\n  Instances: [v1, v1, v1, v1]\n  → Update 1: [v2, v1, v1, v1]\n  → Update 2: [v2, v2, v1, v1]\n  → Update 3: [v2, v2, v2, v1]\n  → Update 4: [v2, v2, v2, v2]"
            },
            {
                "type": "interview-tip",
                "tip": "Deployment Strategies",
                "explanation": "BLUE-GREEN:\n- Zero downtime\n- Quick rollback\n- 2x infrastructure cost\n\nCANARY:\n- Gradual rollout\n- Monitor subset\n- Detect issues early\n\nROLLING:\n- No extra infrastructure\n- Gradual update\n- Mixed versions running\n\nFEATURE FLAGS:\n- Toggle features\n- A/B testing\n- Gradual rollout\n- No deployment needed\n\nCHOOSE BASED ON:\n- Risk tolerance\n- Infrastructure cost\n- Rollback speed needed"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. What is Infrastructure as Code (IaC)?"
            },
            {
                "type": "description",
                "content": "IaC manages infrastructure through code files rather than manual processes. Benefits: version control, reproducibility, automation. Tools: Terraform (cloud-agnostic), CloudFormation (AWS), Kubernetes manifests. Enables consistent environments, faster provisioning, and infrastructure versioning."
            },
            {
                "type": "code",
                "language": "hcl",
                "title": "Infrastructure as Code Example",
                "code": "# Terraform example\nresource \"aws_instance\" \"web_server\" {\n  ami           = \"ami-0c55b159cbfafe1f0\"\n  instance_type = \"t2.micro\"\n  \n  tags = {\n    Name = \"WebServer\"\n    Environment = \"Production\"\n  }\n}\n\nresource \"aws_s3_bucket\" \"assets\" {\n  bucket = \"my-app-assets\"\n  acl    = \"private\"\n}\n\n# Apply with:\n# terraform init\n# terraform plan\n# terraform apply"
            },
            {
                "type": "interview-tip",
                "tip": "Infrastructure as Code",
                "explanation": "BENEFITS:\n1. Version control (Git)\n2. Reproducibility\n3. Documentation as code\n4. Automation\n5. Consistent environments\n6. Disaster recovery\n\nTOOLS:\n- Terraform: Multi-cloud\n- CloudFormation: AWS\n- Pulumi: Real programming languages\n- Ansible: Configuration management\n- Kubernetes: Container orchestration\n\nBEST PRACTICES:\n- Modular code\n- Environment separation\n- State management\n- Code review\n- Automated testing"
            }
        ]
    },
    # Section 14: Databases
    {
        "id": "section-14",
        "title": "Databases",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. Explain ACID properties in databases?"
            },
            {
                "type": "description",
                "content": "Atomicity: all operations succeed or all fail. Consistency: data remains valid after transaction. Isolation: concurrent transactions don't interfere. Durability: completed transactions persist despite failures. Ensures data integrity in RDBMS. NoSQL databases often trade ACID for performance/scalability (BASE model)."
            },
            {
                "type": "code",
                "language": "sql",
                "title": "ACID Example",
                "code": "-- Atomicity: All or nothing\nBEGIN TRANSACTION;\n  UPDATE accounts SET balance = balance - 100 WHERE id = 1;\n  UPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT; -- Both succeed or both fail\n\n-- Isolation: Concurrent transactions don't interfere\n-- Transaction 1:\nBEGIN TRANSACTION;\n  SELECT balance FROM accounts WHERE id = 1; -- 1000\n  -- Another transaction updates balance here\n  UPDATE accounts SET balance = balance - 100 WHERE id = 1;\nCOMMIT;\n\n-- Consistency: Constraints enforced\nCREATE TABLE users (\n  id INT PRIMARY KEY,\n  age INT CHECK (age >= 0 AND age <= 150)\n);\n-- Invalid age throws error\n\n-- Durability: Persists after commit\nCOMMIT; -- Data written to disk, survives crashes"
            },
            {
                "type": "interview-tip",
                "tip": "ACID Properties",
                "explanation": "ATOMICITY:\n- All or nothing\n- Transaction unit\n- Rollback on failure\n\nCONSISTENCY:\n- Valid state always\n- Constraints enforced\n- Integrity maintained\n\nISOLATION:\n- Concurrent transactions\n- Levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable\n- Prevent dirty reads, phantom reads\n\nDURABILITY:\n- Persists on commit\n- Survives crashes\n- Write-ahead logging\n\nVS BASE (NoSQL):\n- Basically Available\n- Soft state\n- Eventual consistency"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. What is database normalization?"
            },
            {
                "type": "description",
                "content": "Normalization organizes data to reduce redundancy and improve integrity. 1NF: atomic values, unique rows. 2NF: no partial dependencies. 3NF: no transitive dependencies. Benefits: less redundancy, easier maintenance. Drawbacks: more joins, potential performance impact. Denormalization trades redundancy for read performance."
            },
            {
                "type": "code",
                "language": "sql",
                "title": "Normalization Example",
                "code": "-- Unnormalized (redundant data)\nCREATE TABLE orders (\n  order_id INT,\n  customer_name VARCHAR(100),\n  customer_email VARCHAR(100),\n  product_name VARCHAR(100),\n  product_price DECIMAL\n);\n-- Customer data repeated for each order!\n\n-- 1NF: Atomic values, no repeating groups\n-- 2NF: Separate customers\nCREATE TABLE customers (\n  customer_id INT PRIMARY KEY,\n  name VARCHAR(100),\n  email VARCHAR(100)\n);\n\n-- 3NF: Separate products\nCREATE TABLE products (\n  product_id INT PRIMARY KEY,\n  name VARCHAR(100),\n  price DECIMAL\n);\n\nCREATE TABLE orders (\n  order_id INT PRIMARY KEY,\n  customer_id INT,\n  product_id INT,\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\n\n-- Benefits: No redundancy, easier updates\n-- Drawback: Joins needed for queries"
            },
            {
                "type": "interview-tip",
                "tip": "Normalization",
                "explanation": "NORMAL FORMS:\n1NF:\n- Atomic values\n- No repeating groups\n- Unique rows (primary key)\n\n2NF:\n- 1NF +\n- No partial dependencies\n- Non-key attributes depend on whole key\n\n3NF:\n- 2NF +\n- No transitive dependencies\n- Non-key attributes depend only on key\n\nBENEFITS:\n- Reduced redundancy\n- Data integrity\n- Easier updates\n\nDRAWBACKS:\n- More joins\n- Potential performance impact\n\nDENORMALIZATION:\n- Add redundancy for performance\n- Fewer joins\n- Faster reads, slower writes"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. Explain the difference between SQL and NoSQL databases?"
            },
            {
                "type": "description",
                "content": "SQL: relational, structured schema, ACID, vertical scaling, complex queries (joins). Examples: PostgreSQL, MySQL. NoSQL: non-relational, flexible schema, eventual consistency (often), horizontal scaling, simple queries. Types: Document (MongoDB), Key-Value (Redis), Column (Cassandra), Graph (Neo4j). Choose based on data structure, scale, consistency needs."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "SQL vs NoSQL Examples",
                "code": "// SQL (PostgreSQL)\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100),\n  email VARCHAR(100) UNIQUE\n);\n\nSELECT u.name, o.total\nFROM users u\nJOIN orders o ON u.id = o.user_id\nWHERE o.total > 100;\n\n// NoSQL (MongoDB) - Document\ndb.users.insertOne({\n  _id: ObjectId(\"...\"),\n  name: \"Alice\",\n  email: \"alice@example.com\",\n  orders: [\n    { id: 1, total: 150, items: [...] },\n    { id: 2, total: 200, items: [...] }\n  ]\n});\n\n// Query embedded documents\ndb.users.find({\n  \"orders.total\": { $gt: 100 }\n});\n\n// NoSQL (Redis) - Key-Value\nSET user:123:name \"Alice\"\nGET user:123:name\nSETEX session:abc123 3600 \"user_data\" // Expires in 1 hour"
            },
            {
                "type": "interview-tip",
                "tip": "SQL vs NoSQL",
                "explanation": "SQL (Relational):\n- Structured schema\n- ACID transactions\n- Joins, complex queries\n- Vertical scaling\n- Use: Financial, ERP, traditional apps\n- Examples: PostgreSQL, MySQL, Oracle\n\nNOSQL (Non-relational):\n- Flexible schema\n- Eventual consistency (often)\n- Simple queries\n- Horizontal scaling\n- Types:\n  * Document: MongoDB, CouchDB\n  * Key-Value: Redis, DynamoDB\n  * Column: Cassandra, HBase\n  * Graph: Neo4j, ArangoDB\n\nCHOOSE SQL:\n- Structured data\n- Complex relationships\n- ACID requirements\n- Strong consistency\n\nCHOOSE NOSQL:\n- Unstructured/semi-structured data\n- Massive scale\n- High write throughput\n- Flexible schema"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q4. What is the CAP theorem?"
            },
            {
                "type": "description",
                "content": "CAP states distributed systems can only guarantee 2 of 3: Consistency (all nodes see same data), Availability (every request gets response), Partition tolerance (system continues despite network issues). In practice, partition tolerance is required, so choose between CP (consistency) or AP (availability). MongoDB: CP, Cassandra: AP."
            },
            {
                "type": "code",
                "language": "text",
                "title": "CAP Theorem",
                "code": "CAP Theorem: Choose 2 of 3\n\n┌─────────────────────────────────┐\n│  CONSISTENCY (C)                │\n│  All nodes see same data        │\n│  at same time                   │\n└─────────────────────────────────┘\n         ↙        ↘\n    CP Systems  CA Systems\n    (MongoDB)   (Traditional RDBMS)\n         ↖        ↗\n┌─────────────────────────────────┐\n│  PARTITION TOLERANCE (P)        │\n│  System works despite           │\n│  network partitions             │\n└─────────────────────────────────┘\n         ↙        ↘\n    CP Systems  AP Systems\n               (Cassandra, DynamoDB)\n         ↖        ↗\n┌─────────────────────────────────┐\n│  AVAILABILITY (A)               │\n│  Every request gets response    │\n│  (no guarantees on data)        │\n└─────────────────────────────────┘\n\nREALITY: Must have P (partition tolerance)\nSo really: Choose C or A\n\nCP: Consistency over Availability\n- MongoDB, HBase, Redis\n- Sacrifice availability during partition\n\nAP: Availability over Consistency\n- Cassandra, DynamoDB, CouchDB\n- Sacrifice consistency (eventual)"
            },
            {
                "type": "interview-tip",
                "tip": "CAP Theorem",
                "explanation": "PROPERTIES:\nC (Consistency):\n- All nodes same data\n- Linearizability\n- Strong consistency\n\nA (Availability):\n- Every request responds\n- No timeouts\n- Always accessible\n\nP (Partition Tolerance):\n- Works despite network split\n- Required in distributed systems\n\nTRADEOFFS:\nCP (Consistency + Partition):\n- Reject writes during partition\n- MongoDB, HBase\n- Use: Financial, inventory\n\nAP (Availability + Partition):\n- Accept writes, eventual consistency\n- Cassandra, DynamoDB\n- Use: Social media, analytics\n\nREAL WORLD:\n- P is mandatory\n- Choose C or A based on needs\n- Often tunable per operation"
            }
        ]
    },
    # Section 15: Performance Optimization
    {
        "id": "section-15",
        "title": "Performance Optimization",
        "blocks": [
            {
                "type": "title",
                "level": 2,
                "content": "Q1. Explain Critical Rendering Path?"
            },
            {
                "type": "description",
                "content": "Sequence browser follows to render page: 1) Parse HTML → DOM, 2) Parse CSS → CSSOM, 3) Combine into Render Tree, 4) Layout (calculate positions), 5) Paint (pixels). Optimize: minimize critical resources, reduce file sizes, use async/defer for scripts, inline critical CSS."
            },
            {
                "type": "code",
                "language": "html",
                "title": "Critical Rendering Path Optimization",
                "code": "<!-- 1. Minimize critical resources -->\n<!-- Inline critical CSS -->\n<style>\n  /* Above-the-fold styles */\n  body { margin: 0; font-family: Arial; }\n  .header { height: 60px; background: #333; }\n</style>\n\n<!-- Defer non-critical CSS -->\n<link rel=\"preload\" href=\"styles.css\" as=\"style\"\n      onload=\"this.onload=null;this.rel='stylesheet'\">\n\n<!-- 2. Async/Defer scripts -->\n<script src=\"analytics.js\" async></script>\n<script src=\"app.js\" defer></script>\n\n<!-- 3. Resource hints -->\n<link rel=\"dns-prefetch\" href=\"//cdn.example.com\">\n<link rel=\"preconnect\" href=\"https://api.example.com\">\n\n<!-- 4. Minimize render-blocking -->\n<!-- Bad: blocks rendering -->\n<script src=\"large-library.js\"></script>\n\n<!-- Good: doesn't block -->\n<script src=\"large-library.js\" defer></script>"
            },
            {
                "type": "interview-tip",
                "tip": "Critical Rendering Path",
                "explanation": "STEPS:\n1. Parse HTML → DOM\n2. Parse CSS → CSSOM\n3. DOM + CSSOM → Render Tree\n4. Layout (box model, positions)\n5. Paint (pixels to screen)\n\nOPTIMIZATIONS:\n- Minimize critical resources\n- Reduce file sizes (minify, compress)\n- Inline critical CSS\n- Async/defer non-critical JS\n- Resource hints (dns-prefetch, preconnect)\n- Lazy load below-fold content\n\nMETRICS:\n- First Contentful Paint (FCP)\n- Largest Contentful Paint (LCP)\n- Time to Interactive (TTI)"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q2. What causes reflow and repaint, and how to minimize?"
            },
            {
                "type": "description",
                "content": "Reflow: browser recalculates layout (adding/removing elements, changing dimensions). Repaint: browser redraws pixels (color changes). Reflow triggers repaint. Minimize: batch DOM changes, use transform/opacity for animations (compositing), avoid forced synchronous layout, use requestAnimationFrame()."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Reflow and Repaint",
                "code": "// CAUSES REFLOW (expensive):\nelement.style.width = '100px'; // Geometry change\nelement.classList.add('visible'); // May affect layout\nconst height = element.offsetHeight; // Forces layout calculation\n\n// CAUSES REPAINT (cheaper):\nelement.style.color = 'red'; // Visual change only\nelement.style.backgroundColor = 'blue';\n\n// BAD: Multiple reflows\nelement.style.width = '100px';  // Reflow 1\nelement.style.height = '100px'; // Reflow 2\nelement.style.margin = '10px';  // Reflow 3\n\n// GOOD: Batch changes\nelement.style.cssText = 'width: 100px; height: 100px; margin: 10px';\n// or\nelement.className = 'new-class'; // Single reflow\n\n// BAD: Forced synchronous layout\nfor (let i = 0; i < 100; i++) {\n  element.style.width = i + 'px';\n  const width = element.offsetWidth; // Forces layout each iteration!\n}\n\n// GOOD: Read then write\nconst widths = [];\nfor (let i = 0; i < 100; i++) {\n  widths.push(element.offsetWidth); // Batch reads\n}\nfor (let i = 0; i < 100; i++) {\n  element.style.width = widths[i] + 10 + 'px'; // Batch writes\n}\n\n// BEST: Use transform (no reflow!)\n// Bad: Causes reflow\nelement.style.left = '100px';\n\n// Good: Uses compositing\nelement.style.transform = 'translateX(100px)';\n\n// Animations\n// Bad: Reflows on every frame\nlet pos = 0;\nsetInterval(() => {\n  element.style.left = pos++ + 'px';\n}, 16);\n\n// Good: Uses compositing\nlet pos = 0;\nfunction animate() {\n  element.style.transform = `translateX(${pos++}px)`;\n  requestAnimationFrame(animate);\n}\nrequestAnimationFrame(animate);"
            },
            {
                "type": "interview-tip",
                "tip": "Reflow and Repaint",
                "explanation": "REFLOW (Layout):\n- Geometry changes (width, height, position)\n- Adding/removing elements\n- Changing text content\n- Window resize\n- Expensive (recalculates positions)\n\nREPAINT (Paint):\n- Visual changes only (color, visibility)\n- Follows reflow\n- Cheaper than reflow\n\nMINIMIZE:\n1. Batch DOM changes\n2. Use transform/opacity (compositing)\n3. Avoid forced sync layout\n4. Use requestAnimationFrame()\n5. CSS containment\n6. Virtual scrolling\n\nCOMPOSITING (Best):\n- transform, opacity\n- No reflow or repaint\n- GPU accelerated\n- Smoothest animations"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q3. Explain different types of caching?"
            },
            {
                "type": "description",
                "content": "Browser: Cache-Control headers, Service Workers. Application: in-memory (Redis, Memcached), HTTP caching. CDN: edge caching for static assets. Database: query results caching. Strategies: Cache-aside, Write-through, Write-behind. Choose based on data volatility, read/write patterns, consistency requirements."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Caching Strategies",
                "code": "// 1. HTTP Caching Headers\n// Server response:\nCache-Control: public, max-age=3600\nETag: \"abc123\"\n\n// 2. Service Worker Cache\nself.addEventListener('install', (event) => {\n  event.waitUntil(\n    caches.open('v1').then((cache) => {\n      return cache.addAll([\n        '/styles.css',\n        '/script.js',\n        '/logo.png'\n      ]);\n    })\n  );\n});\n\nself.addEventListener('fetch', (event) => {\n  event.respondWith(\n    caches.match(event.request).then((response) => {\n      return response || fetch(event.request);\n    })\n  );\n});\n\n// 3. In-memory cache (simple)\nconst cache = new Map();\n\nfunction getData(key) {\n  if (cache.has(key)) {\n    return cache.get(key); // Cache hit\n  }\n  \n  const data = expensiveOperation(key);\n  cache.set(key, data);\n  return data;\n}\n\n// 4. Cache with TTL\nclass CacheWithTTL {\n  constructor(ttl = 60000) {\n    this.cache = new Map();\n    this.ttl = ttl;\n  }\n  \n  set(key, value) {\n    this.cache.set(key, {\n      value,\n      expiry: Date.now() + this.ttl\n    });\n  }\n  \n  get(key) {\n    const item = this.cache.get(key);\n    if (!item) return null;\n    \n    if (Date.now() > item.expiry) {\n      this.cache.delete(key);\n      return null; // Expired\n    }\n    \n    return item.value;\n  }\n}\n\n// 5. LRU Cache\nclass LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  \n  get(key) {\n    if (!this.cache.has(key)) return null;\n    \n    // Move to end (most recently used)\n    const value = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n  \n  set(key, value) {\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    }\n    \n    this.cache.set(key, value);\n    \n    // Evict least recently used if over capacity\n    if (this.cache.size > this.capacity) {\n      const firstKey = this.cache.keys().next().value;\n      this.cache.delete(firstKey);\n    }\n  }\n}"
            },
            {
                "type": "interview-tip",
                "tip": "Caching Types",
                "explanation": "BROWSER:\n- HTTP headers (Cache-Control, ETag)\n- Service Workers\n- LocalStorage (small data)\n\nAPPLICATION:\n- In-memory (Redis, Memcached)\n- HTTP caching\n- CDN (static assets)\n\nSTRATEGIES:\n1. Cache-aside: App checks cache, loads on miss\n2. Write-through: Write to cache + DB\n3. Write-behind: Write to cache, async to DB\n4. Read-through: Cache loads data on miss\n\nEVICTION:\n- LRU (Least Recently Used)\n- LFU (Least Frequently Used)\n- TTL (Time To Live)\n- FIFO (First In First Out)\n\nCONSIDERATIONS:\n- Invalidation strategy\n- Data volatility\n- Memory limits\n- Consistency needs"
            },
            {
                "type": "title",
                "level": 2,
                "content": "Q4. What are Web Workers and when to use them?"
            },
            {
                "type": "description",
                "content": "Web Workers run JavaScript in background threads, don't block UI. Use for: heavy computations, data processing, real-time features. Communication via postMessage(). Types: Dedicated (single page), Shared (multiple pages), Service Workers (PWA features). Limitations: no DOM access, separate scope."
            },
            {
                "type": "code",
                "language": "javascript",
                "title": "Web Workers",
                "code": "// Main thread (app.js)\nconst worker = new Worker('worker.js');\n\n// Send data to worker\nworker.postMessage({\n  type: 'PROCESS_DATA',\n  data: largeDataArray\n});\n\n// Receive result from worker\nworker.onmessage = (event) => {\n  const result = event.data;\n  updateUI(result);\n};\n\nworker.onerror = (error) => {\n  console.error('Worker error:', error);\n};\n\n// Worker thread (worker.js)\nself.onmessage = (event) => {\n  const { type, data } = event.data;\n  \n  if (type === 'PROCESS_DATA') {\n    // Heavy computation (doesn't block UI)\n    const result = data.map(item => {\n      return expensiveCalculation(item);\n    });\n    \n    // Send result back to main thread\n    self.postMessage(result);\n  }\n};\n\nfunction expensiveCalculation(item) {\n  let sum = 0;\n  for (let i = 0; i < 1000000; i++) {\n    sum += Math.sqrt(item * i);\n  }\n  return sum;\n}\n\n// Real-world example: Image processing\n// worker.js\nself.onmessage = (event) => {\n  const imageData = event.data;\n  const pixels = imageData.data;\n  \n  // Apply grayscale filter\n  for (let i = 0; i < pixels.length; i += 4) {\n    const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;\n    pixels[i] = pixels[i + 1] = pixels[i + 2] = avg;\n  }\n  \n  self.postMessage(imageData);\n};\n\n// Shared Worker (multiple pages)\n// shared-worker.js\nconst connections = [];\n\nself.onconnect = (event) => {\n  const port = event.ports[0];\n  connections.push(port);\n  \n  port.onmessage = (e) => {\n    // Broadcast to all connected pages\n    connections.forEach(p => p.postMessage(e.data));\n  };\n};\n\n// Using shared worker\nconst sharedWorker = new SharedWorker('shared-worker.js');\nsharedWorker.port.postMessage('Hello');\nsharedWorker.port.onmessage = (e) => {\n  console.log('Received:', e.data);\n};"
            },
            {
                "type": "interview-tip",
                "tip": "Web Workers",
                "explanation": "TYPES:\n1. Dedicated Worker:\n   - Single page/script\n   - new Worker('worker.js')\n   \n2. Shared Worker:\n   - Multiple pages/tabs\n   - new SharedWorker('worker.js')\n   \n3. Service Worker:\n   - PWA features\n   - Offline, push notifications\n\nUSE CASES:\n- Heavy computations\n- Large data processing\n- Real-time data parsing\n- Image/video processing\n- Encryption/decryption\n- Background sync\n\nLIMITATIONS:\n- No DOM access\n- No window object\n- Separate global scope\n- Communication overhead\n\nBEST PRACTICES:\n- Offload CPU-intensive tasks\n- Keep data transfer minimal\n- Use Transferable Objects for large data\n- Terminate when done"
            }
        ]
    }
]

# Add all remaining sections
for section in remaining_sections:
    data['sections'].append(section)

# Write back to file
with open('interviews/javascript-fullstack.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Successfully added {len(remaining_sections)} sections!")
print(f"📊 Total sections now: {len(data['sections'])}")
print(f"\n🎉 JavaScript Full Stack Interview Guide is complete!")
print("\nSections added:")
for i, section in enumerate(remaining_sections, start=7):
    print(f"  {i}. {section['title']}")
