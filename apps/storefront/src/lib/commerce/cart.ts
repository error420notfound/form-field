import type { HttpTypes } from '@medusajs/types'
import { formatCommercePrice } from './format'
export type CartView = {
  items: { id: string; name: string; variant: string; quantity: number; unitPrice: string; total: string }[]
  subtotal: string; discount: string; tax: string; shipping: string; total: string; count: number
}
export const cartQuery = { fields: '+items.total' }
export function cartView(cart: HttpTypes.StoreCart): CartView {
  const price = (amount: number | undefined) => {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) throw new Error('Incomplete commerce totals.')
    return formatCommercePrice(amount, cart.currency_code)
  }
  return {
    items: (cart.items || []).map(item => ({ id: item.id, name: item.product_title || item.title, variant: item.variant_title || '', quantity: item.quantity, unitPrice: price(item.unit_price), total: price(item.total) })),
    subtotal: price(cart.item_subtotal), discount: price(cart.discount_total), tax: price(cart.tax_total), shipping: price(cart.shipping_total), total: price(cart.total),
    count: (cart.items || []).reduce((count, item) => count + item.quantity, 0),
  }
}
