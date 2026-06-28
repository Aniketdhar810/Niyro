const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'KIIT0001', 'Desktop', 'Niyro', 'frontend', 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(srcDir);

let markdown = `# Frontend Codebase Report\n\n`;

let toc = `## Table of Contents\n\n`;
let body = ``;

files.forEach(file => {
  const relPath = path.relative(srcDir, file).replace(/\\/g, '/');
  const anchor = relPath.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  toc += `- [${relPath}](#${anchor})\n`;
  
  body += `\n---\n\n### <a id="${anchor}"></a>${relPath}\n\n`;
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  // Extract a brief description from the first few lines if they are comments
  let description = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].trim().startsWith('//')) {
      description += lines[i].trim().replace('//', '').trim() + ' ';
    }
  }
  if (description) {
    body += `**Description:** ${description.trim()}\n\n`;
  }
  
  body += `#### Exports & Entities\n\n`;
  let foundEntity = false;

  // Simple regex to find exports, functions, consts, classes
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    let isMatch = false;
    let name = '';
    let type = '';
    
    const exportFuncMatch = line.match(/^export\s+(async\s+)?function\s+([a-zA-Z0-9_]+)\s*\((.*)\)/);
    const funcMatch = line.match(/^(async\s+)?function\s+([a-zA-Z0-9_]+)\s*\((.*)\)/);
    const constMatch = line.match(/^(export\s+)?const\s+([a-zA-Z0-9_]+)\s*=/);
    const classMatch = line.match(/^(export\s+)?class\s+([a-zA-Z0-9_]+)/);
    const typeMatch = line.match(/^(export\s+)?(type|interface)\s+([a-zA-Z0-9_]+)/);
    
    if (file.endsWith('.json')) {
      if (i === 0) {
        body += `- **JSON Configuration**: Contains static JSON data.\n`;
        body += "```json\n";
        for (let j = 0; j < Math.min(5, lines.length); j++) {
           body += `${j+1}: ${lines[j]}\n`;
        }
        body += "...\n```\n";
      }
      i = lines.length;
      continue;
    }
    
    if (exportFuncMatch) {
      isMatch = true; type = 'Function'; name = exportFuncMatch[2];
    } else if (funcMatch) {
      isMatch = true; type = 'Function'; name = funcMatch[2];
    } else if (constMatch) {
      isMatch = true; type = 'Constant/Component'; name = constMatch[2];
    } else if (classMatch) {
      isMatch = true; type = 'Class'; name = classMatch[2];
    } else if (typeMatch) {
      isMatch = true; type = 'Type/Interface'; name = typeMatch[3];
    }
    
    if (isMatch) {
      foundEntity = true;
      body += `- **${type}**: \`${name}\`\n`;
      body += `  - **Signature/Declaration**: \`${line.trim()}\`\n`;
      body += `  - **Code Snippet**:\n`;
      body += "  ```typescript\n";
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        body += `  ${j+1}: ${lines[j]}\n`;
      }
      body += "  ```\n\n";
    }
    i++;
  }
  
  if (!foundEntity && !file.endsWith('.json')) {
    body += `*No major exports/functions detected by simple parser.*\n\n`;
  }
  
});

markdown += toc + body;

fs.writeFileSync('C:/Users/KIIT0001/.gemini/antigravity-ide/brain/6d59a1b2-e087-4ce9-af37-a394e98c6539/frontend_codebase_report.md', markdown);
console.log("Frontend report generated successfully!");
