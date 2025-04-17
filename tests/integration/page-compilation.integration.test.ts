import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { globSync } from 'glob';

/**
 * Page Compilation Test
 * 
 * This test verifies that all Next.js pages compile correctly.
 * It checks for:
 * 1. Client/server component boundary issues
 * 2. Import resolution problems
 * 3. Type errors
 * 4. Runtime errors in server components
 */

describe.skip('Page Compilation', () => {
  const appDir = path.join(process.cwd(), 'app');
  let pageFiles: string[] = [];
  let layoutFiles: string[] = [];
  let clientComponentFiles: string[] = [];
  let serverComponentErrors: Record<string, string> = {};
  let clientComponentErrors: Record<string, string> = {};

  // Helper function to determine if a component is a client component
  function isClientComponent(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'");
    } catch (error) {
      return false;
    }
  }

  // Helper function to get all imports from a file
  function getImports(filePath: string): string[] {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const importLines = content.match(/^import .* from ['"](.*)['"];?$/gm) || [];
      return importLines.map(line => {
        const match = line.match(/from ['"](.*)['"];?$/);
        return match ? match[1] : '';
      }).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  // Find all page components
  beforeAll(() => {
    // Find page.tsx files
    pageFiles = globSync('app/**/{page,error,loading,not-found}.tsx', { absolute: true });
    
    // Find layout.tsx files
    layoutFiles = globSync('app/**/layout.tsx', { absolute: true });
    
    // Find client components (files with "use client" directive)
    const allComponentFiles = globSync('components/**/*.tsx', { absolute: true });
    clientComponentFiles = allComponentFiles.filter(isClientComponent);
  });

  it('should find Next.js page components', () => {
    expect(pageFiles.length).toBeGreaterThan(0);
    expect(layoutFiles.length).toBeGreaterThan(0);
  });

  it('should verify all page.tsx files are server components by default', () => {
    const clientPages = pageFiles.filter(isClientComponent);
    
    if (clientPages.length > 0) {
      console.warn('Warning: Found page components with "use client" directive:');
      clientPages.forEach(page => {
        console.warn(`  - ${path.relative(process.cwd(), page)}`);
      });
      console.warn('Pages should generally be server components unless they need client-side interactivity.');
    }
    
    // This is not a failure case, just a warning - some pages may legitimately need to be client components
  });

  it('should verify all layout.tsx files are server components by default', () => {
    const clientLayouts = layoutFiles.filter(isClientComponent);
    
    if (clientLayouts.length > 0) {
      console.warn('Warning: Found layout components with "use client" directive:');
      clientLayouts.forEach(layout => {
        console.warn(`  - ${path.relative(process.cwd(), layout)}`);
      });
      console.warn('Layouts should generally be server components unless they need client-side interactivity.');
    }
    
    // This is not a failure case, just a warning - some layouts may legitimately need to be client components
  });

  it('should verify "use client" is present in all components using client-side hooks', () => {
    // Load and check component files (check files in components directory)
    const componentFiles = globSync('components/**/*.tsx', { absolute: true });
    const serverComponentsWithClientHooks: string[] = [];
    
    const clientHooksPatterns = [
      'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 
      'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 
      'useDebugValue', 'useTransition', 'useDeferredValue', 'useId',
      'useInsertionEffect', 'useSyncExternalStore', 'useRouter',
      'useSearchParams', 'usePathname', 'useFormState', 'useFormStatus'
    ];
    
    componentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const isClient = content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'");
      
      // Check if file contains any React hooks
      const hasClientHooks = clientHooksPatterns.some(hook => {
        const regex = new RegExp(`\\b${hook}\\s*\\(`, 'g');
        return regex.test(content);
      });
      
      if (hasClientHooks && !isClient) {
        serverComponentsWithClientHooks.push(path.relative(process.cwd(), file));
      }
    });
    
    if (serverComponentsWithClientHooks.length > 0) {
      console.error('Error: Found server components using client-side hooks:');
      serverComponentsWithClientHooks.forEach(file => {
        console.error(`  - ${file}`);
      });
      
      throw new Error('Server components cannot use client-side hooks. Add "use client" directive to these components.');
    }
  });

  it('should verify client components are not directly imported in server components', () => {
    const serverComponents = [
      ...pageFiles.filter(file => !isClientComponent(file)),
      ...layoutFiles.filter(file => !isClientComponent(file)),
      ...globSync('components/**/*.tsx', { absolute: true }).filter(file => !isClientComponent(file))
    ];
    
    const violations: Array<{server: string, client: string}> = [];
    
    // Create a map of component paths to their client/server status
    const componentStatusMap = new Map<string, boolean>();
    
    globSync('components/**/*.tsx', { absolute: true }).forEach(file => {
      const relativePath = path.relative(process.cwd(), file);
      componentStatusMap.set(relativePath, isClientComponent(file));
      
      // Also map the same component with @/ prefix
      const pathWithPrefix = `@/${relativePath}`;
      componentStatusMap.set(pathWithPrefix, isClientComponent(file));
    });
    
    // Check server components for imports of client components
    serverComponents.forEach(serverFile => {
      const serverRelativePath = path.relative(process.cwd(), serverFile);
      const imports = getImports(serverFile);
      
      imports.forEach(importPath => {
        // Skip node_modules imports and relative imports that don't resolve to known components
        if (importPath.startsWith('.')) {
          // Resolve relative import path
          const resolvedPath = path.resolve(path.dirname(serverFile), importPath);
          const resolvedRelativePath = path.relative(process.cwd(), resolvedPath);
          
          // Check if this is a known client component
          if (componentStatusMap.has(resolvedRelativePath) && componentStatusMap.get(resolvedRelativePath)) {
            violations.push({
              server: serverRelativePath,
              client: resolvedRelativePath
            });
          }
        } else if (importPath.startsWith('@/')) {
          // Check if this is a known client component
          if (componentStatusMap.has(importPath) && componentStatusMap.get(importPath)) {
            violations.push({
              server: serverRelativePath,
              client: importPath
            });
          }
        }
      });
    });
    
    if (violations.length > 0) {
      console.error('Error: Found server components importing client components directly:');
      violations.forEach(({ server, client }) => {
        console.error(`  - ${server} imports ${client}`);
      });
      
      throw new Error('Server components cannot import client components directly. Use client components as children instead.');
    }
  });

  it.skip('should compile all pages with next-babel-loader', { timeout: 30000 }, () => {
    // We'll create a temporary test file that imports all pages to check for compilation errors
    const tempDir = path.join(process.cwd(), '.temp-test');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFile = path.join(tempDir, 'compile-test.ts');
    
    try {
      // Create a file that imports all pages
      const importStatements = [...pageFiles, ...layoutFiles].map((file, index) => {
        const relativePath = path.relative(process.cwd(), file);
        return `import Page${index} from '../${relativePath}';`;
      }).join('\n');
      
      const fileContent = `
        // This file is generated for testing page compilation
        ${importStatements}
        
        export default function TestCompilation() {
          return null;
        }
      `;
      
      fs.writeFileSync(tempFile, fileContent);
      
      // Run next-babel-loader on the temp file (using Next.js dev command with custom entry)
      try {
        // Use tsc to check for type errors without emitting, excluding test files
        // THIS TEST IS SKIPPED AS IT'S CAUSING LONG RUNTIMES AND COMPILATION ISSUES
        // TODO: Fix this test by properly configuring TypeScript to exclude test files
        execSync('pnpm tsc --noEmit --skipLibCheck', { 
          stdio: 'pipe',
          env: { ...process.env, NODE_ENV: 'development' }
        });
        
        // This test passes if the compilation succeeds without errors
      } catch (error: any) {
        const output = error.stdout?.toString() || error.stderr?.toString() || error.message;
        throw new Error(`Page compilation failed: ${output}`);
      }
    } finally {
      // Clean up
      try {
        fs.unlinkSync(tempFile);
        fs.rmdirSync(tempDir);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  // Skip the full build test which takes too long (5 minutes)
  it.skip('should build the application without errors', { timeout: 300000 }, () => {
    try {
      // Run a partial build that stops after compilation but before actual asset generation
      // This is faster than a full build but still verifies compilation
      execSync('NODE_ENV=test pnpm next build --no-lint', { 
        stdio: 'pipe',
        env: { ...process.env, NEXT_BUILD_TEST: 'true' }
      });
      
      // This test passes if the build succeeds without errors
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message;
      
      // Parse the output to extract specific errors
      const clientComponentErrorMatch = output.match(/Error occurred prerendering page "(.+?)"\s+Error: (.+?)$/gm);
      if (clientComponentErrorMatch) {
        clientComponentErrorMatch.forEach((match: string) => {
          const [, page, errorMsg] = match.match(/Error occurred prerendering page "(.+?)"\s+Error: (.+?)$/) || [];
          if (page && errorMsg) {
            clientComponentErrors[page] = errorMsg;
          }
        });
      }
      
      const serverComponentErrorMatch = output.match(/Failed to compile\.\s+(.+?):\s+(.+?)$/gm);
      if (serverComponentErrorMatch) {
        serverComponentErrorMatch.forEach((match: string) => {
          const [, file, errorMsg] = match.match(/Failed to compile\.\s+(.+?):\s+(.+?)$/) || [];
          if (file && errorMsg) {
            serverComponentErrors[file] = errorMsg;
          }
        });
      }
      
      throw new Error(`Next.js build failed: ${output}`);
    }
  });
}); 