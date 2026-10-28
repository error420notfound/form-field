import { linkedOdooProduct } from '../../../../odoo-product'
import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !/^[1-9]\d*$/.test(id))
    return Response.json({ error: 'Invalid product.' }, { status: 400 })
  const variant = new URL(request.url).searchParams.get('variant')
  if (variant && !/^[1-9]\d*$/.test(variant)) return Response.json({ error: 'Invalid configuration.' }, { status: 400 })
  try {
    const payload = await getPayload({ config })
    const editorial = await payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: false, disableErrors: true })
    if (!editorial || editorial.medusaProductId) return Response.json({ linked: false }, { headers: { 'Cache-Control': 'no-store' } })
    const product = await linkedOdooProduct(id, variant ? Number(variant) : undefined)
    return Response.json(product ? { linked: true, available: product.quantity > 0, quantity: product.quantity, id: product.id, price: product.price, options: product.options } : { linked: false }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Inventory is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
