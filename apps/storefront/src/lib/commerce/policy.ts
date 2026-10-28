export function canUseMedusa(product: { medusaProductId?: string | null; reviewOnly?: boolean | null; purchaseEligible?: boolean | null; availability: string; _status?: string | null }) {
  return !!product.medusaProductId && product._status === 'published' && !product.reviewOnly && product.purchaseEligible !== false && product.availability === 'available'
}
export type CartAction = { action: 'add'; productId: number; variantId: string; quantity: number } | { action: 'update'; lineId: string; quantity: number } | { action: 'remove'; lineId: string }
const quantityValid = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 99
export function parseCartAction(input: unknown): CartAction | null {
  if (!input || typeof input !== 'object') return null
  const body = input as Record<string, unknown>
  if (body.action === 'add' && typeof body.productId === 'number' && Number.isSafeInteger(body.productId) && body.productId > 0 && typeof body.variantId === 'string' && /^variant_[\w-]{1,100}$/.test(body.variantId) && quantityValid(body.quantity)) return body as CartAction
  if ((body.action === 'update' || body.action === 'remove') && typeof body.lineId === 'string' && /^cali_[\w-]{1,100}$/.test(body.lineId) && (body.action === 'remove' || quantityValid(body.quantity))) return body as CartAction
  return null
}
