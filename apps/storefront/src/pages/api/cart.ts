import type { APIRoute } from 'astro'
import { resolveCart, type CartSelection } from '../../lib/cart-resolution'
import { products, image, price, availability, stock } from '../../lib/cms'
export const POST: APIRoute = async ({ request }) => {
  try {
    const body: CartSelection[] = await request.json()
    if (!Array.isArray(body) || body.length > 100 || body.some(s => !s || !Number.isSafeInteger(s.id) || s.id < 1 || (s.variantId !== undefined && (!Number.isSafeInteger(s.variantId) || s.variantId < 1)) || !Number.isInteger(s.quantity) || s.quantity < 1 || s.quantity > 99) || new Set(body.map(s => `${s.id}:${s.variantId ?? 'legacy'}`)).size !== body.length)
      return Response.json({ error: 'Invalid cart selections.' }, { status: 400 })
    const ids = [...new Set(body.map(s => s.id))]
    const items = ids.length ? await products(`&where[id][in]=${ids.join(',')}`) : []
    const resolved = await resolveCart(body, items, stock)
    let subtotal = 0
    const lines = resolved.map(({ selection: s, product: p, inventory, purchasable, total, requested }) => {
      if (!p || !inventory) return { ...s, missing: true, purchasable: false, name: 'Removed or unpublished product' }
      subtotal += total
      return { ...s, name: p.name, url: `/products/${p.slug}`, image: image(p, !('error' in inventory) && inventory.linked ? inventory.id : s.variantId),
        availability: 'error' in inventory ? 'Inventory temporarily unavailable' : !inventory.linked ? 'Configuration unavailable' : inventory.quantity < requested ? (inventory.quantity === 0 ? 'Out of stock' : 'Requested quantity unavailable') : availability(p.availability),
        purchasable, unitPrice: !('error' in inventory) && inventory.linked ? price(inventory.price) : null,
        options: !('error' in inventory) && inventory.linked ? inventory.options : [], resolvedVariantId: !('error' in inventory) && inventory.linked ? inventory.id : undefined, unitPricePaise: !('error' in inventory) && inventory.linked ? inventory.price : null, lineTotal: price(total) }
    })
    if (!Number.isSafeInteger(subtotal)) return Response.json({ error: 'Invalid subtotal.' }, { status: 400 })
    return Response.json({ lines, subtotal: price(subtotal) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return Response.json({ error: 'Cannot load cart. Please retry.' }, { status: 503 }) }
}
