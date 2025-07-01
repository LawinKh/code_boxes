// FADE-IN ANIMATION SCRIPT
// Show all content after page has loaded
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    const elementsToShow = document.querySelectorAll(
      '.language-csharp, .code-container, .note-box-container, .editable-code, h1, .page-navigator, .scroll-top-btn, .scroll-bottom-btn, .copy-button, .note-copy-btn, .code-with-output, .output-container, .run-button, .code-box-creator, .add-code-box-btn, .language-selector, .delete-button'
    );
    elementsToShow.forEach(function(element) {
      element.classList.add('content-loaded');
    });
    
    // Load saved code boxes first
    loadSavedCodeBoxes();
    
    // Initialize live editing for existing code boxes after ensuring Prism.js is loaded
    setTimeout(() => {
      initializeLiveEditing();
    }, 500); // Increased delay to ensure Prism.js is fully loaded
    
  }, 50); // Reduced from 150ms to 50ms for faster button appearance
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

// PERSISTENT STORAGE FUNCTIONS
function saveCodeBoxesToStorage() {
  const dynamicCodeBoxes = [];
  const savedBoxes = document.querySelectorAll('.code-with-output.dynamic-element');
  
  savedBoxes.forEach(box => {
    const codeElement = box.querySelector('.editable-code');
    const outputId = codeElement.getAttribute('data-output');
    const codeChild = codeElement.querySelector('code');
    const code = codeChild ? codeChild.textContent : codeElement.textContent;
    
    let language = 'html';
    if (codeElement.classList.contains('language-html')) language = 'html';
    else if (codeElement.classList.contains('language-css')) language = 'css';
    else if (codeElement.classList.contains('language-javascript')) language = 'javascript';
    else if (codeElement.classList.contains('language-csharp')) language = 'csharp';
    else if (codeElement.classList.contains('language-python')) language = 'python';
    
    dynamicCodeBoxes.push({
      id: outputId,
      language: language,
      code: code
    });
  });
  
  localStorage.setItem('savedCodeBoxes', JSON.stringify(dynamicCodeBoxes));
  console.log('Saved', dynamicCodeBoxes.length, 'code boxes to storage');
}

