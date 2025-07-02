// DOM Elements
const form = document.getElementById("form");
const form2 = document.getElementById("form2");
const javascriptCode = document.getElementById("javascriptCode");
const lockDomains = document.getElementById("lockDomains");
const output = document.getElementById("output");
const obfuscateAnotherCode = document.getElementById("obfuscateAnotherCode");
const copyBtn = document.getElementById("copyBtn");
const securityLevelButtons = document.querySelectorAll(".security-level-btn");

// State
let currentSecurityLevel = "medium";
let lastObfuscatedCode = "";

// Initialize security level buttons
securityLevelButtons.forEach(button => {
  button.addEventListener("click", function() {
    securityLevelButtons.forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");
    currentSecurityLevel = this.dataset.level;
    updateSecurityDescription();
  });
});

// Security level descriptions
function updateSecurityDescription() {
  const descriptions = {
    low: "Basic obfuscation (string array transformation)",
    medium: "Standard protection (control flow flattening + debug protection)",
    high: "Advanced security (dead code injection + self-defending)"
  };
  document.getElementById("securityDescription").textContent = descriptions[currentSecurityLevel];
}

// Main obfuscation function
form.onsubmit = async function(event) {
  event.preventDefault();
  
  try {
    // Validate input
    if (!javascriptCode.value.trim()) {
      throw new Error("Please enter JavaScript code to obfuscate");
    }

    // Show loading state
    const submitBtn = this.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    // Prepare domain lock
    const domainLockArray = lockDomains.value
      .split(",")
      .map(domain => domain.trim())
      .filter(domain => domain);

    // Get obfuscation options
    const obfuscationOptions = getObfuscationOptions(domainLockArray);

    // Obfuscate (with timeout to prevent UI freeze)
    const obfuscationResult = await new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(JavaScriptObfuscator.obfuscate(javascriptCode.value, obfuscationOptions));
        } catch (error) {
          reject(error);
        }
      }, 100);
    });

    // Add attribution and get obfuscated code
    lastObfuscatedCode = "// Veronica obfuscator developed by terrizev\n// channelInfo https://whatsapp.com/channel/0029Vb57ZHh7IUYcNttXEB3y\n\n" + obfuscationResult.getObfuscatedCode();
    output.value = lastObfuscatedCode;

    // Switch to results view
    form2.classList.remove("d-none");
    this.classList.add("d-none");

    // Analytics (optional)
    logObfuscationEvent(currentSecurityLevel, domainLockArray.length);

  } catch (error) {
    showError(error.message);
  } finally {
    // Reset button state
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
};

// Obfuscation options by security level
function getObfuscationOptions(domainLockArray) {
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
      debugProtectionInterval: 2000, // Fixed: now a number value
      disableConsoleOutput: true,
      selfDefending: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.25,
      transformObjectKeys: true,
      unicodeEscapeSequence: true
    }
  };

  return {
    ...optionsByLevel[currentSecurityLevel],
    ...(domainLockArray.length > 0 && { domainLock: domainLockArray })
  };
}

// UI Functions
function showError(message) {
  const errorElement = document.getElementById("errorAlert") || createErrorElement();
  errorElement.textContent = message;
  errorElement.classList.remove("d-none");
  setTimeout(() => errorElement.classList.add("d-none"), 5000);
}

function createErrorElement() {
  const errorElement = document.createElement("div");
  errorElement.id = "errorAlert";
  errorElement.className = "alert alert-danger d-none position-fixed top-0 start-50 translate-middle-x mt-3";
  errorElement.style.zIndex = "1000";
  document.body.appendChild(errorElement);
  return errorElement;
}

// Copy to clipboard with improved feedback
copyBtn.onclick = async function() {
  try {
    await navigator.clipboard.writeText(output.value);
    showToast("Code copied to clipboard!");
  } catch (error) {
    showError("Failed to copy: " + error.message);
  }
};

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "position-fixed bottom-0 end-0 p-3";
  toast.innerHTML = `
    <div class="toast show" role="alert">
      <div class="toast-body d-flex align-items-center">
        <i class="fas fa-check-circle text-success me-2"></i>
        <span>${message}</span>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Reset form
obfuscateAnotherCode.onclick = function() {
  form2.classList.add("d-none");
  form.classList.remove("d-none");
  output.value = "";
};

// Analytics (optional)
function logObfuscationEvent(level, domainCount) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'obfuscation', {
      'security_level': level,
      'domain_locks': domainCount
    });
  }
}

// Initialize
updateSecurityDescription();
