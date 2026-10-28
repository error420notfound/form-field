// Run explicitly against the local running applications and labeled fixtures.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import Medusa from '@medusajs/js-sdk'

const publicConfig = JSON.parse(readFileSync('.local/commerce-public.json', 'utf8'))
const fixture = JSON.parse(readFileSync('.local/medusa-fixture.json', 'utf8'))
const origin = 'http://localhost:4321'
assert.equal(publicConfig.backendUrl, 'http://localhost:9000', 'Integration checks are local-only.')
const sdk = new Medusa({ baseUrl: publicConfig.backendUrl, publishableKey: publicConfig.publishableKey, debug: false, auth: { jwtTokenStorageMethod: 'nostore' } })
for (const url of ['http://localhost:9000/health', 'http://localhost:3000/api/products?limit=1', `${origin}/api/commerce/cart`]) {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    try { const response = await fetch(url, { signal: AbortSignal.timeout(10000) }); await response.arrayBuffer(); if (response.ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  assert.ok(ready, `Application ready: ${url}`)
}
const { region } = await sdk.store.region.retrieve(publicConfig.regionId)
assert.equal(region.currency_code, 'inr')
assert.ok(region.countries?.some(country => country.iso_2 === 'in'))
const { products: commerceProducts } = await sdk.store.product.list({ region_id: region.id, fields: '+variants.calculated_price,+variants.inventory_quantity' })
const product = commerceProducts.find(item => item.id === fixture.productId)
assert.ok(product)
assert.equal(product.variants[0].calculated_price.calculated_amount, 123.45)
assert.equal(product.variants[0].inventory_quantity, 10)
const editorial = await (await fetch(`http://localhost:3000/api/products?where[slug][equals]=${fixture.slug}`)).json()
assert.equal(editorial.docs[0].medusaProductId, product.id)
const productId = editorial.docs[0].id
const page = await fetch(`${origin}/products/${fixture.slug}`)
assert.equal(page.status, 200)
const html = await page.text()
assert.ok(html.includes('Editorial fixture supplied by Payload'))
assert.ok(html.includes('123.45'))
let cookie = ''
async function cart(action, expected = 200, customOrigin = origin, cookieOverride) {
  const result = await fetch(`${origin}/api/commerce/cart`, { method: action ? 'POST' : 'GET', headers: { ...(action ? { 'Content-Type': 'application/json', Origin: customOrigin } : {}), ...(cookie || cookieOverride ? { Cookie: cookieOverride ?? cookie } : {}) }, ...(action ? { body: JSON.stringify(action) } : {}) })
  assert.equal(result.status, expected, `Cart ${action?.action || 'retrieve'} status`)
  const setCookie = result.headers.get('set-cookie')
  if (setCookie && !cookieOverride && !setCookie.includes('Max-Age=0')) {
    assert.match(setCookie, /HttpOnly/i)
    assert.match(setCookie, /SameSite=Lax/i)
    cookie = setCookie.split(';')[0]
  }
  return result.json()
}
assert.equal((await cart()).cart, null)
await cart({ action: 'add', productId, variantId: fixture.variantIds[0], quantity: 100 }, 400)
await cart({ action: 'add', productId, variantId: fixture.variantIds[0], quantity: 1 }, 403, 'https://untrusted.invalid')
await cart({ action: 'add', productId, variantId: 'variant_unrelated', quantity: 1 }, 409)
let result = await cart({ action: 'add', productId, variantId: fixture.variantIds[0], quantity: 1 })
assert.equal(result.cart.count, 1)
assert.match(result.cart.total, /123\.45/)
assert.match(result.cart.items[0].total, /123\.45/)
const cartId = decodeURIComponent(cookie.split('=')[1])
const actual = (await sdk.store.cart.retrieve(cartId)).cart
assert.equal(actual.total, 123.45)
assert.equal(actual.items[0].variant_id, fixture.variantIds[0])
assert.equal(actual.region_id, region.id)
assert.equal(actual.sales_channel_id, publicConfig.channelId)
const lineA = result.cart.items[0].id
result = await cart({ action: 'update', lineId: lineA, quantity: 2 })
assert.match(result.cart.total, /246\.90/)
assert.match(result.cart.items[0].total, /246\.90/)
assert.equal((await cart()).cart.count, 2)
result = await cart({ action: 'add', productId, variantId: fixture.variantIds[1], quantity: 1 })
assert.equal(result.cart.items.length, 2)
assert.match(result.cart.total, /481\.46/)
const lineB = result.cart.items.find(item => item.id !== lineA).id
await cart({ action: 'update', lineId: lineB, quantity: 11 }, 409)
result = await cart({ action: 'remove', lineId: lineA })
assert.equal(result.cart.count, 1)
assert.match(result.cart.total, /234\.56/)
await cart({ action: 'remove', lineId: 'cali_not_in_cart' }, 409)
result = await cart({ action: 'remove', lineId: lineB })
assert.equal(result.cart.items.length, 0)
assert.equal((await cart(undefined, 200, origin, 'ff_medusa_cart_v1=cart_missing_fixture')).cart, null)
const legacy = await fetch(`${origin}/api/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([{ id: productId, quantity: 1 }]) })
assert.equal((await legacy.json()).lines[0].purchasable, false)
for (const url of ['/', '/shop', '/cart', '/account', '/checkout', '/support']) { const response = await fetch(`${origin}${url}`); assert.equal(response.status, 200, url); await response.arrayBuffer() }
for (const url of ['http://localhost:3000/admin', 'http://localhost:9000/app']) { const response = await fetch(url); assert.equal(response.status, 200, url); await response.arrayBuffer() }
console.log('PASS: India/INR, public key/channel product access, Payload association and SSR, real cart create/add/update/remove/totals/persistence, quantity/inventory/origin/variant guards, expired cart recovery, legacy isolation and route smoke checks. No orders or customers created.')
