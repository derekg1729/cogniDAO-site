/**
 * Environment Variable Consistency Check
 * 
 * This script checks that critical environment variables are consistent across
 * different environment files (.env.local, .env.preview, .env.production).
 * 
 * Usage: node scripts/check-env-consistency.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Environment files to check
const ENV_FILES = [
  '.env.local',
  '.env.preview',
  '.env.production'
];

// Variables that must be consistent across environments
const CONSISTENT_VARIABLES = [
  'NEXT_PUBLIC_GA_ID'
];

// Variables required in all environments
const REQUIRED_VARIABLES = [
  'NEXT_PUBLIC_ROOT_DOMAIN',
  'NEXTAUTH_SECRET',
  'AUTH_GITHUB_ID',
  'AUTH_GITHUB_SECRET',
  'DATABASE_URL',
  'POSTGRES_URL'
];

// Main function
function checkEnvironmentConsistency() {
  console.log('Checking environment variable consistency...');
  
  // Load all environment files
  const envs = {};
  let hasErrors = false;
  
  // Check if all files exist
  for (const file of ENV_FILES) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing environment file: ${file}`);
      hasErrors = true;
      continue;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      envs[file] = dotenv.parse(content);
    } catch (error) {
      console.error(`❌ Error parsing ${file}: ${error.message}`);
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.error('❌ Fix missing environment files before continuing.');
    process.exit(1);
  }
  
  // Check required variables
  for (const file in envs) {
    const missingVars = REQUIRED_VARIABLES.filter(variable => {
      return !envs[file][variable] || envs[file][variable].trim() === '';
    });
    
    if (missingVars.length > 0) {
      console.error(`❌ Missing required variables in ${file}: ${missingVars.join(', ')}`);
      hasErrors = true;
    }
  }
  
  // Check consistency across environments
  for (const variable of CONSISTENT_VARIABLES) {
    const values = Object.entries(envs).map(([file, env]) => ({
      file,
      value: env[variable]
    }));
    
    const firstValue = values[0].value;
    const inconsistentFiles = values.filter(v => v.value !== firstValue);
    
    if (inconsistentFiles.length > 0) {
      console.error(`❌ Inconsistent ${variable} values:`);
      values.forEach(v => {
        console.error(`   - ${v.file}: ${v.value || '(undefined)'}`);
      });
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.error('❌ Environment consistency check failed. Fix the issues before committing.');
    process.exit(1);
  } else {
    console.log('✅ Environment consistency check passed!');
  }
}

// Run the check
checkEnvironmentConsistency(); 