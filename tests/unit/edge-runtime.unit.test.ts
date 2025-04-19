import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Edge Runtime Check', () => {
  it('should not contain any edge runtime declarations', () => {
    // Check files that previously had edge runtime declarations
    const filesToCheck = [
      'app/api/upload/route.ts',
      'app/[domain]/[slug]/opengraph-image.tsx',
      'app/api/migrate/route.ts'
    ];
    
    let foundEdgeRuntime = false;
    let edgeRuntimeFiles = [];
    
    for (const file of filesToCheck) {
      const filePath = path.join(process.cwd(), file);
      console.log(`Checking file: ${filePath}`);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`File content for ${file}:`, content.substring(0, 200)); // Show first 200 chars
        
        const hasEdgeDeclaration = content.includes('export const runtime = "edge"') || 
                                 content.includes("export const runtime = 'edge'");
        console.log(`Has edge runtime declaration: ${hasEdgeDeclaration}`);
        
        if (hasEdgeDeclaration) {
          foundEdgeRuntime = true;
          edgeRuntimeFiles.push(file);
        }
      } else {
        console.log(`File not found: ${filePath}`);
      }
    }
    
    console.log(`Found edge runtime: ${foundEdgeRuntime}, in files: ${edgeRuntimeFiles.join(', ')}`);
    expect(foundEdgeRuntime, `Edge runtime found in: ${edgeRuntimeFiles.join(', ')}`).toBe(false);
  });
}); 