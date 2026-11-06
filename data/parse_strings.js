const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'main.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Find all string literals in quotes
const stringLiterals = code.match(/"([^"\\]|\\.)*"/g) || [];
console.log('Total string literals in bundle:', stringLiterals.length);

// Filter strings that look like API endpoints or action names
const apiEndpoints = new Set();
const potentialUrls = new Set();
const stateKeys = new Set();

stringLiterals.forEach(rawStr => {
  const s = rawStr.slice(1, -1);
  if (s.startsWith('/') && s.length > 2 && s.length < 60 && !s.includes('<') && !s.includes('{')) {
    apiEndpoints.add(s);
  }
  if (s.startsWith('http://') || s.startsWith('https://')) {
    potentialUrls.add(s);
  }
  if (/^[a-zA-Z0-9_]{3,30}$/.test(s) && (s.includes('Job') || s.includes('job') || s.includes('Contact') || s.includes('Invoice') || s.includes('Stock') || s.includes('Repair') || s.includes('Device'))) {
    stateKeys.add(s);
  }
});

console.log('\n--- POTENTIAL URLS ---');
console.log(Array.from(potentialUrls));

console.log('\n--- PATHS STARTING WITH / ---');
console.log(Array.from(apiEndpoints).slice(0, 80));

console.log('\n--- DOMAIN IDENTIFIERS & STATE KEYS ---');
console.log(Array.from(stateKeys).slice(0, 60));
