const https = require('https');

const query = process.argv.slice(2).join(' ');
if (!query) {
  console.error(JSON.stringify({ error: "No query provided. Usage: node search-competitors.js <keywords>" }));
  process.exit(1);
}

const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const results = [];
      const titles = parsed[1] || [];
      const descriptions = parsed[2] || [];
      const links = parsed[3] || [];
      
      for (let i = 0; i < titles.length; i++) {
        results.push({
          name: titles[i],
          description: descriptions[i],
          link: links[i]
        });
      }
      
      console.log(JSON.stringify({ query, results }, null, 2));
    } catch (e) {
      console.error(JSON.stringify({ error: "Failed to parse API response", details: e.message }));
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error(JSON.stringify({ error: "HTTP Request failed", details: e.message }));
  process.exit(1);
});
