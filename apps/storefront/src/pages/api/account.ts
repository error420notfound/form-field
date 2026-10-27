import type { APIRoute } from 'astro'

const base = () => (import.meta.env.CMS_URL || process.env.CMS_URL || 'http://localhost:3000').replace(/\/$/, '')
const local = (url: URL) => import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
export const GET: APIRoute = async ({ cookies, url }) => {
  if (!local(url)) return Response.json({ error: 'Not available.' }, { status: 403 })
  try {
    const token = cookies.get('ff-customer')?.value
    const response = await fetch(`${base()}/api/customer-account`, { headers: token ? { Authorization: `JWT ${token}` } : {}, cache: 'no-store' })
    return new Response(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
  } catch { return Response.json({ error: 'Account service unavailable.' }, { status: 503 }) }
}
export const POST: APIRoute = async ({ cookies, request, url }) => {
  if (!local(url) || request.headers.get('origin') !== url.origin) return Response.json({ error: 'Invalid request.' }, { status: 403 })
  try {
    const body = await request.json()
    const token = cookies.get('ff-customer')?.value
    if (body.action === 'logout') {
      if (token) {
        const result = await fetch(`${base()}/api/customers/logout`, { method: 'POST', headers: { Authorization: `JWT ${token}` } })
        if (!result.ok && result.status !== 401 && result.status !== 400) return Response.json({ error: 'Could not sign out. Please retry.' }, { status: 503 })
      }
      cookies.delete('ff-customer', { path: '/' })
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
    }
    const response = await fetch(`${base()}/api/customer-account`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `JWT ${token}` } : {}) }, body: JSON.stringify(body), cache: 'no-store' })
    const data = await response.json()
    if (response.ok && typeof data.token === 'string') {
      cookies.set('ff-customer', data.token, { httpOnly: true, sameSite: 'strict', secure: url.protocol === 'https:', path: '/', maxAge: 86400 })
      delete data.token
    }
    return Response.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } })
  } catch { return Response.json({ error: 'Account service unavailable.' }, { status: 503 }) }
}
