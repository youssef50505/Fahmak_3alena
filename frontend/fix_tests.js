const fs = require('fs');
const path = require('path');

function findSpecFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findSpecFiles(filePath, fileList);
    } else if (filePath.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const specFiles = findSpecFiles(path.join(__dirname, 'src', 'app'));

specFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('HttpClientTestingModule')) {
    content = "import { HttpClientTestingModule } from '@angular/common/http/testing';\n" + content;
  }
  if (!content.includes('RouterTestingModule')) {
    content = "import { RouterTestingModule } from '@angular/router/testing';\n" + content;
  }
  
  // Find the imports array inside configureTestingModule
  // usually looks like: imports: [ComponentName]
  content = content.replace(/imports:\s*\[(.*?)\]/g, (match, inner) => {
    let newInner = inner;
    if (!newInner.includes('HttpClientTestingModule')) {
      newInner += ', HttpClientTestingModule';
    }
    if (!newInner.includes('RouterTestingModule')) {
      newInner += ', RouterTestingModule';
    }
    return `imports: [${newInner}]`;
  });

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
