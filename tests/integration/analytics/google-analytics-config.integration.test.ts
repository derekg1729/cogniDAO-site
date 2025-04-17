import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

describe.skip('Google Analytics Configuration', () => {
  const envFiles = {
    local: path.join(process.cwd(), '.env.local'),
    preview: path.join(process.cwd(), '.env.preview'),
    production: path.join(process.cwd(), '.env.production')
  };

  // Store original env
  const originalEnv = { ...process.env };
  
  // Store env file contents to restore after tests
  const envFileContents: Record<string, string | null> = {
    local: null,
    preview: null,
    production: null
  };

  beforeAll(() => {
    // Save original env file contents if they exist
    Object.entries(envFiles).forEach(([key, filePath]) => {
      if (fs.existsSync(filePath)) {
        envFileContents[key] = fs.readFileSync(filePath, 'utf8');
      }
    });
  });

  afterAll(() => {
    // Restore original env
    process.env = { ...originalEnv };
    
    // Restore original env file contents
    Object.entries(envFiles).forEach(([key, filePath]) => {
      if (envFileContents[key]) {
        fs.writeFileSync(filePath, envFileContents[key]!);
      }
    });
  });

  it('should have NEXT_PUBLIC_GA_ID defined in environment variables', () => {
    // Check if GA ID is defined in any of the env files
    let gaIdFound = false;

    Object.entries(envFiles).forEach(([envType, filePath]) => {
      if (fs.existsSync(filePath)) {
        const envContent = fs.readFileSync(filePath, 'utf8');
        const parsedEnv = dotenv.parse(envContent);
        
        if (parsedEnv.NEXT_PUBLIC_GA_ID) {
          gaIdFound = true;
        }
      }
    });

    expect(gaIdFound).toBeTruthy();
  });

  it('should have a real Google Analytics ID, not a placeholder', () => {
    // Check if GA ID is a placeholder in any of the env files
    let realGaIdFound = false;
    let placeholderFound = false;
    let placeholderValue = '';

    Object.entries(envFiles).forEach(([envType, filePath]) => {
      if (fs.existsSync(filePath)) {
        const envContent = fs.readFileSync(filePath, 'utf8');
        const parsedEnv = dotenv.parse(envContent);
        
        if (parsedEnv.NEXT_PUBLIC_GA_ID) {
          const gaId = parsedEnv.NEXT_PUBLIC_GA_ID;
          
          // Check if it's a valid GA4 ID
          const isValidGaId = /^G-[A-Z0-9]{10,}$/i.test(gaId);
          
          // Check if it's a placeholder
          const isPlaceholder = 
            gaId === '' || 
            gaId === 'YOUR_GA_ID' || 
            gaId === 'G-XXXXXXXXXX' ||
            gaId.includes('XXXXXXXXXX');
          
          if (isValidGaId && !isPlaceholder) {
            realGaIdFound = true;
          }
          
          if (isPlaceholder) {
            placeholderFound = true;
            placeholderValue = gaId;
          }
        }
      }
    });

    // If we found a placeholder but no real GA ID, the test should fail
    if (placeholderFound && !realGaIdFound) {
      throw new Error(`
        Using a placeholder for Google Analytics ID: ${placeholderValue}
        You must replace this with a real Google Analytics 4 Measurement ID.
        The ID should start with G- followed by alphanumeric characters.
        Example: G-ABC123XYZ9
        
        To fix this:
        1. Create a Google Analytics 4 property
        2. Get your Measurement ID
        3. Update NEXT_PUBLIC_GA_ID in your .env.local file
      `);
    }
    
    // Either a real GA ID should be found or no placeholder should be used
    expect(realGaIdFound || !placeholderFound).toBeTruthy();
  });

  it('should have GoogleAnalytics component in app/layout.tsx', () => {
    const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
    expect(fs.existsSync(layoutPath)).toBeTruthy();
    
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Check for import
    expect(layoutContent).toContain('import { GoogleAnalytics } from "@next/third-parties/google"');
    
    // Check for component usage with environment variable
    expect(layoutContent).toContain('process.env.NEXT_PUBLIC_GA_ID');
    expect(layoutContent).toContain('<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID}');
  });

  it('should have @next/third-parties dependency in package.json', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    expect(fs.existsSync(packageJsonPath)).toBeTruthy();
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if the dependency exists in dependencies or devDependencies
    const hasDependency = 
      (packageJson.dependencies && packageJson.dependencies['@next/third-parties']) ||
      (packageJson.devDependencies && packageJson.devDependencies['@next/third-parties']);
    
    expect(hasDependency).toBeTruthy();
  });

  it('should have Google Analytics documentation', () => {
    const docsPath = path.join(process.cwd(), 'docs/google-analytics.md');
    expect(fs.existsSync(docsPath)).toBeTruthy();
    
    const docsContent = fs.readFileSync(docsPath, 'utf8');
    
    // Check for essential documentation sections
    expect(docsContent).toContain('# Google Analytics Integration');
    expect(docsContent).toContain('## Setup');
    expect(docsContent).toContain('NEXT_PUBLIC_GA_ID');
  });

  it('should have Google Analytics ID in all environment example files', () => {
    const exampleFiles = [
      path.join(process.cwd(), '.env.local.example'),
      path.join(process.cwd(), '.env.preview.example'),
      path.join(process.cwd(), '.env.production.example')
    ];
    
    exampleFiles.forEach(filePath => {
      expect(fs.existsSync(filePath)).toBeTruthy();
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      expect(fileContent).toContain('NEXT_PUBLIC_GA_ID');
    });
  });
}); 