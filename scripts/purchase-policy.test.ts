import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canPurchase } from '../apps/storefront/src/lib/purchase-policy.ts'
test('a published story with unknown price is not a free purchasable object', () => {
  for (const price of [undefined, null])
    assert.equal(
      canPurchase({ price, availability: 'available', purchaseEligible: true }),
      false,
    )
})
test('editorial review and purchase eligibility independently prevent a sale', () => {
  assert.equal(
    canPurchase({
      price: 180000,
      availability: 'available',
      reviewOnly: true,
      purchaseEligible: true,
    }),
    false,
  )
  assert.equal(
    canPurchase({
      price: 180000,
      availability: 'available',
      purchaseEligible: false,
    }),
    false,
  )
})
test('legacy priced available objects remain usable without new fields', () => {
  assert.equal(canPurchase({ price: 180000, availability: 'available' }), true)
  assert.equal(
    canPurchase({
      price: 0,
      availability: 'available',
      purchaseEligible: true,
    }),
    true,
  )
})
test('unavailable objects and malformed prices cannot enter subtotals', () => {
  for (const availability of ['coming-soon', 'unavailable'])
    assert.equal(canPurchase({ price: 180000, availability }), false)
  for (const price of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.equal(canPurchase({ price, availability: 'available' }), false)
})
