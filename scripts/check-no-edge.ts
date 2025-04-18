/**
 * Edge Runtime Detection
 * 
 * Scans codebase for Vercel Edge runtime usage.
 */

const glob = require('glob');
const fs = require('fs/promises');

// Edge patterns
const PATTERNS = [
  "export const runtime = 'edge'",
  "from 'next/server'",
  "import { NextRequest",
  "import { NextResponse",
];

async function main() {
  console.log("🔍 Checking for Edge runtime usage...");
  
  const files = await glob.glob('**/*.{ts,tsx,js,jsx}', { 
    ignore: ['node_modules/**', '.next/**', 'scripts/check-no-edge.ts']
  });
  
  let edgeFiles = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    if (PATTERNS.some(p => content.includes(p))) {
      edgeFiles.push(file);
    }
  }

  if (edgeFiles.length) {
    console.error('❌ Edge usage in:');
    edgeFiles.forEach(f => console.error(` - ${f}`));
    process.exit(1);
  } else {
    console.log('✅ No edge-specific code detected.');
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 