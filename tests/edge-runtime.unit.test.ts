import { describe, it, expect } from 'vitest';

describe('Edge Runtime Check', () => {
  it('should not use Vercel Edge runtime or Edge-only APIs', async () => {
    // Use our actual check script result instead of hardcoded expectation
    const { execSync } = require('child_process');
    
    try {
      execSync('node scripts/check-no-edge.js', { stdio: 'pipe' });
      // If we get here, the check passed, so no edge runtime detected
      expect(true).toBe(true); // All good!
    } catch (error) {
      // If error, the check failed - meaning edge runtime was detected
      expect(false, 'Edge runtime detected, check failed').toBe(true);
    }
  });
}); 