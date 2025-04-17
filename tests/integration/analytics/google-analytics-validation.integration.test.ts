import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

describe.skip('Google Analytics Validation', () => {
  // Load environment variables from .env files
  beforeAll(() => {
    // Load .env.local if it exists
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    }
  });

  it('should have a real Google Analytics ID, not a placeholder', () => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    
    // GA ID must be defined
    expect(gaId).toBeDefined();
    
    // Check if it's a valid GA4 ID (starts with G- followed by alphanumeric characters)
    const isValidGaId = /^G-[A-Z0-9]{10,}$/i.test(gaId || '');
    
    // Check if it's a placeholder
    const isPlaceholder = 
      gaId === '' || 
      gaId === 'YOUR_GA_ID' || 
      gaId === 'G-XXXXXXXXXX' ||
      (gaId || '').includes('XXXXXXXXXX');
    
    // Test should fail if using a placeholder
    if (isPlaceholder) {
      throw new Error(`
        Using a placeholder for Google Analytics ID: ${gaId}
        You must replace this with a real Google Analytics 4 Measurement ID.
        The ID should start with G- followed by alphanumeric characters.
        Example: G-ABC123XYZ9
        
        To fix this:
        1. Create a Google Analytics 4 property
        2. Get your Measurement ID
        3. Update NEXT_PUBLIC_GA_ID in your .env.local file
      `);
    }
    
    // Verify it's a valid GA ID format
    expect(isValidGaId).toBeTruthy();
  });

  it('should have Google Analytics properly configured in the environment', () => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    
    // GA ID must be defined
    expect(gaId).toBeDefined();
    
    // Check if it's a valid GA4 ID (starts with G- followed by alphanumeric characters)
    const isValidGaId = /^G-[A-Z0-9]{10,}$/i.test(gaId || '');
    
    // Test should fail if not a valid GA ID
    expect(isValidGaId).toBeTruthy();
    
    if (!isValidGaId) {
      throw new Error(`
        Invalid Google Analytics ID format: ${gaId}
        The ID should start with G- followed by alphanumeric characters.
        Example: G-ABC123XYZ9
      `);
    }
  });
}); 