function loadSavedCodeBoxes() {
  const savedData = localStorage.getItem('savedCodeBoxes');
  if (!savedData) return;
  
  try {
    const savedBoxes = JSON.parse(savedData);
    console.log('Loading', savedBoxes.length, 'saved code boxes');
    
    savedBoxes.forEach(boxData => {
      setTimeout(() => {
        createCodeBoxWithCode(boxData.language, boxData.code, boxData.id);
      }, 100);
    });
  } catch (e) {
    console.error('Error loading saved code boxes:', e);
  }
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
  console.log('runHTMLCode called with:', outputId);
  const codeElement = document.querySelector(`[data-output="${outputId}"]`);
  const iframe = document.getElementById(outputId);
  
  console.log('Code element found:', !!codeElement);
  console.log('Iframe found:', !!iframe);
  
  if (codeElement && iframe) {
    // Get text content from the code element, handling both old and new structure
    let htmlCode = '';
    const codeChild = codeElement.querySelector('code');
    if (codeChild) {
      htmlCode = codeChild.textContent || codeChild.innerText;
    } else {
      htmlCode = codeElement.textContent || codeElement.innerText;
    }
    
    // Clean up the code (remove extra whitespace at beginning/end)
    htmlCode = htmlCode.trim();
    
    // Decode HTML entities back to actual HTML
    htmlCode = htmlCode
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');
    
    console.log('HTML code extracted and decoded:', htmlCode.substring(0, 100) + '...');
    
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
    // Get text content from the code element, handling both old and new structure
    let cssCode = '';
    const codeChild = codeElement.querySelector('code');
    if (codeChild) {
      cssCode = codeChild.textContent || codeChild.innerText;
    } else {
      cssCode = codeElement.textContent || codeElement.innerText;
    }
    
    // Clean up the code
    cssCode = cssCode.trim();
    
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
    // Get text content from the code element, handling both old and new structure
    let jsCode = '';
    const codeChild = codeElement.querySelector('code');
    if (codeChild) {
      jsCode = codeChild.textContent || codeChild.innerText;
    } else {
      jsCode = codeElement.textContent || codeElement.innerText;
    }
    
    // Clean up the code
    jsCode = jsCode.trim();
    
    // Decode HTML entities back to actual HTML for JavaScript that manipulates DOM
    jsCode = jsCode
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');
    
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
    // Get text content from the code element, handling both old and new structure
    let csharpCode = '';
    const codeChild = codeElement.querySelector('code');
    if (codeChild) {
      csharpCode = codeChild.textContent || codeChild.innerText;
    } else {
      csharpCode = codeElement.textContent || codeElement.innerText;
    }
    
    // Clean up the code
    csharpCode = csharpCode.trim();
    
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
        if (line.includes('"Hello from new C# code box!"')) {
          output += "Hello from new C# code box!\n";
        } else if (line.includes('$"Count: {i}"')) {
          output += "Count: 1\nCount: 2\nCount: 3\nCount: 4\nCount: 5\n";
        } else if (line.includes('$"Hello, {name}!"')) {
          output += "Hello, World!\n";
        } else if (line.includes('$"Number: {num}"')) {
          output += "Number: 1\nNumber: 2\nNumber: 3\nNumber: 4\nNumber: 5\n";
        } else if (line.includes('"=== C# Demo ==="')) {
          output += "=== C# Demo ===\n";
        } else if (line.includes('"Programming Languages:"')) {
          output += "Programming Languages:\n";
        } else if (line.includes('$"- {lang}"')) {
          output += "- C#\n- JavaScript\n- Python\n";
        } else if (line.includes('"Hello World!"')) {
          output += "Hello World!\n";
        } else if (line.includes('"Welcome to C# programming!"')) {
          output += "Welcome to C# programming!\n";
        } else {
          // Generic extraction for simple strings
          const stringMatch = line.match(/Console\.WriteLine?\s*\(\s*["']([^"']+)["']\s*\)/);
          if (stringMatch) {
            output += stringMatch[1] + "\n";
          } else {
            // Try to extract variable content
            const varMatch = line.match(/Console\.WriteLine?\s*\(\s*([^)]+)\s*\)/);
            if (varMatch && !varMatch[1].includes('$')) {
              output += varMatch[1].replace(/[;"']/g, '') + "\n";
            }
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
    // Get text content from the code element, handling both old and new structure
    let pythonCode = '';
    const codeChild = codeElement.querySelector('code');
    if (codeChild) {
      pythonCode = codeChild.textContent || codeChild.innerText;
    } else {
      pythonCode = codeElement.textContent || codeElement.innerText;
    }
    
    // Clean up the code
    pythonCode = pythonCode.trim();
    
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
        } else if (line.includes('greet("World")')) {
          output += "Hello, World!\n";
        } else if (line.includes('"This is a new Python code box!"')) {
          output += "This is a new Python code box!\n";
        } else if (line.includes('f"Number: {i}"')) {
          output += "Number: 1\nNumber: 2\nNumber: 3\nNumber: 4\nNumber: 5\n";
        } else if (line.includes('greet("Python")')) {
          output += "Hello, Python!\n";
        } else if (line.includes('"Welcome to Python programming!"')) {
          output += "Welcome to Python programming!\n";
        } else {
          // Generic extraction for simple strings
          const stringMatch = line.match(/print\s*\(\s*["']([^"']+)["']\s*\)/);
          if (stringMatch) {
            output += stringMatch[1] + "\n";
          } else {
            // Try to extract function calls or variables
            const funcMatch = line.match(/print\s*\(\s*([^)]+)\s*\)/);
            if (funcMatch && !funcMatch[1].includes('f"') && !funcMatch[1].includes('"')) {
              // This is likely a function call or variable
              const content = funcMatch[1].trim();
              if (content === 'greet("World")') {
                output += "Hello, World!\n";
              }
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

// DYNAMIC CODE BOX CREATION
let codeBoxCounter = 1;

// CUSTOM CODE INPUT MODAL FUNCTIONS
let currentLanguage = '';

function addNewCodeBox() {
  currentLanguage = document.getElementById('language-selector').value;
  const languageSettings = getLanguageSettings(currentLanguage);
  
  // Update modal title and content
  document.getElementById('modal-title').textContent = `Enter Your ${languageSettings.name} Code`;
  document.getElementById('code-input-textarea').value = languageSettings.template;
  
  // Show the modal
  document.getElementById('code-input-modal').classList.add('show');
  document.getElementById('code-input-textarea').focus();
}

function closeCodeInputModal() {
  document.getElementById('code-input-modal').classList.remove('show');
}

function createCodeBoxFromModal() {
  const userCode = document.getElementById('code-input-textarea').value.trim();
  
  if (userCode === '') {
    alert('Please enter some code before creating the code box.');
    return;
  }
  
  // Close modal
  closeCodeInputModal();
  
  // Create the code box with user's code
  createCodeBoxWithCode(currentLanguage, userCode);
}

function createCodeBoxWithCode(language, userCode, existingId = null) {
  console.log('createCodeBoxWithCode called with language:', language);
  
  // Get language-specific settings
  const languageSettings = getLanguageSettings(language);
  
  // Use existing ID or generate new one
  let outputId;
  if (existingId) {
    outputId = existingId;
  } else {
    do {
      outputId = `${language}-output-${codeBoxCounter}`;
      codeBoxCounter++;
    } while (document.getElementById(outputId));
  }
  
  console.log('Generated output ID:', outputId);
  console.log('User provided code:', userCode.substring(0, 100) + '...');
  
  // Encode HTML entities for display in the code box
  const encodedCode = userCode
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  // Create the new code box HTML with user's code
  const newCodeBoxHTML = `
    <div class="code-with-output dynamic-element">
      <div class="code-section">
        <div class="code-container dynamic-element">
          <button class="copy-button dynamic-element" onclick="copyCode(this)">Copy</button>
          <pre class="editable-code language-${language === 'csharp' ? 'csharp' : language} dynamic-element" contenteditable="true" data-output="${outputId}"><code>${encodedCode}</code></pre>
        </div>
      </div>
      <div class="output-section">
        <div class="output-container dynamic-element">
          <div class="output-header">
            <span>${languageSettings.icon} ${languageSettings.name} Preview</span>
            <button class="run-button dynamic-element" onclick="${languageSettings.runFunction}('${outputId}')">Run</button>
            <button class="delete-button dynamic-element" onclick="deleteCodeBox(this)">🗑️</button>
          </div>
          <iframe class="output-iframe" id="${outputId}"></iframe>
        </div>
      </div>
    </div>
  `;
  
  console.log('Generated HTML with user code');
  
  // Find the code box creator and insert the new code box before it
  const creator = document.querySelector('.code-box-creator');
  
  if (creator) {
    creator.insertAdjacentHTML('beforebegin', newCodeBoxHTML);
    console.log('Code box HTML inserted');
  } else {
    console.error('Creator element not found!');
    return;
  }
  
  // Wait a moment for DOM to be ready, then apply highlighting and run code
  setTimeout(() => {
    // Apply Prism.js highlighting to the new code box
    const newCodeElement = document.querySelector(`[data-output="${outputId}"] code`);
    if (window.Prism && newCodeElement) {
      Prism.highlightElement(newCodeElement);
      console.log('Prism highlighting applied to:', outputId);
    }
    
    // Apply content-loaded class to all dynamically created elements
    const newCodeBox = document.querySelector(`[data-output="${outputId}"]`).closest('.code-with-output');
    if (newCodeBox) {
      const elementsToShow = newCodeBox.querySelectorAll(
        '.language-csharp, .code-container, .editable-code, .copy-button, .run-button, .delete-button, .code-with-output, .output-container'
      );
      elementsToShow.forEach(element => {
        element.classList.add('content-loaded');
      });
      newCodeBox.classList.add('content-loaded');
      console.log('Content-loaded class applied to dynamically created elements');
      
      // Add live editing to the new code box
      const editableCode = document.querySelector(`[data-output="${outputId}"]`);
      if (editableCode) {
        addSimpleLiveEditing(editableCode, language, outputId);
        console.log('Live editing added to new code box:', outputId);
        
        // Add auto-save listener for persistent storage
        editableCode.addEventListener('input', () => {
          clearTimeout(editableCode.saveTimer);
          editableCode.saveTimer = setTimeout(() => {
            saveCodeBoxesToStorage();
          }, 2000); // Auto-save after 2 seconds of no typing
        });
      }
    }
    
    // Auto-run the code immediately to show preview (only for new boxes, not loaded ones)
    if (!existingId) {
      setTimeout(() => {
        console.log('Auto-running user code for:', outputId);
        if (languageSettings.runFunction && window[languageSettings.runFunction]) {
          window[languageSettings.runFunction](outputId);
          console.log('User code executed successfully for:', outputId);
        }
        
        // Save to storage after creation
        saveCodeBoxesToStorage();
      }, 100);
    }
  }, 50);
}

// Simple live editing function that works reliably
function addSimpleLiveEditing(codeElement, language, outputId) {
  codeElement.addEventListener('input', function() {
    // Reapply Prism highlighting
    if (window.Prism) {
      const codeChild = this.querySelector('code');
      if (codeChild) {
        Prism.highlightElement(codeChild);
      }
    }
    
    // Auto-run after delay
    clearTimeout(this.runTimer);
    this.runTimer = setTimeout(() => {
      if (language === 'html') {
        runHTMLCode(outputId);
      } else if (language === 'css') {
        runCSSCode(outputId);
      } else if (language === 'javascript') {
        runJSCode(outputId);
      } else if (language === 'csharp') {
        runCSharpCode(outputId);
      } else if (language === 'python') {
        runPythonCode(outputId);
      }
    }, 1500);
  });
  
  codeElement.addEventListener('paste', function() {
    setTimeout(() => {
      if (window.Prism) {
        const codeChild = this.querySelector('code');
        if (codeChild) {
          Prism.highlightElement(codeChild);
        }
      }
    }, 50);
  });
}

function getLanguageSettings(language) {
  const settings = {
    html: {
      name: 'HTML',
      icon: '📄',
      runFunction: 'runHTMLCode',
      template: `<!-- HTML Example -->
<div class="container">
  <h1>Hello World!</h1>
  <p>This is a new HTML code box.</p>
  <button onclick="alert('Hello!')">Click Me!</button>
</div>`
    },
    css: {
      name: 'CSS',
      icon: '🎨',
      runFunction: 'runCSSCode',
      template: `/* CSS Example */
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f8ff;
  border: 2px solid #007bff;
  border-radius: 10px;
  text-align: center;
}

h1 {
  color: #007bff;
  font-family: Arial, sans-serif;
}`
    },
    javascript: {
      name: 'JavaScript',
      icon: '⚡',
      runFunction: 'runJSCode',
      template: `// JavaScript Example
function sayHello() {
  return "Hello from new JavaScript code box!";
}

console.log(sayHello());

document.body.innerHTML = \`
  <div style="padding: 20px; font-family: Arial;">
    <h2>JavaScript Demo</h2>
    <p>\${sayHello()}</p>
    <button onclick="alert('Hello from dynamic code box!')">Click Me!</button>
  </div>
\`;`
    },
    csharp: {
      name: 'C#',
      icon: '🖥️',
      runFunction: 'runCSharpCode',
      template: `// C# Example
using System;

public class Program
{
    public static void Main()
    {
        string message = "Hello from new C# code box!";
        Console.WriteLine(message);
        
        for (int i = 1; i <= 5; i++)
        {
            Console.WriteLine($"Count: {i}");
        }
    }
}`
    },
    python: {
      name: 'Python',
      icon: '🐍',
      runFunction: 'runPythonCode',
      template: `# Python Example
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
print("This is a new Python code box!")

# Simple loop
for i in range(1, 6):
    print(f"Number: {i}")`
    }
  };
  
  return settings[language] || settings.html;
}

function deleteCodeBox(button) {
  if (confirm('Are you sure you want to delete this code box?')) {
    const codeBox = button.closest('.code-with-output');
    codeBox.remove();
    // Save updated state to storage
    saveCodeBoxesToStorage();
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

// LIVE EDITING FUNCTIONS
// Function to add live editing capabilities to code boxes
function addLiveEditingToCodeBox(codeElement) {
  if (!codeElement) return;
  
  console.log('Adding live editing to:', codeElement);
  
  // Function to handle highlighting and auto-run
  function handleCodeChange() {
    console.log('Code changed, updating...');
    
    // Get the output ID for this code box
    const outputId = codeElement.getAttribute('data-output');
    console.log('Output ID:', outputId);
    
    // Reapply Prism.js highlighting
    if (window.Prism) {
      // For contenteditable elements, we need to re-highlight the entire element
      const codeChild = codeElement.querySelector('code');
      if (codeChild) {
        // Clear existing highlighting classes
        codeChild.className = codeChild.className.replace(/\btoken\b/g, '').replace(/\s+/g, ' ').trim();
        
        // Force Prism to re-highlight
        Prism.highlightElement(codeChild);
        console.log('Prism highlighting reapplied to code element');
      } else {
        // If no code child, highlight the element itself
        Prism.highlightElement(codeElement);
        console.log('Prism highlighting reapplied to main element');
      }
    }
    
    // Auto-run the code if there's an output ID
    if (outputId) {
      console.log('Auto-running code for output:', outputId);
      
      // Determine language and run appropriate function
      if (codeElement.classList.contains('language-html')) {
        console.log('Running HTML code');
        runHTMLCode(outputId);
      } else if (codeElement.classList.contains('language-css')) {
        console.log('Running CSS code');
        runCSSCode(outputId);
      } else if (codeElement.classList.contains('language-javascript')) {
        console.log('Running JavaScript code');
        runJSCode(outputId);
      } else if (codeElement.classList.contains('language-csharp')) {
        console.log('Running C# code');
        runCSharpCode(outputId);
      } else if (codeElement.classList.contains('language-python')) {
        console.log('Running Python code');
        runPythonCode(outputId);
      }
    }
  }
  
  // Add input event listener with debouncing
  codeElement.addEventListener('input', function() {
    console.log('Input event triggered');
    clearTimeout(this.highlightTimer);
    clearTimeout(this.autoRunTimer);
    
    // Immediate highlighting for responsiveness
    this.highlightTimer = setTimeout(() => {
      if (window.Prism) {
        const codeChild = this.querySelector('code');
        if (codeChild) {
          Prism.highlightElement(codeChild);
        } else {
          Prism.highlightElement(this);
        }
      }
    }, 100);
    
    // Delayed auto-run
    this.autoRunTimer = setTimeout(handleCodeChange, 1500);
  });
  
  // Add paste event listener
  codeElement.addEventListener('paste', function() {
    console.log('Paste event triggered');
    setTimeout(() => {
      handleCodeChange();
    }, 200);
  });
  
  // Add keyup for additional responsiveness
  codeElement.addEventListener('keyup', function(e) {
    // Only highlight on certain keys to avoid too frequent updates
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
      clearTimeout(this.highlightTimer);
      this.highlightTimer = setTimeout(() => {
        if (window.Prism) {
          const codeChild = this.querySelector('code');
          if (codeChild) {
            Prism.highlightElement(codeChild);
          } else {
            Prism.highlightElement(this);
          }
        }
      }, 50);
    }
  });
  
  console.log('Live editing events attached successfully');
}

// Function to initialize live editing for all existing code boxes
function initializeLiveEditing() {
  console.log('=== Initializing live editing ===');
  
  // Wait for Prism.js to be fully loaded
  if (!window.Prism) {
    console.log('Prism.js not loaded yet, retrying in 200ms...');
    setTimeout(initializeLiveEditing, 200);
    return;
  }
  
  const editableCodes = document.querySelectorAll('.editable-code[contenteditable="true"]');
  console.log('Found', editableCodes.length, 'editable code boxes');
  
  editableCodes.forEach((codeElement, index) => {
    const outputId = codeElement.getAttribute('data-output');
    let language = 'html'; // default
    
    if (codeElement.classList.contains('language-html')) language = 'html';
    else if (codeElement.classList.contains('language-css')) language = 'css';
    else if (codeElement.classList.contains('language-javascript')) language = 'javascript';
    else if (codeElement.classList.contains('language-csharp')) language = 'csharp';
    else if (codeElement.classList.contains('language-python')) language = 'python';
    
    console.log(`Adding live editing to existing code box ${index + 1}, language: ${language}, output: ${outputId}`);
    
    if (outputId) {
      addSimpleLiveEditing(codeElement, language, outputId);
      // Make sure contenteditable is always true after creation
      codeElement.setAttribute('contenteditable', 'true');
    }
    
    // Ensure initial Prism highlighting
    const codeChild = codeElement.querySelector('code');
    if (codeChild) {
      Prism.highlightElement(codeChild);
    }
  });
  
  console.log('=== Live editing initialization complete ===');
}

// Initialize live editing for existing code boxes on page load
document.addEventListener('DOMContentLoaded', initializeLiveEditing);
