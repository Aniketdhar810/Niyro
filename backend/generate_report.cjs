const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const categories = [
  'agents',
  'controllers',
  'credentials',
  'cron',
  'errors',
  'lib',
  'middleware',
  'routes',
  'tests',
  'utils',
  '' // root of src
];

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

let md = `# Backend Codebase Report\n\n`;
md += `This report documents all files, functions, and exports under \`backend/src\`.\n\n`;
md += `## Table of Contents\n\n`;

const filesByCategory = {};
categories.forEach(c => filesByCategory[c] = []);

allFiles.forEach(f => {
  const rel = path.relative(srcDir, f).replace(/\\/g, '/');
  const parts = rel.split('/');
  if (parts.length === 1) {
    filesByCategory[''].push({ filepath: f, rel });
  } else {
    filesByCategory[parts[0]].push({ filepath: f, rel });
  }
});

categories.forEach(c => {
  if (filesByCategory[c].length === 0) return;
  const catName = c === '' ? 'Root' : c;
  md += `- [${catName}](#${catName.toLowerCase()})\n`;
  filesByCategory[c].forEach(f => {
    const link = f.rel.replace(/[\/\.]/g, '');
    md += `  - [${f.rel}](#${link})\n`;
  });
});

md += `\n---\n\n`;

categories.forEach(c => {
  if (filesByCategory[c].length === 0) return;
  const catName = c === '' ? 'Root' : c;
  md += `## ${catName}\n\n`;
  
  filesByCategory[c].forEach(f => {
    md += `### ${f.rel}\n`;
    const link = f.rel.replace(/[\/\.]/g, '');
    md += `<a id="${link}"></a>\n\n`;
    
    md += `**Path:** \`backend/src/${f.rel}\`\n\n`;
    
    if (f.filepath.endsWith('.json')) {
      md += `**Description:** JSON Configuration / Credentials file.\n\n`;
      md += `\`\`\`json\n`;
      const content = fs.readFileSync(f.filepath, 'utf-8');
      const lines = content.split('\n');
      lines.slice(0, 15).forEach((line, i) => {
        md += `${i + 1}: ${line}\n`;
      });
      if (lines.length > 15) md += `... (truncated)\n`;
      md += `\`\`\`\n\n`;
      return;
    }

    const content = fs.readFileSync(f.filepath, 'utf-8');
    const lines = content.split('\n');
    
    md += `**Description:** Component in ${catName} module.\n\n`;
    
    const funcRegex = /^(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/gm;
    let match;
    let hasExports = false;
    
    while ((match = funcRegex.exec(content)) !== null) {
      hasExports = true;
      const funcName = match[1];
      const funcArgs = match[2];
      
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      md += `#### Function: \`${funcName}(${funcArgs.replace(/\n/g, '').trim()})\`\n`;
      md += `- **Purpose:** Handles logic for \`${funcName}\`.\n`;
      md += `- **Snippet:**\n`;
      md += `\`\`\`javascript\n`;
      lines.slice(lineNum - 1, lineNum + 4).forEach((l, idx) => {
        md += `${lineNum + idx}: ${l}\n`;
      });
      md += `\`\`\`\n\n`;
    }
    
    const constRegex = /^(?:export\s+)?const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s*\([^)]*\)\s*=>|[^;]+)/gm;
    while ((match = constRegex.exec(content)) !== null) {
      hasExports = true;
      const name = match[1];
      const isArrow = match[2].includes('=>');
      
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      md += `#### ${isArrow ? 'Arrow Function' : 'Constant'}: \`${name}\`\n`;
      md += `- **Purpose:** Exported or module-level variable \`${name}\`.\n`;
      md += `- **Snippet:**\n`;
      md += `\`\`\`javascript\n`;
      lines.slice(lineNum - 1, lineNum + 3).forEach((l, idx) => {
        md += `${lineNum + idx}: ${l}\n`;
      });
      md += `\`\`\`\n\n`;
    }
    
    const classRegex = /^(?:export\s+)?class\s+([a-zA-Z0-9_]+)/gm;
    while ((match = classRegex.exec(content)) !== null) {
      hasExports = true;
      const name = match[1];
      const lineNum = content.substring(0, match.index).split('\n').length;
      md += `#### Class: \`${name}\`\n`;
      md += `- **Purpose:** Defines the \`${name}\` class.\n`;
      md += `- **Snippet:**\n`;
      md += `\`\`\`javascript\n`;
      lines.slice(lineNum - 1, lineNum + 4).forEach((l, idx) => {
        md += `${lineNum + idx}: ${l}\n`;
      });
      md += `\`\`\`\n\n`;
    }

    if (!hasExports) {
      md += `*No major exported functions/classes detected via simple parsing.*\n\n`;
    }
  });
});

fs.writeFileSync(path.join(__dirname, 'report.md'), md);
console.log('Report generated to report.md');
