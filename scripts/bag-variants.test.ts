import { test } from 'node:test'
import assert from 'node:assert/strict'

const data = new Map<string, string>([['studio-cart-v1', JSON.stringify([{ id: 7, quantity: 2 }])]])
Object.assign(globalThis, { localStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) }, window: { addEventListener: () => {} } })
const bag = await import('../apps/storefront/src/lib/bag.ts')
const read = () => JSON.parse(data.get('studio-cart-v1') || '[]') as { id: number; quantity: number; variantId?: number }[]
test('legacy lines migrate and merge only the same variant', () => {
  bag.addToBag(7, 1, 101)
  bag.addToBag(7, 3, 100)
  const before = read()
  assert.equal(before.length, 3)
  bag.resolveLegacySelections(before, [{ id: 7, resolvedVariantId: 100 }])
  assert.deepEqual(read(), [{ id: 7, variantId: 101, quantity: 1 }, { id: 7, variantId: 100, quantity: 5 }])
})
test('quantity, removal and undo target one variant', () => {
  bag.updateQuantity(7, 4, 101)
  const removed = bag.removeFromBag(7, 100)
  assert.deepEqual(read(), [{ id: 7, variantId: 101, quantity: 4 }])
  assert.ok(removed)
  bag.restoreToBag(removed)
  assert.equal(read().find(item => item.variantId === 100)?.quantity, 5)
})
