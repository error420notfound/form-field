import config from '@payload-config'
import { getPayload } from 'payload'
import { linkedOdooConfigurations, UnsupportedConfiguration } from '../../../../odoo-product'
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !/^[1-9]\d*$/.test(id)) return Response.json({ error: 'Invalid product.' }, { status: 400 })
  try {
    const payload = await getPayload({ config })
    const product = await payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: false, disableErrors: true })
    if (!product || product._status !== 'published' || product.reviewOnly || product.purchaseEligible === false || product.availability !== 'available') return Response.json({ error: 'Product unavailable.' }, { status: 404 })
    const result = await linkedOdooConfigurations(id)
    return Response.json(result ? { linked: true, ...result } : { linked: false }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof UnsupportedConfiguration) return Response.json({ error: error.message }, { status: 422, headers: { 'Cache-Control': 'no-store' } })
    return Response.json({ error: 'Configurations are temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
