import type { APIRoute } from 'astro'

/** Proxy only anonymous CMS media reads; never forward browser credentials. */
export const GET: APIRoute = async ({ params }) => {
  const filename = params.filename
  if (!filename || filename === '.' || filename === '..' || /[\\/\x00-\x1f]/.test(filename)) return new Response(null, { status: 404 })
  const base = (import.meta.env?.CMS_URL || process.env.CMS_URL || 'http://localhost:3000').replace(/\/$/, '')
  try {
    const response = await fetch(`${base}/api/media/file/${encodeURIComponent(filename)}`, { signal: AbortSignal.timeout(8000), redirect: 'manual' })
    if (!response.ok || !response.body) return new Response(null, { status: response.status === 404 ? 404 : 502 })
    const type = response.headers.get('content-type') || ''
    if (!type.startsWith('image/')) return new Response(null, { status: 502 })
    return new Response(response.body, { headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'" } })
  } catch { return new Response(null, { status: 502 }) }
}
