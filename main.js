// FADE-IN ANIMATION SCRIPT
// Show all content after page has loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    const elementsToShow = document.querySelectorAll(
      '.language-csharp, .code-container, .note-box-container, h1, h2, .page-navigator, .scroll-top-btn, .scroll-bottom-btn, .copy-button, .note-copy-btn, .note-save-btn, .code-with-output, .output-container, .run-button'
    );
    elementsToShow.forEach(function(element) {
      element.classList.add('content-loaded');
    });
  }, 150);
});

// NOTE BOX FUNCTIONS
// Copy note box function
function copyNoteBox(button) {
  const noteBox = document.getElementById('note-box-area');
  const range = document.createRange();
  range.selectNodeContents(noteBox);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  try {
    document.execCommand("copy");
    // Visual feedback
    button.style.backgroundColor = '#27ae60';
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.style.backgroundColor = '#007bff';
      button.textContent = 'Copy';
    }, 1500);
  } catch (err) {
    console.log('Copy failed');
  }
  selection.removeAllRanges();
}

// Save note box to HTML file function
function saveNoteBox(button) {
  const noteBox = document.getElementById('note-box-area');
  const noteContent = noteBox.innerHTML;
  
  // Get the entire HTML document
  let htmlContent = document.documentElement.outerHTML;
  
  // Clean up any temporary styling added by JavaScript
  htmlContent = htmlContent.replace(/style="[^"]*background-color:[^;"]*;?[^"]*"/g, '');
  htmlContent = htmlContent.replace(/style=""/g, '');
  
  // Update the note box content in the HTML using precise regex
  const noteBoxRegex = /(<div class="note-box-content" contenteditable="true" id="note-box-area">)([\s\S]*?)(<\/div>)/;
  const updatedHtml = htmlContent.replace(
    noteBoxRegex,
    `$1${noteContent}$3`
  );
  
  // Create a blob with the updated HTML content
  const blob = new Blob([updatedHtml], { 
    type: 'text/html;charset=utf-8' 
  });
  
  // Create a temporary download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'index.html';
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(link.href);
  
  // Save to localStorage as backup
  localStorage.setItem('noteBoxBackup', noteContent);
  localStorage.setItem('noteBoxLastSaved', new Date().toISOString());
  console.log('Note box saved to HTML file and localStorage backup created');
}

// Auto-save note box function
function autoSaveNoteBox() {
  const noteBox = document.getElementById('note-box-area');
  if (noteBox) {
    localStorage.setItem('noteBoxBackup', noteBox.innerHTML);
    localStorage.setItem('noteBoxAutoSave', new Date().toISOString());
  }
}

// Load saved note box on page load
window.addEventListener('load', function() {
  const savedNotes = localStorage.getItem('noteBoxBackup');
  const noteBox = document.getElementById('note-box-area');
  const lastSaved = localStorage.getItem('noteBoxLastSaved');
  
  if (savedNotes && noteBox && lastSaved) {
    noteBox.innerHTML = savedNotes;
  }
});

// Auto-save note box every 30 seconds
setInterval(autoSaveNoteBox, 30000);

// Save note box before page unload
window.addEventListener('beforeunload', function(e) {
  autoSaveNoteBox();
});

// CODE BOX FUNCTIONS
// Copy code function
function copyCode(button) {
  // Find the code element within the same container as the button
  const codeBox = button.parentElement.querySelector('.editable-code');
  const range = document.createRange();
  range.selectNodeContents(codeBox);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  try {
    document.execCommand("copy");
    // Visual feedback
    const originalText = button.textContent;
    const originalColor = button.style.backgroundColor;
    button.style.backgroundColor = '#27ae60';
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.style.backgroundColor = originalColor;
      button.textContent = originalText;
    }, 1500);
  } catch (err) {
    // Silent failure - no notification needed
  }
  selection.removeAllRanges();
}

// SCROLL FUNCTIONS
// Scroll to top function
function scrollToTop() {
  // Mobile-friendly scrolling
  if (window.scrollTo) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } else {
    // Fallback for older mobile browsers
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
}

