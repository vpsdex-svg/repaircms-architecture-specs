const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'main.js');
const code = fs.readFileSync(bundlePath, 'utf8');

console.log('Bundle size in characters:', code.length);

// 1. Find all chunk files
const chunkRegex = /static\/js\/[a-zA-Z0-9_\.-]+\.chunk\.js/g;
const chunks = Array.from(new Set(code.match(chunkRegex) || []));
console.log('\n--- CHUNK FILES FOUND ---');
console.log(chunks);

// 2. Find all URLs
const urlRegex = /https?:\/\/[a-zA-Z0-9_\.-]+\.[a-zA-Z]{2,}(?::[0-9]+)?(?:\/[^\s"'\`\)\}\]]*)?/g;
const urls = Array.from(new Set(code.match(urlRegex) || []));
console.log('\n--- DETECTED EXTERNAL / INTERNAL URLS ---');
console.log(urls.filter(u => u.includes('repaircms') || u.includes('api') || u.includes('aws')));

// 3. Find API endpoint patterns like /api/..., /job..., /contact..., /invoice...
const apiPatterns = code.match(/["'\`](?:\/api\/v[0-9]\/|\/api\/)[a-zA-Z0-9_\-\/]+["'\`]/g);
console.log('\n--- /api/ ROUTES ---');
console.log(Array.from(new Set(apiPatterns || [])).slice(0, 50));

// 4. Find axios or fetch endpoint strings
const endpointRegex = /["'\`](?:\/jobs|\/contacts|\/invoices|\/stock|\/service|\/company|\/user|\/auth)[a-zA-Z0-9_\-\/]*["'\`]/g;
console.log('\n--- ENTITY ENDPOINTS ---');
console.log(Array.from(new Set(code.match(endpointRegex) || [])).slice(0, 50));

// 5. Search for webpack chunk mappings
const chunkMapMatch = code.match(/\{[0-9]+:"[a-f0-9]+"[^}]+\}/g);
if (chunkMapMatch) {
  console.log('\n--- WEBPACK CHUNK MAPPINGS ---');
  console.log(chunkMapMatch.slice(0, 5));
}
