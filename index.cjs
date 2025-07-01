// index.cjs
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for security and logging
const morgan = require('morgan');
const helmet = require('helmet');
app.use(morgan('dev'));
app.use(helmet());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoint for server-side obfuscation
app.post('/api/obfuscate', (req, res) => {
  const { code, securityLevel, domains } = req.body;
  const JavaScriptObfuscator = require('javascript-obfuscator');

  // Prepare domain lock array
  const domainLockArray = domains 
    ? domains.split(',').map(d => d.trim()).filter(d => d)
    : [];

  // Get obfuscation options based on security level
  const getOptions = () => {
    const baseOptions = {
      compact: true,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      selfDefending: false,
      stringArray: true,
      stringArrayThreshold: 0.75
    };

    const optionsByLevel = {
      low: {
        ...baseOptions,
        controlFlowFlattening: false,
        stringArrayEncoding: []
      },
      medium: {
        ...baseOptions,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        debugProtection: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.5
      },
      high: {
        ...baseOptions,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: 2000,
        disableConsoleOutput: true,
        selfDefending: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 0.25,
        transformObjectKeys: true,
        unicodeEscapeSequence: true
      }
    };

    return {
      ...optionsByLevel[securityLevel || 'medium'],
      ...(domainLockArray.length > 0 && { domainLock: domainLockArray })
    };
  };

  try {
    const options = getOptions();
    const result = JavaScriptObfuscator.obfuscate(code, options);
    const obfuscatedCode = "// Veronica obfuscator developed by terrizev\n" + result.getObfuscatedCode();
    
    res.json({ 
      success: true,
      obfuscatedCode 
    });
  } catch (error) {
    console.error('Obfuscation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`
  ██╗   ██╗███████╗██████╗  ██████╗ ███╗   ██╗██╗ ██████╗ █████╗ ██████╗ 
  ██║   ██║██╔════╝██╔══██╗██╔═══██╗████╗  ██║██║██╔════╝██╔══██╗██╔══██╗
  ██║   ██║█████╗  ██████╔╝██║   ██║██╔██╗ ██║██║██║     ███████║██████╔╝
  ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║██║██║     ██╔══██║██╔══██╗
   ╚████╔╝ ███████╗██║  ██║╚██████╔╝██║ ╚████║██║╚██████╗██║  ██║██║  ██║
    ╚═══╝  ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝
                                                                          
  Server running on http://localhost:${port}
  WhatsApp: +256 784 670936
  GitHub: Terrizev
  WhatsApp Channel: https://whatsapp.com/channel/0029Vb57ZHh7IUYcNttXEB3y
  `);
});