// Scroll to bottom function
function scrollToBottom() {
  // Mobile-friendly scrolling
  const scrollHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  
  if (window.scrollTo) {
    window.scrollTo({
      top: scrollHeight,
      behavior: 'smooth'
    });
  } else {
    // Fallback for older mobile browsers
    document.body.scrollTop = scrollHeight;
    document.documentElement.scrollTop = scrollHeight;
  }
}

// Mobile touch event handling for scroll buttons
document.addEventListener('DOMContentLoaded', function() {
  const scrollTopBtn = document.querySelector('.scroll-top-btn');
  const scrollBottomBtn = document.querySelector('.scroll-bottom-btn');
  
  // Add touch events for mobile
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      this.style.transform = 'scale(0.95)';
    });
    
    scrollTopBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      this.style.transform = 'scale(1)';
      scrollToTop();
    });
  }
  
  if (scrollBottomBtn) {
    scrollBottomBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      this.style.transform = 'scale(0.95)';
    });
    
    scrollBottomBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      this.style.transform = 'scale(1)';
      scrollToBottom();
    });
  }
});

// OUTPUT PREVIEW FUNCTIONS
// Function to run HTML code in iframe
function runHTMLCode(outputId) {
  const codeElement = document.querySelector(`[data-output="${outputId}"]`);
  const iframe = document.getElementById(outputId);
  
  if (codeElement && iframe) {
    const htmlCode = codeElement.textContent;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Basic HTML structure with some default styling
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 10px; 
            background: white; 
          }
          .form-group { 
            margin: 10px 0; 
          }
          label { 
            display: block; 
            margin-bottom: 5px; 
            font-weight: bold; 
          }
          input { 
            padding: 8px; 
            border: 1px solid #ccc; 
            border-radius: 4px; 
            width: 200px; 
          }
          button { 
            background: #007bff; 
            color: white; 
            padding: 8px 16px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
          }
          button:hover { 
            background: #0056b3; 
          }
        </style>
      </head>
      <body>
        ${htmlCode}
      </body>
      </html>
    `;
    
    doc.open();
    doc.write(fullHTML);
    doc.close();
  }
}

// Function to run CSS code in iframe
function runCSSCode(outputId) {
  const codeElement = document.querySelector(`[data-output="${outputId}"]`);
  const iframe = document.getElementById(outputId);
  
  if (codeElement && iframe) {
    const cssCode = codeElement.textContent;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    // HTML structure to show CSS effects
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${cssCode}
        </style>
      </head>
      <body>
        <div class="container">
          <h1>CSS Demo</h1>
          <p>This shows your CSS styling in action!</p>
        </div>
      </body>
      </html>
    `;
    
    doc.open();
    doc.write(fullHTML);
    doc.close();
  }
}

// Function to run JavaScript code in iframe
function runJSCode(outputId) {
  const codeElement = document.querySelector(`[data-output="${outputId}"]`);
  const iframe = document.getElementById(outputId);
  
  if (codeElement && iframe) {
    const jsCode = codeElement.textContent;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    // HTML structure to run JavaScript
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 10px; 
            background: white; 
          }
        </style>
      </head>
      <body>
        <script>
          try {
            ${jsCode}
          } catch (error) {
            document.body.innerHTML = '<div style="color: red; padding: 10px;">Error: ' + error.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
    
    doc.open();
    doc.write(fullHTML);
    doc.close();
  }
}

