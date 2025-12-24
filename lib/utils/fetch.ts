// lib/utils/fetch.ts
// Internal API fetch utilities

import { NextRequest } from 'next/server'

/**
 * Make internal API call with cookies forwarded
 * Replaces repeated fetch calls with cookie handling
 */
export async function internalFetch(
  path: string,
  request: NextRequest,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': request.headers.get('cookie') || '',
      ...options.headers
    }
  })
}

/**
 * Make internal POST request
 */
export async function internalPost(
  path: string,
  request: NextRequest,
  body: unknown
): Promise<Response> {
  return internalFetch(path, request, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

/**
 * Make internal GET request
 */
export async function internalGet(
  path: string,
  request: NextRequest
): Promise<Response> {
  return internalFetch(path, request, {
    method: 'GET'
  })
}

// REPLACE THIS:
// await fetch(`${baseUrl}/api/gamification/award-points`, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Cookie': request.headers.get('cookie') || ''
//   },
//   body: JSON.stringify({ userId, points })
// })
//
// WITH THIS:
// import { internalPost } from '@/lib/utils/fetch'
// await internalPost('/api/gamification/award-points', request, { userId, points })
