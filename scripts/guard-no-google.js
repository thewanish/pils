// Fails if any source file contains Google Places/Maps media URLs
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const PATTERN = /(places|maps)\.googleapis\.com\//i;

let failures = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (PATTERN.test(content)) {
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (PATTERN.test(line)) {
          failures.push(`${path.relative(ROOT, filePath)}#L${idx + 1}: ${line.trim()}`);
        }
      });
    }
  } catch (_) {}
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p);
    } else if (e.isFile()) {
      if (/\.(ts|tsx|js|jsx|json|md)$/i.test(e.name)) scanFile(p);
    }
  }
}

walk(SRC);

if (failures.length) {
  console.error('\nERROR: Found forbidden Google API media references in src/:');
  failures.forEach((f) => console.error(' -', f));
  console.error('\nPlease migrate to Firebase Storage URLs.');
  process.exit(1);
} else {
  console.log('✅ No Google Places/Maps media URLs found in src/.');
}
