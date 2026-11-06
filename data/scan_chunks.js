const fs = require('fs');
const path = require('path');
const https = require('https');

const chunks = JSON.parse(fs.readFileSync(path.join(__dirname, 'chunks.json'), 'utf8'));

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scan() {
  console.log(`Scanning ${chunks.length} chunks...`);
  const allEndpoints = new Set();
  const allActionTypes = new Set();
  const allModels = new Set();
  const apiPaths = new Set();

  for (let i = 0; i < chunks.length; i++) {
    const chunkUrl = chunks[i];
    try {
      const content = await fetchUrl(chunkUrl);
      
      // Match API endpoints
      const epMatches = content.match(/["'\`](?:\/api\/|\/v1\/|\/user\/|\/job\/|\/contact\/|\/invoice\/|\/stock\/|\/service\/|\/settings\/)[^"'\`\s\)\},;]+["'\`]/g);
      if (epMatches) {
        epMatches.forEach(e => apiPaths.add(e.replace(/["'\`]/g, '')));
      }

      // Match axios / api calls like api.get(...), axios.post(...)
      const axiosMatches = content.match(/\.(?:get|post|put|delete|patch)\((?:["'\`][^"'\`]+["'\`]|`[^`]+`)/g);
      if (axiosMatches) {
        axiosMatches.forEach(e => allEndpoints.add(e));
      }

      // Match redux action types
      const actionMatches = content.match(/["'\`][A-Z_]{4,30}(?:_SUCCESS|_FAILURE|_REQUEST|_FETCH|_GET|_ADD|_UPDATE|_DELETE)["'\`]/g);
      if (actionMatches) {
        actionMatches.forEach(a => allActionTypes.add(a.replace(/["'\`]/g, '')));
      }

    } catch (e) {
      // ignore individual chunk error
    }
  }

  const result = {
    apiPaths: Array.from(apiPaths).sort(),
    endpoints: Array.from(allEndpoints).sort(),
    actionTypes: Array.from(allActionTypes).sort()
  };

  fs.writeFileSync(path.join(__dirname, 'extracted_api_architecture.json'), JSON.stringify(result, null, 2));
  console.log('Extraction complete! Summary:');
  console.log(`- Unique API Paths: ${result.apiPaths.length}`);
  console.log(`- Unique Method Calls: ${result.endpoints.length}`);
  console.log(`- Unique Redux Action Types: ${result.actionTypes.length}`);
}

scan();
