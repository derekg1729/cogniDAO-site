import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

describe.skip('Google Analytics Production Configuration', () => {
  const envFiles = {
    production: path.join(process.cwd(), '.env.production'),
    preview: path.join(process.cwd(), '.env.preview')
  };

  // Store original env
  const originalEnv = { ...process.env };
  
  beforeAll(() => {
    // Load production environment variables if the file exists
    if (fs.existsSync(envFiles.production)) {
      const envConfig = dotenv.parse(fs.readFileSync(envFiles.production));
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    }
  });

  it('should have .env.production file', () => {
    expect(fs.existsSync(envFiles.production)).toBeTruthy();
  });

  it('should have NEXT_PUBLIC_GA_ID defined in production environment', () => {
    // Skip if production env file doesn't exist (the previous test will fail)
    if (!fs.existsSync(envFiles.production)) {
      return;
    }
    
    const productionEnv = dotenv.parse(fs.readFileSync(envFiles.production));
    expect(productionEnv.NEXT_PUBLIC_GA_ID).toBeDefined();
    
    if (!productionEnv.NEXT_PUBLIC_GA_ID) {
      throw new Error(`
        NEXT_PUBLIC_GA_ID is not defined in .env.production
        Google Analytics will not work in production environment.
        
        To fix this:
        1. Add NEXT_PUBLIC_GA_ID="G-NGR51LW106" to .env.production
      `);
    }
  });

  it('should have a valid Google Analytics ID in production environment', () => {
    // Skip if production env file doesn't exist (the first test will fail)
    if (!fs.existsSync(envFiles.production)) {
      return;
    }
    
    const productionEnv = dotenv.parse(fs.readFileSync(envFiles.production));
    const gaId = productionEnv.NEXT_PUBLIC_GA_ID;
    
    // Skip if GA ID is not defined (the previous test will fail)
    if (!gaId) {
      return;
    }
    
    // Check if it's a valid GA4 ID (starts with G- followed by alphanumeric characters)
    const isValidGaId = /^G-[A-Z0-9]{10,}$/i.test(gaId);
    
    // Check if it's a placeholder
    const isPlaceholder = 
      gaId === '' || 
      gaId === 'YOUR_GA_ID' || 
      gaId === 'G-XXXXXXXXXX' ||
      gaId.includes('XXXXXXXXXX');
    
    // Test should fail if using a placeholder in production
    if (isPlaceholder) {
      throw new Error(`
        Using a placeholder for Google Analytics ID in production: ${gaId}
        You must replace this with a real Google Analytics 4 Measurement ID.
        The ID should start with G- followed by alphanumeric characters.
        Example: G-ABC123XYZ9
        
        To fix this:
        1. Update NEXT_PUBLIC_GA_ID in your .env.production file with your real GA ID
      `);
    }
    
    // Verify it's a valid GA ID format
    expect(isValidGaId).toBeTruthy();
    
    if (!isValidGaId) {
      throw new Error(`
        Invalid Google Analytics ID format in production: ${gaId}
        The ID should start with G- followed by alphanumeric characters.
        Example: G-ABC123XYZ9
      `);
    }
  });

  it('should have the same Google Analytics ID in preview and production environments', () => {
    // Skip if either file doesn't exist
    if (!fs.existsSync(envFiles.production) || !fs.existsSync(envFiles.preview)) {
      return;
    }
    
    const productionEnv = dotenv.parse(fs.readFileSync(envFiles.production));
    const previewEnv = dotenv.parse(fs.readFileSync(envFiles.preview));
    
    const productionGaId = productionEnv.NEXT_PUBLIC_GA_ID;
    const previewGaId = previewEnv.NEXT_PUBLIC_GA_ID;
    
    // Skip if either GA ID is not defined
    if (!productionGaId || !previewGaId) {
      return;
    }
    
    // Both environments should use the same GA ID for consistent analytics
    expect(productionGaId).toBe(previewGaId);
    
    if (productionGaId !== previewGaId) {
      throw new Error(`
        Google Analytics ID mismatch between environments:
        - Production: ${productionGaId}
        - Preview: ${previewGaId}
        
        For consistent analytics tracking, both environments should use the same GA ID.
      `);
    }
  });
}); 