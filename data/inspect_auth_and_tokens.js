const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');

// Look for token, Authorization, Bearer, localStorage
const tokenOccurrences = [];
const regex = /(?:Bearer|Authorization|accessToken|token|localStorage|sessionStorage|headers)/gi;
let match;
const lines = code.split(';');
console.log('Total statements in bundle:', lines.length);

const matchedStatements = lines.filter(l => 
  (l.includes('Authorization') || l.includes('Bearer ') || l.includes('token') || l.includes('headers')) &&
  (l.includes('axios') || l.includes('fetch') || l.includes('interceptors') || l.includes('http'))
);

console.log('Matched statements count:', matchedStatements.length);
matchedStatements.slice(0, 10).forEach((s, idx) => {
  console.log(`[${idx}]`, s.substring(0, 150));
});
