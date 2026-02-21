const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('Fetching Wilayas...');
    const wilayas = await fetchJson('https://raw.githubusercontent.com/BrahimS/algeria-api/master/data/wilayas.json');
    console.log('Fetching Communes...');
    const communes = await fetchJson('https://raw.githubusercontent.com/BrahimS/algeria-api/master/data/communes.json');

    const algeriaData = {};
    wilayas.forEach(w => {
      algeriaData[w.id] = {
        name: w.name,
        communes: []
      };
    });

    communes.forEach(c => {
      if (algeriaData[c.wilaya_id]) {
        algeriaData[c.wilaya_id].communes.push(c.name);
      }
    });

    const jsContent = `const algeriaData = ${JSON.stringify(algeriaData, null, 2)};`;
    const outputPath = path.join(__dirname, '../frontend/js/algeria-cities.js');
    fs.writeFileSync(outputPath, jsContent);
    console.log(`Success! Wrote ${Object.keys(algeriaData).length} wilayas to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
