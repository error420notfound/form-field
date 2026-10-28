import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canUseMedusa, parseCartAction } from '../apps/storefront/src/lib/commerce/policy.ts'
import { formatCommercePrice } from '../apps/storefront/src/lib/commerce/format.ts'
import { canPurchase } from '../apps/storefront/src/lib/purchase-policy.ts'
import { resolveCart } from '../apps/storefront/src/lib/cart-resolution.ts'
import { cartView } from '../apps/storefront/src/lib/commerce/cart.ts'
import type { HttpTypes } from '@medusajs/types'

test('Medusa prices retain major units while legacy purchase policy rejects linked stories', () => {
  assert.match(formatCommercePrice(123.45), /123\.45/)
  const linked = { id: 7, _status: 'published', medusaProductId: 'prod_fixture', price: 12345, availability: 'available' }
  assert.equal(canUseMedusa(linked), true)
  assert.equal(canPurchase(linked), false)
  assert.equal(canUseMedusa({ ...linked, reviewOnly: true }), false)
  assert.equal(canUseMedusa({ ...linked, _status: 'draft' }), false)
  assert.equal(canUseMedusa({ ...linked, purchaseEligible: false }), false)
})
test('legacy bag never asks Odoo for a Medusa-linked product', async () => {
  const lines = await resolveCart([{ id: 7, quantity: 1 }], [{ id: 7, medusaProductId: 'prod_fixture', availability: 'available', price: 100 }], async () => { throw new Error('Odoo must not be called') })
  assert.equal(lines[0].purchasable, false)
  assert.equal(lines[0].total, 0)
})
test('Medusa cart request parsing rejects numeric legacy variants and unsafe quantities', () => {
  assert.ok(parseCartAction({ action: 'add', productId: 7, variantId: 'variant_test', quantity: 1 }))
  for (const quantity of [0, -1, 100, 1.5, '2', NaN]) assert.equal(parseCartAction({ action: 'add', productId: 7, variantId: 'variant_test', quantity }), null)
  assert.equal(parseCartAction({ action: 'add', productId: 7, variantId: 123, quantity: 1 }), null)
  assert.equal(parseCartAction({ action: 'remove', lineId: '../cart' }), null)
  assert.equal(parseCartAction({ action: 'update', lineId: 'cali_test', quantity: 0 }), null)
})
test('missing Medusa line totals are unavailable rather than a zero-priced line', () => {
  const incomplete = { currency_code: 'inr', items: [{ id: 'cali_test', title: 'Fixture', quantity: 1, unit_price: 123.45 }] } as HttpTypes.StoreCart
  assert.throws(() => cartView(incomplete), /Incomplete commerce totals/)
})
