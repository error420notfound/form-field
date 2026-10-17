import type { APIRoute } from 'astro'
import { products, image, price, availability } from '../../lib/cms'
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    if (
      !Array.isArray(body) ||
      body.length > 100 ||
      body.some(
        (s) =>
          !Number.isSafeInteger(s.id) ||
          s.id < 1 ||
          !Number.isInteger(s.quantity) ||
          s.quantity < 1 ||
          s.quantity > 99,
      )
    )
      return Response.json(
        { error: 'Invalid cart selections.' },
        { status: 400 },
      )
    const ids = [...new Set(body.map((s) => s.id))]
    const items = ids.length
      ? await products(`&where[id][in]=${ids.join(',')}`)
      : []
    let subtotal = 0
    const lines = body.map((s) => {
      const p = items.find((p) => p.id === s.id)
      if (!p)
        return {
          ...s,
          missing: true,
          purchasable: false,
          name: 'Removed or unpublished product',
        }
      const purchasable = p.availability === 'available'
      const total = purchasable ? p.price * s.quantity : 0
      subtotal += total
      return {
        ...s,
        name: p.name,
        url: `/products/${p.slug}`,
        image: image(p),
        availability: availability(p.availability),
        purchasable,
        unitPrice: price(p.price),
        lineTotal: price(total),
      }
    })
    return Response.json(
      { lines, subtotal: price(subtotal) },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error ? e.message : 'Cannot load cart. Please retry.',
      },
      { status: 503 },
    )
  }
}
