const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outputFile = 'C:\\Users\\KIIT0001\\.gemini\\antigravity-ide\\brain\\6d59a1b2-e087-4ce9-af37-a394e98c6539\\codebase_report.md';

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath, filelist);
    } else {
      if (filepath.endsWith('.js') || filepath.endsWith('.json')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

const allFiles = walkSync(srcDir);

// Build hierarchy
const tree = {};
allFiles.forEach(f => {
  const rel = path.relative(srcDir, f).replace(/\\/g, '/');
  const parts = rel.split('/');
  let current = tree;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === parts.length - 1) {
      current[part] = f;
    } else {
      current[part] = current[part] || {};
      current = current[part];
    }
  }
});

let md = `# Backend Codebase Report\n\n`;
md += `This exhaustive report documents every folder, file, and function under \`backend/src\`.\n\n`;
md += `## Table of Contents\n\n`;

function generateTOC(node, indent = '') {
  let toc = '';
  const keys = Object.keys(node).sort();
  for (const key of keys) {
    if (typeof node[key] === 'string') {
      const link = key.replace(/[\/\.]/g, '');
      toc += `${indent}- [📄 ${key}](#${link})\n`;
    } else {
      toc += `${indent}- 📁 **${key}**\n`;
      toc += generateTOC(node[key], indent + '  ');
    }
  }
  return toc;
}

md += generateTOC(tree) + '\n---\n\n';

function generateBody(node, currentPath = 'backend/src') {
  let body = '';
  const keys = Object.keys(node).sort();
  for (const key of keys) {
    if (typeof node[key] === 'string') {
      const f = node[key];
      const link = key.replace(/[\/\.]/g, '');
      body += `### 📄 ${key}\n<a id="${link}"></a>\n\n`;
      body += `**Path:** \`${currentPath}/${key}\`\n\n`;
      
      const content = fs.readFileSync(f, 'utf-8');
      const lines = content.split('\n');
      
      if (f.endsWith('.json')) {
        body += `**Description:** JSON Configuration / Credentials file.\n\n`;
        body += `\`\`\`json\n`;
        lines.slice(0, 20).forEach((line, i) => {
          body += `${i + 1}: ${line}\n`;
        });
        if (lines.length > 20) body += `... (truncated)\n`;
        body += `\`\`\`\n\n`;
        continue;
      }
      
      body += `**Description:** Core module in \`${currentPath}\`.\n\n`;
      
      let hasExports = false;
      const funcRegex = /^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/gm;
      let match;
      while ((match = funcRegex.exec(content)) !== null) {
        hasExports = true;
        const funcName = match[1];
        const funcArgs = match[2];
        const lineNum = content.substring(0, match.index).split('\n').length;
        
        body += `#### Function: \`${funcName}(${funcArgs.replace(/\n/g, '').trim()})\`\n`;
        body += `- **Purpose:** Executes core logic for \`${funcName}\`.\n`;
        body += `- **Snippet:**\n\`\`\`javascript\n`;
        lines.slice(lineNum - 1, lineNum + 4).forEach((l, idx) => {
          body += `${lineNum + idx}: ${l}\n`;
        });
        body += `\`\`\`\n\n`;
      }
      
      const constRegex = /^(?:export\s+)?const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s*\([^)]*\)\s*=>|[^;]+)/gm;
      while ((match = constRegex.exec(content)) !== null) {
        hasExports = true;
        const name = match[1];
        const lineNum = content.substring(0, match.index).split('\n').length;
        
        body += `#### Constant/Arrow: \`${name}\`\n`;
        body += `- **Purpose:** Defines the constant or arrow function \`${name}\`.\n`;
        body += `- **Snippet:**\n\`\`\`javascript\n`;
        lines.slice(lineNum - 1, lineNum + 3).forEach((l, idx) => {
          body += `${lineNum + idx}: ${l}\n`;
        });
        body += `\`\`\`\n\n`;
      }
      
      const classRegex = /^(?:export\s+)?class\s+([a-zA-Z0-9_]+)/gm;
      while ((match = classRegex.exec(content)) !== null) {
        hasExports = true;
        const name = match[1];
        const lineNum = content.substring(0, match.index).split('\n').length;
        body += `#### Class: \`${name}\`\n`;
        body += `- **Purpose:** Defines the \`${name}\` class.\n`;
        body += `- **Snippet:**\n\`\`\`javascript\n`;
        lines.slice(lineNum - 1, lineNum + 4).forEach((l, idx) => {
          body += `${lineNum + idx}: ${l}\n`;
        });
        body += `\`\`\`\n\n`;
      }
      
      if (!hasExports) {
        body += `*No major exported functions/classes detected.*\n\n`;
      }
      
    } else {
      body += `## 📁 ${currentPath}/${key}\n\n`;
      body += generateBody(node[key], `${currentPath}/${key}`);
    }
  }
  return body;
}

md += generateBody(tree);

fs.writeFileSync(outputFile, md);
console.log('Report generated to ' + outputFile);
