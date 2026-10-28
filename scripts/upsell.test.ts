import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Product } from '../apps/cms/src/payload-types'
import { selectUpsellCandidates } from '../apps/storefront/src/lib/upsell'

const product = (id: number, extra: Partial<Product> = {}): Product => ({ id, name: `Object ${id}`, slug: `object-${id}`, shortDescription: '', description: '', availability: 'available', purchaseEligible: true, reviewOnly: false, price: 100, updatedAt: '', createdAt: '', ...extra })
test('configured recommendations preserve order, deduplicate and exclude bag products', () => {
  const products = [product(1, { upsellProducts: [4, 3, 4, 2] }), product(2, { upsellProducts: [3, 5] }), product(3), product(4), product(5)]
  assert.deepEqual(selectUpsellCandidates(products, [1, 2], [1, 2, 5]).map(p => p.id), [4, 3])
})
test('fallback follows catalogue order and excludes unavailable products', () => {
  const products = [product(1), product(2, { reviewOnly: true }), product(3, { price: null }), product(4), product(5, { availability: 'unavailable' }), product(6)]
  assert.deepEqual(selectUpsellCandidates(products, [1], [1, 6]).map(p => p.id), [4])
  assert.deepEqual(selectUpsellCandidates([], [], []), [])
})
test('configured but unavailable recommendations do not silently fall back', () => {
  const products = [product(1, { upsellProducts: [2, 99] }), product(2, { purchaseEligible: false }), product(3)]
  assert.deepEqual(selectUpsellCandidates(products, [1], [1]), [])
})
