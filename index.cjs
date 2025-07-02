const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Optional: API endpoint for server-side obfuscation
app.post('/api/obfuscate', express.json(), (req, res) => {
  const { code, securityLevel } = req.body;
  const JavaScriptObfuscator = require('javascript-obfuscator');

  let options = {
    compact: true,
    controlFlowFlattening: securityLevel === 'high'
  };

  try {
    const result = JavaScriptObfuscator.obfuscate(code, options);
    res.json({ obfuscatedCode: result.getObfuscatedCode() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
