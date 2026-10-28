import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveCart, type CartStock } from '../apps/storefront/src/lib/cart-resolution.ts'
const products = [{ id: 7, availability: 'available', price: null, reviewOnly: false }, { id: 8, availability: 'available', price: 200, reviewOnly: true }]
const stock = async (_id: number, variant?: number): Promise<CartStock> => variant === 999 ? { linked: false } : variant === 102 ? { linked: true, id: 102, available: false, price: 2000, quantity: 0, options: [] } : { linked: true, id: 101, available: true, price: 1500, quantity: 3, options: [] }
test('resolves separate variants and excludes invalid, unavailable and review lines', async () => {
  const lines = await resolveCart([{ id: 7, variantId: 101, quantity: 1 }, { id: 7, variantId: 102, quantity: 1 }, { id: 7, variantId: 999, quantity: 1 }, { id: 8, variantId: 101, quantity: 1 }], products, stock)
  assert.deepEqual(lines.map(line => line.purchasable), [true, false, false, false])
  assert.equal(lines[0].total, 1500)
})
test('legacy and explicit lines sharing an Odoo variant share its stock limit', async () => {
  const lines = await resolveCart([{ id: 7, quantity: 2 }, { id: 7, variantId: 101, quantity: 2 }], products, stock)
  assert.deepEqual(lines.map(line => line.purchasable), [false, false])
  assert.equal(lines[0].requested, 4)
})
test('service errors and missing products cannot contribute to subtotal', async () => {
  const lines = await resolveCart([{ id: 7, quantity: 1 }, { id: 99, quantity: 1 }], products, async () => ({ error: true }))
  assert.deepEqual(lines.map(line => line.total), [0, 0])
})
