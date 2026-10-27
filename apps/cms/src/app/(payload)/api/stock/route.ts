import { linkedOdooProduct } from '../../../../odoo-product'

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id || !/^[1-9]\d*$/.test(id))
    return Response.json({ error: 'Invalid product.' }, { status: 400 })
  try {
    const product = await linkedOdooProduct(id)
    return Response.json(product ? { linked: true, available: product.quantity > 0, quantity: product.quantity } : { linked: false }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Inventory is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
