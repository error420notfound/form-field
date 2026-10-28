import type { APIRoute } from 'astro'
import { catalogue } from '../../lib/catalogue'
import { image } from '../../lib/cms'
import { selectUpsellCandidates } from '../../lib/upsell'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    if (!Array.isArray(body.sourceIds) || !Array.isArray(body.excludedIds) || body.sourceIds.length > 100 || body.excludedIds.length > 100 || [...body.sourceIds, ...body.excludedIds].some(id => !Number.isSafeInteger(id) || id < 1)) {
      return Response.json({ error: 'Invalid selections.' }, { status: 400 })
    }
    const products = await catalogue()
    const candidates = selectUpsellCandidates(products, body.sourceIds, body.excludedIds).map(p => ({
      id: p.id, name: p.name, slug: p.slug, description: p.shortDescription, image: image(p),
      variantImages: (p.variantImages || []).map(v => ({ id: v.odooVariantId, image: image(p, v.odooVariantId) })),
    }))
    return Response.json({ candidates }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Recommendations are temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
