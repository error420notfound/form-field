import type { APIRoute } from 'astro'
export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id')
  if (!id || !/^[1-9]\d*$/.test(id)) return Response.json({ error: 'Invalid product.' }, { status: 400 })
  try {
    const base = (import.meta.env.CMS_URL || process.env.CMS_URL || 'http://localhost:3000').replace(/\/$/, '')
    const response = await fetch(`${base}/api/configurations?id=${id}`, { signal: AbortSignal.timeout(10000), cache: 'no-store' })
    return new Response(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
  } catch { return Response.json({ error: 'Configurations are temporarily unavailable.' }, { status: 503 }) }
}
