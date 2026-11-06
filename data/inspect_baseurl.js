const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');

// Find all occurrences of baseURL or api-p or axios.create
const matches = code.match(/baseURL:[^,}\)]+/g) || [];
console.log('baseURL matches:', matches);

const axiosCreates = code.match(/create\(\{[^\}]*baseURL[^\}]*\}\)/g) || [];
console.log('axios create matches:', axiosCreates);

// Search for api endpoints with parameters
const apiPrefixes = code.match(/api-p\.repaircms\.com[^\s"']+/g) || [];
console.log('apiPrefixes:', apiPrefixes);
