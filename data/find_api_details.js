const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'main.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Find all URLs
const urlRegex = /https?:\/\/[a-zA-Z0-9_\.-]+\.[a-zA-Z]{2,}(?::[0-9]+)?(?:\/[^\s"'\`\)\}\]]*)?/g;
const urls = Array.from(new Set(code.match(urlRegex) || []));
console.log('--- REPAIR源 / API URLS ---');
console.log(urls.filter(u => u.includes('repaircms') || u.includes('api') || u.includes('backend') || u.includes('aws')));

// Search for API base URLs or axios instances
const matches = code.match(/(?:baseURL|apiUrl|apiEndpoint|BACKEND_URL|REACT_APP_[A-Z_]+)[^;,]{0,60}/g);
console.log('\n--- CONFIG / ENV / BASEURL MATCHES ---');
console.log(Array.from(new Set(matches || [])).slice(0, 30));

// Search for HTTP methods: get, post, put, delete calls
const httpCalls = code.match(/\.(?:get|post|put|delete|patch)\(["'\`][^"'\`]+["'\`]/g);
console.log('\n--- HTTP CALLS ---');
console.log(Array.from(new Set(httpCalls || [])).slice(0, 40));
