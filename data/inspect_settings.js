const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'main.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Search for route definitions
const routeMatches = code.match(/path:\s*"[^"]+"/g) || [];
console.log('Total route matches:', routeMatches.length);
console.log(routeMatches.slice(0, 50));

// Find all HTTP methods with endpoints like axios.get('/...') or fetch('...')
const apiCalls = new Set();
const apiRegex = /(?:get|post|put|delete|patch)\(\s*[`'"](\/[^`'"]+)[`'"]/gi;
let m;
while ((m = apiRegex.exec(code)) !== null) {
  apiCalls.add(m[0]);
}

console.log('\n--- API CALL SIGNATURES ---');
console.log(Array.from(apiCalls));
