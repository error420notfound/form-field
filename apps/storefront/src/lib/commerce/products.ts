import type { HttpTypes } from '@medusajs/types'
import type { Product } from '../cms'
import { commerceClient, commerceRegionId } from './medusa'
import { formatCommercePrice } from './format'

export const productFields = '+variants.calculated_price,+variants.inventory_quantity'
export type CommerceVariant = { id: string; title: string; sku: string | null; amount: number | null; currency: string; available: boolean }
export type CommerceProductView = { id: string; variants: CommerceVariant[] }

export function variantView(variant: HttpTypes.StoreProductVariant): CommerceVariant {
  const calculated = variant.calculated_price
  const amount = calculated?.currency_code === 'inr' && Number.isFinite(calculated.calculated_amount) ? calculated.calculated_amount : null
  return {
    id: variant.id, title: variant.options?.map(option => `${option.option?.title || 'Option'}: ${option.value}`).join(' · ') || variant.title || 'Default configuration',
    sku: variant.sku || null, amount, currency: 'inr',
    available: amount !== null && (!variant.manage_inventory || !!variant.allow_backorder || (variant.inventory_quantity ?? 0) > 0),
  }
}
export async function commerceProduct(id: string): Promise<CommerceProductView> {
  const { product } = await commerceClient().store.product.retrieve(id, { region_id: commerceRegionId(), fields: productFields })
  return { id: product.id, variants: (product.variants || []).map(variantView) }
}
export async function commerceProducts(offset = 0) {
  return commerceClient().store.product.list({ region_id: commerceRegionId(), fields: productFields, limit: 24, offset })
}
export type ProductComposition = { editorial: Product; commerce: CommerceProductView | null; commerceError: boolean }
export async function composeProduct(editorial: Product): Promise<ProductComposition> {
  if (!editorial.medusaProductId) return { editorial, commerce: null, commerceError: false }
  try { return { editorial, commerce: await commerceProduct(editorial.medusaProductId), commerceError: false } }
  catch { return { editorial, commerce: null, commerceError: true } }
}
export function commercePriceLabel(commerce: CommerceProductView | null) {
  const amounts = commerce?.variants.flatMap(variant => variant.amount === null ? [] : [variant.amount]) || []
  if (!amounts.length) return 'Price unavailable'
  const minimum = Math.min(...amounts)
  return `${new Set(amounts).size > 1 ? 'From ' : ''}${formatCommercePrice(minimum)}`
}
