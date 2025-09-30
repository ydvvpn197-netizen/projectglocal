import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract icon names from JSX
function extractIconNames(content) {
  const iconPattern = /<([A-Z][a-zA-Z]*)\s+className[^>]*>/g;
  const icons = new Set();
  let match;
  
  while ((match = iconPattern.exec(content)) !== null) {
    const iconName = match[1];
    // Skip common HTML elements and React components
    if (!['div', 'span', 'button', 'input', 'form', 'img', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'ol', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot'].includes(iconName)) {
      icons.add(iconName);
    }
  }
  
  return Array.from(icons);
}

// Function to extract imported icons
function extractImportedIcons(content) {
  const importPattern = /import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/g;
  const imports = new Set();
  let match;
  
  while ((match = importPattern.exec(content)) !== null) {
    const importContent = match[1];
    // Split by comma and clean up
    const iconNames = importContent.split(',').map(name => name.trim());
    iconNames.forEach(name => {
      // Handle aliased imports like "Icon as IconName"
      const cleanName = name.split(' as ')[0].trim();
      if (cleanName) {
        imports.add(cleanName);
      }
    });
  }
  
  return Array.from(imports);
}

// Function to check a single file
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const usedIcons = extractIconNames(content);
    const importedIcons = extractImportedIcons(content);
    
    const missingIcons = usedIcons.filter(icon => !importedIcons.includes(icon));
    
    if (missingIcons.length > 0) {
      console.log(`\n❌ ${filePath}:`);
      console.log(`   Missing icons: ${missingIcons.join(', ')}`);
      return { file: filePath, missing: missingIcons };
    }
    
    return null;
  } catch (error) {
    console.log(`\n⚠️  Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

// Main function
function checkAllFiles() {
  console.log('🔍 Checking for missing icon imports...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const issues = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const result = checkFile(filePath);
        if (result) {
          issues.push(result);
        }
      }
    });
  }
  
  walkDir(srcDir);
  
  if (issues.length === 0) {
    console.log('✅ All icon imports are correct!');
  } else {
    console.log(`\n📊 Summary: Found ${issues.length} files with missing icon imports`);
    
    // Generate fix suggestions
    console.log('\n🔧 Suggested fixes:');
    issues.forEach(issue => {
      console.log(`\n${issue.file}:`);
      console.log(`   Add to imports: ${issue.missing.join(', ')}`);
    });
  }
  
  return issues;
}

// Run the check
checkAllFiles();

export { checkAllFiles, checkFile };
