import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quoteMatches } from '../apps/cms/src/order-quote.ts'
const items = [{ id: 7, variantId: 101, quantity: 2 }]
const lines = [{ ...items[0], odooId: 101, unitPrice: 14500 }]
const quote = [{ ...items[0], resolvedVariantId: 101, unitPricePaise: 14500 }]
test('checkout accepts only the refreshed server-derived configuration and price', () => {
  assert.equal(quoteMatches(items, lines, quote), true)
  assert.equal(quoteMatches(items, [{ ...lines[0], unitPrice: 15500 }], quote), false)
  assert.equal(quoteMatches(items, [{ ...lines[0], odooId: 102 }], quote), false)
  assert.equal(quoteMatches(items, lines, [{ ...quote[0], quantity: 1 }]), false)
  assert.equal(quoteMatches(items, lines, []), false)
})
