import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request, url, cookies }) => {
  if (!import.meta.env.DEV || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    return Response.json({ error: 'Demo checkout is available only locally.' }, { status: 403 })
  if (request.headers.get('origin') !== url.origin)
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 })
  try {
    const cms = (import.meta.env.CMS_URL || process.env.CMS_URL || 'http://localhost:3000').replace(/\/$/, '')
    const token = cookies.get('ff-customer')?.value
    const response = await fetch(`${cms}/api/demo-order`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `JWT ${token}` } : {}) }, body: JSON.stringify(await request.json()) })
    return new Response(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Could not confirm the order. Check Orders in Payload before trying again.' }, { status: 503 })
  }
}
