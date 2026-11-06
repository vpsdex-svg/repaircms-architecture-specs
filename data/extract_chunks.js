const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, 'main.js');
const code = fs.readFileSync(bundlePath, 'utf8');

// Let's find chunk IDs and filenames
// Webpack chunk pattern: e.u = e => "static/js/" + e + "." + { ... }[e] + ".chunk.js"
const chunkMapMatch = code.match(/\{([0-9]+:"[a-f0-9]+",?)+\}/);
if (chunkMapMatch) {
  const mapStr = chunkMapMatch[0];
  // Parse this object safely
  const mapObj = eval('(' + mapStr + ')');
  console.log(`Total Chunks: ${Object.keys(mapObj).length}`);
  
  // Create array of chunk URLs
  const chunkUrls = Object.entries(mapObj).map(([id, hash]) => `https://my.repaircms.com/static/js/${id}.${hash}.chunk.js`);
  fs.writeFileSync(path.join(__dirname, 'chunks.json'), JSON.stringify(chunkUrls, null, 2));
  console.log('Saved all chunk URLs to chunks.json');
}
