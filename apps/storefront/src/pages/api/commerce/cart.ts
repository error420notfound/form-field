import type { APIRoute, AstroCookies } from 'astro'
import type { HttpTypes } from '@medusajs/types'
import { products } from '../../../lib/cms'
import { commerceClient, commerceRegionId, statusOf } from '../../../lib/commerce/medusa'
import { commerceProduct } from '../../../lib/commerce/products'
import { canUseMedusa, parseCartAction } from '../../../lib/commerce/policy'
import { cartView, cartQuery } from '../../../lib/commerce/cart'

const cookie = 'ff_medusa_cart_v1'
const cookiePath = '/api/commerce'
const response = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } })
function forget(cookies: AstroCookies) { cookies.delete(cookie, { path: cookiePath }) }
async function current(cookies: AstroCookies): Promise<HttpTypes.StoreCart | null> {
  const id = cookies.get(cookie)?.value
  if (!id) return null
  if (!/^cart_[\w-]{1,100}$/.test(id)) { forget(cookies); return null }
  try {
    const { cart } = await commerceClient().store.cart.retrieve(id, cartQuery)
    if (cart.completed_at || cart.region_id !== commerceRegionId() || cart.currency_code !== 'inr') { forget(cookies); return null }
    return cart
  } catch (error) {
    if (statusOf(error) === 404) { forget(cookies); return null }
    throw error
  }
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const cart = await current(cookies)
    return response({ cart: cart ? cartView(cart) : null })
  } catch { return response({ error: 'Your commerce bag is temporarily unavailable. Please retry.' }, 503) }
}

export const POST: APIRoute = async ({ request, cookies, url }) => {
  if (request.headers.get('origin') !== url.origin) return response({ error: 'Please use the storefront to update your bag.' }, 403)
  if (!request.headers.get('content-type')?.startsWith('application/json')) return response({ error: 'Invalid cart request.' }, 415)
  try {
    const raw = await request.text()
    if (raw.length > 2048) return response({ error: 'Invalid cart request.' }, 400)
    let input: unknown
    try { input = JSON.parse(raw) } catch { return response({ error: 'Invalid cart request.' }, 400) }
    const action = parseCartAction(input)
    if (!action) return response({ error: 'Choose a valid item and a quantity from 1 to 99.' }, 400)
    const sdk = commerceClient()
    let cart = await current(cookies)
    if (action.action === 'add') {
      const [editorial] = await products(`&where[id][equals]=${action.productId}`)
      if (!editorial || !canUseMedusa(editorial)) return response({ error: 'This object is unavailable for the commerce bag.' }, 409)
      const commerce = await commerceProduct(editorial.medusaProductId!)
      const variant = commerce.variants.find(item => item.id === action.variantId)
      if (!variant?.available) return response({ error: 'This configuration is currently unavailable.' }, 409)
      const existing = cart?.items?.find(item => item.variant_id === variant.id)
      if ((existing?.quantity || 0) + action.quantity > 99 || (!existing && (cart?.items?.length || 0) >= 100)) return response({ error: 'Your bag allows up to 100 configurations and 99 of each.' }, 400)
      if (!cart) {
        const result = await sdk.store.cart.create({ region_id: commerceRegionId(), items: [{ variant_id: variant.id, quantity: action.quantity }] }, cartQuery)
        cart = result.cart
        cookies.set(cookie, cart.id, { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: import.meta.env.PROD, maxAge: 60 * 60 * 24 * 30 })
      } else {
        cart = (await sdk.store.cart.createLineItem(cart.id, { variant_id: variant.id, quantity: action.quantity }, cartQuery)).cart
      }
    } else {
      if (!cart) return response({ error: 'Your previous commerce bag is no longer available. Refresh to start a new bag.' }, 409)
      const item = cart.items?.find(item => item.id === action.lineId)
      if (!item) return response({ error: 'This item is no longer in your bag. Refresh and try again.' }, 409)
      if (action.action === 'remove') {
        await sdk.store.cart.deleteLineItem(cart.id, item.id)
        cart = (await sdk.store.cart.retrieve(cart.id, cartQuery)).cart
      } else {
        const [editorial] = await products(`&where[medusaProductId][equals]=${encodeURIComponent(item.product_id || '')}`)
        if (!editorial || !canUseMedusa(editorial)) return response({ error: 'This object is no longer available. You can remove it from your bag.' }, 409)
        cart = (await sdk.store.cart.updateLineItem(cart.id, item.id, { quantity: action.quantity }, cartQuery)).cart
      }
    }
    return response({ cart: cartView(cart) })
  } catch (error) {
    const status = statusOf(error)
    if (status === 400 || status === 409 || status === 422) return response({ error: 'This quantity or configuration is no longer available. Refresh your bag and try again.' }, 409)
    return response({ error: 'We could not confirm the change. Refresh your commerce bag before trying again.' }, 503)
  }
}
