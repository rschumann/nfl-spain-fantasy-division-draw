import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const MAX_FILE_LINES = 179;
const SCANNED_EXTENSIONS = new Set(['.ts', '.js', '.mjs', '.cjs', '.css', '.html']);
const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'dist-server',
  'coverage',
  '.data',
  '.git',
  '.firebase'
]);

function getFiles(dir) {
  const entries = readdirSync(dir);
  const result = [];
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      result.push(...getFiles(fullPath));
    } else if (SCANNED_EXTENSIONS.has(extname(fullPath))) {
      result.push(fullPath);
    }
  }
  return result;
}

function verifyLimits() {
  const dirs = ['src', 'tests', 'scripts'];
  const violations = [];
  for (const dir of dirs) {
    try {
      const files = getFiles(dir);
      for (const file of files) {
        const content = readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        if (lines > MAX_FILE_LINES) {
          violations.push(`${file}: ${lines} lines (max ${MAX_FILE_LINES})`);
        }
      }
    } catch {
      // directory might not exist yet during early steps
    }
  }
  if (violations.length > 0) {
    console.error('File line limit violations:\n' + violations.join('\n'));
    process.exit(1);
  }
  console.info('File line limits verified: all files <= 179 lines.');
}

verifyLimits();
