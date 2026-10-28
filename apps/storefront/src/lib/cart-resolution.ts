import { canPurchase, type PurchaseCandidate } from './purchase-policy.ts'
export type CartSelection = { id: number; quantity: number; variantId?: number }
export type CartStock = { error: true } | { linked: false } | { linked: true; available: boolean; quantity: number; id: number; price: number; options: { attribute: string; value: string }[] }
type Product = PurchaseCandidate & { id: number }
export async function resolveCart<T extends Product>(selections: CartSelection[], products: T[], getStock: (id: number, variantId?: number) => Promise<CartStock>) {
  const resolved = await Promise.all(selections.map(async selection => {
    const product = products.find(item => item.id === selection.id)
    return { selection, product, inventory: product && !product.medusaProductId ? await getStock(product.id, selection.variantId) : null }
  }))
  return resolved.map(({ selection, product, inventory }) => {
    if (!product || !inventory) return { selection, product, inventory, purchasable: false, total: 0, requested: selection.quantity }
    const requested = !('error' in inventory) && inventory.linked ? resolved.reduce((sum, candidate) => sum + (candidate.inventory && !('error' in candidate.inventory) && candidate.inventory.linked && candidate.inventory.id === inventory.id ? candidate.selection.quantity : 0), 0) : selection.quantity
    const purchasable = !('error' in inventory) && inventory.linked && canPurchase({ ...product, price: inventory.price }) && inventory.available && inventory.quantity >= requested
    const total = purchasable && !('error' in inventory) && inventory.linked ? inventory.price * selection.quantity : 0
    return { selection, product, inventory, purchasable, total, requested }
  })
}
