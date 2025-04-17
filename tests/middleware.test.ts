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
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'localhost:3000'
    req = new NextRequest(new URL('http://app.localhost:3000'), {
      headers: new Headers({
        'host': 'app.localhost:3000'
      })
    })
  })

  it('redirects unauthenticated users to login', async () => {
    vi.mocked(getToken).mockResolvedValueOnce(null)
    const res = await middleware(req)
    expect(res).toBeInstanceOf(NextResponse)
    expect(res?.headers.get('location')).toBe('http://app.localhost:3000/login')
  })

  it('allows authenticated users to access protected routes', async () => {
    vi.mocked(getToken).mockResolvedValueOnce({ 
      user: { id: 'test-user-id' } 
    })
    const res = await middleware(req)
    expect(res).toBeInstanceOf(NextResponse)
    expect(res?.headers.get('location')).toBeNull()
  })

  it('handles custom domains correctly', async () => {
    vi.mocked(getToken).mockResolvedValueOnce({ 
      user: { id: 'test-user-id' } 
    })
    req = new NextRequest(new URL('http://custom-domain.com'), {
      headers: new Headers({
        'host': 'custom-domain.com'
      })
    })
    const res = await middleware(req)
    expect(res).toBeInstanceOf(NextResponse)
    expect(res?.headers.get('x-middleware-rewrite')).toContain('custom-domain.com')
  })
}) 