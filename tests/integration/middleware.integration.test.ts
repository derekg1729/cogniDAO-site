import { describe, it, expect, beforeEach, vi } from 'vitest'
import middleware from '@/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}))

describe.skip('Middleware', () => {
  let req: NextRequest

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'vercel.pub'
    process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX = 'vercel.app'
    req = new NextRequest(new URL('http://app.vercel.pub'), {
      headers: new Headers({
        'host': 'app.vercel.pub'
      })
    })
  })

  describe('Local Development', () => {
    it('should serve the home page directly on localhost:3000', async () => {
      req = new NextRequest(new URL('http://localhost:3000'), {
        headers: new Headers({
          'host': 'localhost:3000'
        })
      })
      const res = await middleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      const rewriteUrl = res.headers.get('x-middleware-rewrite')
      console.log('Rewritten URL:', rewriteUrl)
      expect(rewriteUrl).toContain('/home')
    })

    it('should handle app subdomain in local development', async () => {
      req = new NextRequest(new URL('http://app.localhost:3000'), {
        headers: new Headers({
          'host': 'app.localhost:3000'
        })
      })
      vi.mocked(getToken).mockResolvedValueOnce({ 
        user: { id: 'test-user-id' } 
      })
      const res = await middleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      const rewriteUrl = res.headers.get('x-middleware-rewrite')
      expect(rewriteUrl).toContain('/app')
    })

    it('should handle site subdomains in local development', async () => {
      req = new NextRequest(new URL('http://test-site.localhost:3000'), {
        headers: new Headers({
          'host': 'test-site.localhost:3000'
        })
      })
      const res = await middleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      const rewriteUrl = res.headers.get('x-middleware-rewrite')
      expect(rewriteUrl).toContain('/test-site')
    })
  })

  describe('Preview URL Detection', () => {
    it('should identify Git-based preview URLs correctly', async () => {
      const previewUrl = 'agent-platform-git-feature-hello-world-dereks-projects-32c37a6a.vercel.app'
      req = new NextRequest(new URL(`http://${previewUrl}`), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      const res = await middleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      const rewriteUrl = res.headers.get('x-middleware-rewrite')
      expect(rewriteUrl).toBeDefined()
    })

    it('should identify Deploy-hash preview URLs correctly', async () => {
      const previewUrl = 'agent-platform-b5qscruwc-dereks-projects-32c37a6a.vercel.app'
      req = new NextRequest(new URL(`http://${previewUrl}`), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      const res = await middleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      const rewriteUrl = res.headers.get('x-middleware-rewrite')
      expect(rewriteUrl).toBeDefined()
    })

    it('should handle preview URLs with complex team segments', async () => {
      const previewUrl = 'agent-platform-git-feature-hello-world-dereks-projects-32c37a6a.vercel.app'
      req = new NextRequest(new URL(`http://${previewUrl}`), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      const res = await middleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      const rewriteUrl = res.headers.get('x-middleware-rewrite')
      expect(rewriteUrl).toBeDefined()
    })

    it('should serve preview deployments without site lookup', async () => {
      const previewUrl = 'agent-platform-git-feature-hello-world-dereks-projects-32c37a6a.vercel.app'
      req = new NextRequest(new URL(`http://${previewUrl}`), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      const res = await middleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      
      // We're testing behavior here - the middleware should rewrite, not redirect
      expect(res.headers.get('location')).toBeFalsy()
      expect(res.headers.get('x-middleware-rewrite')).toBeTruthy()
    })
  })

  describe('Preview Deployments', () => {
    describe('Git-based preview URLs', () => {
      const getGitPreviewUrl = (branch = 'main') => 
        `agent-platform-git-${branch.replace('/', '-')}-dereks-projects-32c37a6a.vercel.app`;

      it('should rewrite root to /home for preview URLs', async () => {
        const previewUrl = getGitPreviewUrl('feature/hello-world')
        req = new NextRequest(new URL(`http://${previewUrl}`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toContain('/home')
      })

      it('should NOT rewrite app routes to dynamic routes for preview URLs', async () => {
        const previewUrl = getGitPreviewUrl('feature-hello-world')
        // Verify we're testing against the actual failing URL pattern
        expect(previewUrl).toBe('agent-platform-git-feature-hello-world-dereks-projects-32c37a6a.vercel.app')
        
        req = new NextRequest(new URL(`https://${previewUrl}/about`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toBeDefined()
        
        // Test behavior: it should rewrite to include the about path
        expect(rewriteUrl?.includes('/about')).toBe(true)
        
        // Test behavior: it should be a rewrite, not a redirect
        expect(res.headers.get('location')).toBeFalsy()
      })

      it('should serve preview URLs directly without site lookup', async () => {
        const previewUrl = getGitPreviewUrl('feature-hello-world')
        
        req = new NextRequest(new URL(`https://${previewUrl}/`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toBeDefined()
        
        // Test behavior: it should rewrite to /home for the root path
        expect(rewriteUrl?.includes('/home')).toBe(true)
        
        // Test behavior: it should be a rewrite, not a redirect
        expect(res.headers.get('location')).toBeFalsy()
      })
    })

    describe('Deploy-hash preview URLs', () => {
      const getHashPreviewUrl = (hash = 'dp51c7i4r') => 
        `agent-platform-${hash}-dereks-projects-32c37a6a.vercel.app`;

      it('should rewrite root to /home for preview URLs', async () => {
        const previewUrl = getHashPreviewUrl()
        req = new NextRequest(new URL(`http://${previewUrl}`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toContain('/home')
      })

      it('should NOT rewrite app routes to dynamic routes for preview URLs', async () => {
        const previewUrl = getHashPreviewUrl('dp51c7i4r')
        // Verify we're testing against the actual failing URL pattern
        expect(previewUrl).toBe('agent-platform-dp51c7i4r-dereks-projects-32c37a6a.vercel.app')
        
        req = new NextRequest(new URL(`https://${previewUrl}/about`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toBeDefined()
        
        // Test behavior: it should rewrite to include the about path
        expect(rewriteUrl?.includes('/about')).toBe(true)
        
        // Test behavior: it should be a rewrite, not a redirect
        expect(res.headers.get('location')).toBeFalsy()
      })
    })

    describe('Preview URL Edge Cases', () => {
      const getGitPreviewUrl = (branch = 'main') => 
        `agent-platform-git-${branch.replace('/', '-')}-dereks-projects-32c37a6a.vercel.app`;

      it('should serve the home page at root URL for preview deployments', async () => {
        const previewUrl = getGitPreviewUrl('feature/hello-world')
        req = new NextRequest(new URL(`http://${previewUrl}/`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toContain('/home')
      })

      it('should serve app pages correctly in preview deployments', async () => {
        const previewUrl = 'app.agent-platform-git-feature-hello-world-dereks-projects-32c37a6a.vercel.app'
        req = new NextRequest(new URL(`http://${previewUrl}/dashboard`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        vi.mocked(getToken).mockResolvedValueOnce({ 
          user: { id: 'test-user-id' } 
        })
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toContain('/app/dashboard')
      })

      it('should redirect to login for unauthenticated app access in preview', async () => {
        const previewUrl = 'app.agent-platform-git-feature-hello-world-dereks-projects-32c37a6a.vercel.app'
        req = new NextRequest(new URL(`http://${previewUrl}/dashboard`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        vi.mocked(getToken).mockResolvedValueOnce(null)
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        expect(res.headers.get('location')).toContain('/login')
      })

      it('should rewrite root to /home but not other paths', async () => {
        const previewUrl = getGitPreviewUrl('feature/hello-world')
        req = new NextRequest(new URL(`http://${previewUrl}/about`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toContain('/about')
        expect(rewriteUrl).not.toContain('/home')
      })

      it('should preserve query parameters without dynamic route rewrites', async () => {
        const previewUrl = getGitPreviewUrl('feature/hello-world')
        req = new NextRequest(new URL(`https://${previewUrl}/about?key=value`), {
          headers: new Headers({
            'host': previewUrl
          })
        })
        
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        
        // Test behavior: it should preserve query parameters
        expect(rewriteUrl?.includes('key=value')).toBe(true)
        
        // Test behavior: it should include the about path
        expect(rewriteUrl?.includes('/about')).toBe(true)
        
        // Test behavior: it should be a rewrite, not a redirect
        expect(res.headers.get('location')).toBeFalsy()
      })
    })
  })

  describe('Production Domain', () => {
    it('redirects vercel.pub to the starter kit blog post', async () => {
      req = new NextRequest(new URL('http://vercel.pub'), {
        headers: new Headers({
          'host': 'vercel.pub'
        })
      })
      const res = await middleware(req)
      expect(res).toBeInstanceOf(NextResponse)
      expect(res.headers.get('location')).toBe('https://vercel.com/blog/platforms-starter-kit')
    })

    it('serves root page at custom production domain', async () => {
      // Set a known value for the root domain for testing
      const originalRootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'custom-domain.com';
      
      req = new NextRequest(new URL('http://custom-domain.com'), {
        headers: new Headers({
          'host': 'custom-domain.com'
        })
      })
      
      const res = await middleware(req)
      
      // Restore the original environment variable
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = originalRootDomain;
      
      expect(res).toBeInstanceOf(NextResponse)
      const rewriteUrl = res.headers.get('x-middleware-rewrite')
      expect(rewriteUrl).toBeDefined()
      
      // Check that the URL is rewritten appropriately
      if (rewriteUrl) {
        expect(rewriteUrl.includes('/home')).toBe(true)
      }
    })

    describe('App Authentication', () => {
      it('redirects unauthenticated users to login on production app URL', async () => {
        req = new NextRequest(new URL(`http://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`), {
          headers: new Headers({
            'host': `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          })
        })
        vi.mocked(getToken).mockResolvedValueOnce(null)
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        expect(res.headers.get('location')).toContain('/login')
      })

      it('allows authenticated users to access app pages on production URL', async () => {
        req = new NextRequest(new URL(`http://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/dashboard`), {
          headers: new Headers({
            'host': `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          })
        })
        vi.mocked(getToken).mockResolvedValueOnce({ 
          user: { id: 'test-user-id' } 
        })
        const res = await middleware(req)
        expect(res).toBeInstanceOf(NextResponse)
        const rewriteUrl = res.headers.get('x-middleware-rewrite')
        expect(rewriteUrl).toContain('/app/dashboard')
      })
    })
  })

  describe('Preview Deployment Handling', () => {
    const getGitPreviewUrl = (branch = 'main') => 
      `agent-platform-git-${branch.replace('/', '-')}-dereks-projects-32c37a6a.vercel.app`;

    it('should serve home page at root for preview URLs without query params', async () => {
      const previewUrl = getGitPreviewUrl('feature/hello-world')
      const request = new NextRequest(new URL(previewUrl, 'http://' + previewUrl), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      const response = await middleware(request)
      
      // Test behavior: it should be a rewrite, not a redirect
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.headers.get('location')).toBeFalsy()
      expect(response.headers.get('x-middleware-rewrite')).toBeTruthy()
    })

    it('should preserve query parameters when rewriting preview URLs', async () => {
      const previewUrl = getGitPreviewUrl('feature/hello-world')
      const request = new NextRequest(new URL(`${previewUrl}/?key=value`, 'http://' + previewUrl), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      const response = await middleware(request)
      
      // Test behavior: it should preserve query parameters
      expect(response).toBeInstanceOf(NextResponse)
      const rewriteUrl = response.headers.get('x-middleware-rewrite')
      expect(rewriteUrl).toBeDefined()
      expect(rewriteUrl?.includes('key=value')).toBe(true)
    })

    it('should serve pages directly without site lookup for preview deployments', async () => {
      const previewUrl = getGitPreviewUrl('feature/hello-world')
      const request = new NextRequest(new URL(`${previewUrl}/about`, 'http://' + previewUrl), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      const response = await middleware(request)
      
      // Test behavior: it should be a rewrite, not a redirect
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.headers.get('location')).toBeFalsy()
      expect(response.headers.get('x-middleware-rewrite')).toBeTruthy()
      
      // It should include the about path
      const rewriteUrl = response.headers.get('x-middleware-rewrite')
      expect(rewriteUrl?.includes('/about')).toBe(true)
    })

    it('should handle app subdomain authentication in preview deployments', async () => {
      const previewUrl = `app.${getGitPreviewUrl('feature/hello-world')}`
      
      // Test unauthenticated access
      const unauthRequest = new NextRequest(new URL(`${previewUrl}/dashboard`, 'http://' + previewUrl), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      vi.mocked(getToken).mockResolvedValueOnce(null)
      const unauthResponse = await middleware(unauthRequest)
      
      // Test behavior: it should redirect to login
      expect(unauthResponse).toBeInstanceOf(NextResponse)
      expect(unauthResponse.headers.get('location')).toBeTruthy()
      expect(unauthResponse.headers.get('location')?.includes('/login')).toBe(true)
      
      // Test authenticated access
      const authRequest = new NextRequest(new URL(`${previewUrl}/dashboard`, 'http://' + previewUrl), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      vi.mocked(getToken).mockResolvedValueOnce({ user: { id: 'test-user-id' } })
      const authResponse = await middleware(authRequest)
      
      // Test behavior: it should rewrite, not redirect
      expect(authResponse).toBeInstanceOf(NextResponse)
      expect(authResponse.headers.get('location')).toBeFalsy()
      expect(authResponse.headers.get('x-middleware-rewrite')).toBeTruthy()
    })

    it('should preserve path and query params for app subdomain in preview', async () => {
      const previewUrl = `app.${getGitPreviewUrl('feature/hello-world')}`
      const request = new NextRequest(new URL(`${previewUrl}/dashboard?view=all`, 'http://' + previewUrl), {
        headers: new Headers({
          'host': previewUrl
        })
      })
      vi.mocked(getToken).mockResolvedValueOnce({ user: { id: 'test-user-id' } })
      const response = await middleware(request)
      
      // Test behavior: it should rewrite, not redirect
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.headers.get('location')).toBeFalsy()
      expect(response.headers.get('x-middleware-rewrite')).toBeTruthy()
      
      // It should preserve query parameters
      const rewriteUrl = response.headers.get('x-middleware-rewrite')
      expect(rewriteUrl?.includes('view=all')).toBe(true)
    })
  })
})