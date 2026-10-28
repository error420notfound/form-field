import { linkedOdooProduct } from '../../../../odoo-product'

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !/^[1-9]\d*$/.test(id))
    return Response.json({ error: 'Invalid product.' }, { status: 400 })
  const variant = new URL(request.url).searchParams.get('variant')
  if (variant && !/^[1-9]\d*$/.test(variant)) return Response.json({ error: 'Invalid configuration.' }, { status: 400 })
  try {
    const product = await linkedOdooProduct(id, variant ? Number(variant) : undefined)
    return Response.json(product ? { linked: true, available: product.quantity > 0, quantity: product.quantity, id: product.id, price: product.price, options: product.options } : { linked: false }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Inventory is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