// Function to run C# code (shows expected console output)
function runCSharpCode(outputId) {
  const codeElement = document.querySelector(`[data-output="${outputId}"]`);
  const iframe = document.getElementById(outputId);
  
  if (codeElement && iframe) {
    const csharpCode = codeElement.textContent;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Parse C# code to simulate console output
    let output = "Console Output:\n\n";
    
    // Simple pattern matching for common C# console output
    const lines = csharpCode.split('\n');
    let hasConsoleWrite = false;
    
    lines.forEach(line => {
      if (line.includes('Console.WriteLine') || line.includes('Console.Write')) {
        hasConsoleWrite = true;
        // Enhanced pattern matching
        if (line.includes('"=== C# Demo ==="')) {
          output += "=== C# Demo ===\n";
        } else if (line.includes('$"Hello, {name}!"')) {
          output += "Hello, World!\n";
        } else if (line.includes('$"Number: {i}"')) {
          output += "Number: 1\nNumber: 2\nNumber: 3\nNumber: 4\nNumber: 5\n";
        } else if (line.includes('"Programming Languages:"')) {
          output += "Programming Languages:\n";
        } else if (line.includes('$"- {lang}"')) {
          output += "- C#\n- JavaScript\n- Python\n";
        } else if (line.includes('"Hello World!"')) {
          output += "Hello World!\n";
        } else if (line.includes('"Welcome to C# programming!"')) {
          output += "Welcome to C# programming!\n";
        } else {
          // Generic extraction
          const match = line.match(/Console\.WriteLine?\s*\(\s*["']([^"']+)["']\s*\)|Console\.WriteLine?\s*\(\s*([^)]+)\s*\)/);
          if (match) {
            const content = match[1] || match[2];
            output += content.replace(/[{}$"]/g, '') + "\n";
          }
        }
      }
    });
    
    if (!hasConsoleWrite) {
      output += "// No console output detected\n// Add Console.WriteLine() statements to see output here";
    }
    
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Consolas', 'Monaco', monospace; 
            margin: 10px; 
            background: #1e1e1e; 
            color: #d4d4d4;
            font-size: 14px;
            line-height: 1.4;
          }
          .console-output {
            white-space: pre-wrap;
            padding: 10px;
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="console-output">${output}</div>
      </body>
      </html>
    `;
    
    doc.open();
    doc.write(fullHTML);
    doc.close();
  }
}

// Function to run Python code (shows expected console output)
function runPythonCode(outputId) {
  const codeElement = document.querySelector(`[data-output="${outputId}"]`);
  const iframe = document.getElementById(outputId);
  
  if (codeElement && iframe) {
    const pythonCode = codeElement.textContent;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Parse Python code to simulate console output
    let output = "Console Output:\n\n";
    
    const lines = pythonCode.split('\n');
    let hasPrint = false;
    
    lines.forEach(line => {
      if (line.includes('print(')) {
        hasPrint = true;
        // Enhanced pattern matching for Python
        if (line.includes('"Hello World!"')) {
          output += "Hello World!\n";
        } else if (line.includes('greet("Python")')) {
          output += "Hello, Python!\n";
        } else if (line.includes('"Welcome to Python programming!"')) {
          output += "Welcome to Python programming!\n";
        } else {
          // Generic extraction
          const match = line.match(/print\s*\(\s*["']([^"']+)["']\s*\)|print\s*\(\s*([^)]+)\s*\)/);
          if (match) {
            const content = match[1] || match[2];
            if (content && !content.includes('f"') && !content.includes('greet(')) {
              output += content.replace(/[{}f"]/g, '') + "\n";
            }
          }
        }
      }
    });
    
    if (!hasPrint) {
      output += "// No print statements detected\n// Add print() statements to see output here";
    }
    
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: 'Consolas', 'Monaco', monospace; 
            margin: 10px; 
            background: #1e1e1e; 
            color: #d4d4d4;
            font-size: 14px;
            line-height: 1.4;
          }
          .console-output {
            white-space: pre-wrap;
            padding: 10px;
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="console-output">${output}</div>
      </body>
      </html>
    `;
    
    doc.open();
    doc.write(fullHTML);
    doc.close();
  }
}

// Auto-run code when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Auto-run HTML examples
  setTimeout(() => {
    const htmlOutputs = document.querySelectorAll('[id^="html-output-"]');
    htmlOutputs.forEach(output => {
      runHTMLCode(output.id);
    });
    
    // Auto-run CSS examples
    const cssOutputs = document.querySelectorAll('[id^="css-output-"]');
    cssOutputs.forEach(output => {
      runCSSCode(output.id);
    });
    
    // Auto-run JavaScript examples
    const jsOutputs = document.querySelectorAll('[id^="js-output-"]');
    jsOutputs.forEach(output => {
      runJSCode(output.id);
    });
    
    // Auto-run C# examples
    const csharpOutputs = document.querySelectorAll('[id^="csharp-output-"]');
    csharpOutputs.forEach(output => {
      runCSharpCode(output.id);
    });
    
    // Auto-run Python examples
    const pythonOutputs = document.querySelectorAll('[id^="python-output-"]');
    pythonOutputs.forEach(output => {
      runPythonCode(output.id);
    });
  }, 500);
});
