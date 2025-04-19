/**
 * Edge Runtime Detection
 * 
 * Scans codebase for Vercel Edge runtime usage.
 */

const glob = require('glob');
const fs = require('fs/promises');

// Edge patterns - only look for explicit edge runtime declarations
const PATTERNS = [
  "export const runtime = 'edge'",
  "export const runtime = \"edge\"",
  "from 'openai-edge'",
  "import OpenAI from 'openai-edge'",
  "from '@vercel/blob'",
  "from \"@vercel/blob\"",
  "import { put } from '@vercel/blob'",
  "import { put } from \"@vercel/blob\""
];

async function main() {
  console.log("🔍 Checking for explicit Edge runtime usage...");
  
  const files = await glob.glob('**/*.{ts,tsx,js,jsx}', { 
    ignore: [
      'node_modules/**', 
      '.next/**', 
      'scripts/check-no-edge.ts',
      'tests/**',
      'eslint-plugin-custom-rules/**'
    ]
  });
  
  let edgeFiles = [];

  for (const file of files) {
    if (file === 'scripts/check-no-edge.js') continue; // Skip this script
    const content = await fs.readFile(file, 'utf8');
    if (PATTERNS.some(p => content.includes(p))) {
      edgeFiles.push(file);
    }
  }

  if (edgeFiles.length) {
    console.error('❌ Edge runtime usage in:');
    edgeFiles.forEach(f => console.error(` - ${f}`));
    process.exit(1);
  } else {
    console.log('✅ No edge-specific runtime declarations detected.');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 