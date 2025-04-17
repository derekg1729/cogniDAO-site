import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'
import * as dotenv from 'dotenv'

describe.skip('Build Prerequisites', { timeout: 60000 }, () => {
  describe('Environment Configuration', () => {
    const requiredVars = {
      core: [
        // Authentication
        'AUTH_BEARER_TOKEN',
        'AUTH_GITHUB_ID',
        'AUTH_GITHUB_SECRET',
        
        // Database Configuration
        'DATABASE_URL',
        'DATABASE_URL_UNPOOLED',
        
        // NextAuth Configuration
        'NEXTAUTH_SECRET',
        
        // Domain Configuration
        'NEXT_PUBLIC_ROOT_DOMAIN',
        'NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX', // Required for all environments
        
        // Database Connection Details
        'PGDATABASE',
        'PGHOST',
        'PGHOST_UNPOOLED',
        'PGPASSWORD',
        'PGUSER',
        
        // Postgres Configuration
        'POSTGRES_DATABASE',
        'POSTGRES_HOST',
        'POSTGRES_PASSWORD',
        'POSTGRES_PRISMA_URL',
        'POSTGRES_URL',
        'POSTGRES_URL_NON_POOLING',
        'POSTGRES_URL_NO_SSL',
        'POSTGRES_USER',
        
        // Vercel Configuration
        'PROJECT_ID_VERCEL',
        'TEAM_ID_VERCEL'
      ],
      preview: [
        'NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX' // Explicitly required for preview
      ]
    }

    const envFiles = {
      local: '.env.local',
      preview: '.env.preview',
      production: '.env.production'
    }

    const exampleFiles = {
      local: '.env.local.example',
      preview: '.env.preview.example',
      production: '.env.production.example'
    }

    it('should have all required environment files', () => {
      const missingFiles = Object.values(envFiles).filter(file => !fs.existsSync(file))
      if (missingFiles.length > 0) {
        throw new Error(`Missing required environment files: ${missingFiles.join(', ')}`)
      }
    })

    it.each(Object.entries(envFiles))('should have all required variables in %s', (envType, envFile) => {
      const envContent = fs.readFileSync(envFile, 'utf8')
      const parsedEnv = dotenv.parse(envContent)
      
      // Check core variables
      const missingCoreVars = requiredVars.core.filter(variable => {
        const value = parsedEnv[variable]
        return !value || value.trim() === '' || value === 'undefined'
      })

      if (missingCoreVars.length > 0) {
        throw new Error(`Missing or empty required environment variables in ${envFile}: ${missingCoreVars.join(', ')}`)
      }

      // Special check for preview deployment variables
      if (envType === 'preview') {
        const missingPreviewVars = requiredVars.preview.filter(variable => {
          const value = parsedEnv[variable]
          return !value || value.trim() === '' || value === 'undefined'
        })

        if (missingPreviewVars.length > 0) {
          throw new Error(
            `Missing or empty preview deployment variables in ${envFile}: ${missingPreviewVars.join(', ')}. ` +
            `These are required for preview deployments to work correctly.`
          )
        }
      }
    })

    it('should have consistent domain configuration across env files', () => {
      const domainVars = ['NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX']
      const domains = Object.values(envFiles).reduce((acc, file) => {
        const content = fs.readFileSync(file, 'utf8')
        const parsed = dotenv.parse(content)
        acc[file] = domainVars.reduce((vars, key) => {
          vars[key] = parsed[key]
          return vars
        }, {} as Record<string, string>)
        return acc
      }, {} as Record<string, Record<string, string>>)

      // Check that all files have the same domain values
      const firstFile = Object.values(envFiles)[0]
      Object.values(envFiles).slice(1).forEach(file => {
        domainVars.forEach(variable => {
          if (domains[file][variable] !== domains[firstFile][variable]) {
            throw new Error(
              `Domain mismatch: ${variable} in ${file} (${domains[file][variable]}) ` +
              `doesn't match ${firstFile} (${domains[firstFile][variable]})`
            )
          }
        })
      })
    })

    it.skip('should have correct NEXTAUTH_URL format', () => {
      Object.entries(envFiles).forEach(([envType, file]) => {
        const content = fs.readFileSync(file, 'utf8')
        const parsed = dotenv.parse(content)
        const url = parsed.NEXTAUTH_URL
        
        if (!url) {
          throw new Error(`Missing NEXTAUTH_URL in ${file}`)
        }

        // Production and preview should use https://app.domain
        if (envType === 'production' || envType === 'preview') {
          if (!url.startsWith('https://app.')) {
            throw new Error(
              `Invalid NEXTAUTH_URL in ${file}: ${url}\n` +
              'Production and preview NEXTAUTH_URL should start with https://app.'
            )
          }
        } else {
          // Local env should use http://app.localhost:3000
          if (url !== 'http://app.localhost:3000') {
            throw new Error(
              `Invalid NEXTAUTH_URL in ${file}: ${url}\n` +
              'Local NEXTAUTH_URL should be http://app.localhost:3000'
            )
          }
        }
      })
    })

    it('should have environment documentation', () => {
      // Check that all example files exist
      const missingExamples = Object.values(exampleFiles).filter(file => !fs.existsSync(file))
      if (missingExamples.length > 0) {
        throw new Error(`Missing environment example files: ${missingExamples.join(', ')}`)
      }

      // Check that each example file contains all required variables
      Object.entries(exampleFiles).forEach(([envType, file]) => {
        const content = fs.readFileSync(file, 'utf8')
        
        // Check core variables
        const missingCoreVars = requiredVars.core.filter(variable => !content.includes(variable))
        if (missingCoreVars.length > 0) {
          throw new Error(`Missing documentation for required variables in ${file}: ${missingCoreVars.join(', ')}`)
        }

        // Check preview variables
        if (envType === 'preview') {
          const missingPreviewVars = requiredVars.preview.filter(variable => {
            return !content.includes(variable) || 
                   !content.includes('This is used by the middleware to handle preview deployment URLs')
          })
          
          if (missingPreviewVars.length > 0) {
            throw new Error(
              `${file} is missing detailed documentation for preview deployment variables: ${missingPreviewVars.join(', ')}. ` +
              `Each preview variable must include explanation of its use in preview deployments.`
            )
          }
        }
      })
    })
  })

  describe('Build Configuration', () => {
    it('should have valid config files', () => {
      const configFiles = [
        'next.config.js',
        'drizzle.config.ts',
        'tsconfig.json'
      ]
      
      configFiles.forEach(file => {
        if (!fs.existsSync(file)) {
          throw new Error(`Missing required config file: ${file}`)
        }
        const content = fs.readFileSync(file, 'utf8')
        if (content.trim().length === 0) {
          throw new Error(`Empty config file: ${file}`)
        }
      })
    })

    it('should have valid package configuration', () => {
      if (!fs.existsSync('package.json')) {
        throw new Error('Missing package.json')
      }
      if (!fs.existsSync('pnpm-lock.yaml')) {
        throw new Error('Missing pnpm-lock.yaml')
      }

      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      const requiredScripts = ['build', 'dev', 'start']
      const missingScripts = requiredScripts.filter(script => !pkg.scripts[script])
      if (missingScripts.length > 0) {
        throw new Error(`Missing required scripts in package.json: ${missingScripts.join(', ')}`)
      }
    })

    it('should have consistent dependency declarations', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      const lockfile = fs.readFileSync('pnpm-lock.yaml', 'utf8')
      
      // Basic validation that dependencies mentioned in package.json appear in lockfile
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {})
      }
      
      Object.keys(allDeps).forEach(dep => {
        if (!lockfile.includes(dep)) {
          throw new Error(`Dependency ${dep} found in package.json but not in pnpm-lock.yaml. Run pnpm install to sync.`)
        }
      })
    })
  })

  describe('Code Quality', () => {
    it('should pass TypeScript compilation', { timeout: 30000 }, () => {
      try {
        // Use the same typecheck command defined in package.json for consistency
        execSync('npm run typecheck', { stdio: 'pipe' })
      } catch (error: any) {
        const output = error.stdout?.toString() || error.stderr?.toString() || error.message
        throw new Error(`TypeScript compilation failed: ${output}`)
      }
    })

    it('should pass ESLint checks', { timeout: 30000 }, () => {
      try {
        execSync('pnpm eslint . --max-warnings 0', { stdio: 'pipe' })
      } catch (error: any) {
        const output = error.stdout?.toString() || error.stderr?.toString() || error.message
        throw new Error(`ESLint checks failed: ${output}`)
      }
    })
  })
})

describe.skip('Build Process', () => {
  // ... rest of the test file
}) 